import React from 'react';
import { BackHandler, Platform } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import * as Crypto from 'expo-crypto';
import { DiscoverySearchBar } from '../DiscoverySearchBar';
import { mapApi, MapAutocompletePrediction } from '@/services/map';

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(),
}));

jest.mock('@/services/map', () => ({
  mapApi: {
    autocomplete: jest.fn(),
    getPlaceDetails: jest.fn(),
  },
}));

describe('DiscoverySearchBar', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
  const mockOnSelectLocation = jest.fn();
  let uuidCounter = 1;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    uuidCounter = 1;
    (Crypto.randomUUID as jest.Mock).mockImplementation(() => `session-uuid-${uuidCounter++}`);
  });

  afterEach(() => {
    if (renderer) {
      act(() => {
        renderer?.unmount();
      });
      renderer = null;
    }
    jest.useRealTimers();
  });

  const renderComponent = (
    props: Partial<React.ComponentProps<typeof DiscoverySearchBar>> = {}
  ) => {
    act(() => {
      renderer = ReactTestRenderer.create(
        <DiscoverySearchBar onSelectLocation={mockOnSelectLocation} {...props} />
      );
    });
    return renderer!;
  };

  const getTextInput = (root: ReactTestRenderer.ReactTestInstance) => {
    return root.findByProps({ testID: 'discovery-search-input' });
  };

  // 1. Initial render
  it('renders correctly with placeholder and search icon', () => {
    const component = renderComponent();
    const input = getTextInput(component.root);
    expect(input.props.placeholder).toBe('Tìm địa điểm, khu vực...');
    expect(input.props.value).toBe('');

    // Clear button should not be rendered when query is empty
    const clearButtons = component.root.findAllByProps({ testID: 'discovery-search-clear' });
    expect(clearButtons.length).toBe(0);
  });

  // 2. Minimum query length check (< 2 chars does not trigger search)
  it('does not trigger autocomplete if query length < 2 characters', () => {
    const component = renderComponent();
    const input = getTextInput(component.root);

    act(() => {
      input.props.onChangeText('a');
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mapApi.autocomplete).not.toHaveBeenCalled();
    expect(Crypto.randomUUID).not.toHaveBeenCalled();
  });

  // 3. Debounce behavior (350ms)
  it('debounces autocomplete queries by 350ms and makes a single request', async () => {
    (mapApi.autocomplete as jest.Mock).mockResolvedValueOnce([]);

    const component = renderComponent();
    const input = getTextInput(component.root);

    act(() => {
      input.props.onChangeText('H');
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    act(() => {
      input.props.onChangeText('Ha');
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    act(() => {
      input.props.onChangeText('Hanoi');
    });

    expect(mapApi.autocomplete).not.toHaveBeenCalled();

    // Advance 349ms (still not 350ms since last keystroke)
    act(() => {
      jest.advanceTimersByTime(349);
    });
    expect(mapApi.autocomplete).not.toHaveBeenCalled();

    // Advance 1ms more -> reaches 350ms
    await act(async () => {
      jest.advanceTimersByTime(1);
    });

    expect(mapApi.autocomplete).toHaveBeenCalledTimes(1);
    expect(mapApi.autocomplete).toHaveBeenCalledWith(
      'Hanoi',
      expect.objectContaining({
        sessionToken: 'session-uuid-1',
      })
    );
  });

  // 4. Session Token Lifecycle
  it('reuses the same session token across keystrokes and clears it after selection', async () => {
    const mockPredictions: MapAutocompletePrediction[] = [
      {
        place_id: 'place_123',
        description: 'Hà Nội, Việt Nam',
        main_text: 'Hà Nội',
        secondary_text: 'Việt Nam',
      },
    ];

    (mapApi.autocomplete as jest.Mock).mockResolvedValue(mockPredictions);
    (mapApi.getPlaceDetails as jest.Mock).mockResolvedValue({
      lat: 21.0285,
      lng: 105.8542,
      formatted_address: 'Hà Nội, Việt Nam',
    });

    const component = renderComponent();
    const input = getTextInput(component.root);

    // Keystroke 1: "Ha"
    act(() => {
      input.props.onChangeText('Ha');
    });
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    expect(Crypto.randomUUID).toHaveBeenCalledTimes(1);
    expect(mapApi.autocomplete).toHaveBeenLastCalledWith(
      'Ha',
      expect.objectContaining({
        sessionToken: 'session-uuid-1',
      })
    );

    // Keystroke 2: "Hanoi"
    act(() => {
      input.props.onChangeText('Hanoi');
    });
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    // Session token must NOT have been regenerated
    expect(Crypto.randomUUID).toHaveBeenCalledTimes(1);
    expect(mapApi.autocomplete).toHaveBeenLastCalledWith(
      'Hanoi',
      expect.objectContaining({
        sessionToken: 'session-uuid-1',
      })
    );

    // Select suggestion item
    const suggestionItem = component.root.findByProps({
      testID: 'discovery-search-item-place_123',
    });
    await act(async () => {
      suggestionItem.props.onPress();
    });

    // Verify place details called with same session token
    expect(mapApi.getPlaceDetails).toHaveBeenCalledWith('place_123', 'session-uuid-1');
    expect(mockOnSelectLocation).toHaveBeenCalledWith({
      latitude: 21.0285,
      longitude: 105.8542,
      address: 'Hà Nội, Việt Nam',
    });

    // Start a new search session -> should create a NEW session token
    act(() => {
      input.props.onChangeText('Danang');
    });
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    expect(Crypto.randomUUID).toHaveBeenCalledTimes(2);
    expect(mapApi.autocomplete).toHaveBeenLastCalledWith(
      'Danang',
      expect.objectContaining({
        sessionToken: 'session-uuid-2',
      })
    );
  });

  // 5. Autocomplete Race Condition Guard
  it('discards stale autocomplete responses when a newer request resolves earlier', async () => {
    let resolveFirst: (val: any) => void;
    let resolveSecond: (val: any) => void;

    const promise1 = new Promise(resolve => {
      resolveFirst = resolve;
    });
    const promise2 = new Promise(resolve => {
      resolveSecond = resolve;
    });

    (mapApi.autocomplete as jest.Mock).mockReturnValueOnce(promise1).mockReturnValueOnce(promise2);

    const component = renderComponent();
    const input = getTextInput(component.root);

    // Request 1: "Query1"
    act(() => {
      input.props.onChangeText('Query1');
    });
    act(() => {
      jest.advanceTimersByTime(350);
    });

    // Request 2: "Query2"
    act(() => {
      input.props.onChangeText('Query2');
    });
    act(() => {
      jest.advanceTimersByTime(350);
    });

    const predictions2: MapAutocompletePrediction[] = [
      { place_id: 'p2', description: 'Address 2', main_text: 'Addr 2', secondary_text: '' },
    ];
    const predictions1: MapAutocompletePrediction[] = [
      { place_id: 'p1', description: 'Address 1', main_text: 'Addr 1', secondary_text: '' },
    ];

    // Request 2 resolves first
    await act(async () => {
      resolveSecond!(predictions2);
    });

    expect(
      component.root.findAllByProps({ testID: 'discovery-search-item-p2' }).length
    ).toBeGreaterThan(0);

    // Request 1 resolves afterward
    await act(async () => {
      resolveFirst!(predictions1);
    });

    // Dropdown must STILL show predictions2, predictions1 must be ignored
    expect(
      component.root.findAllByProps({ testID: 'discovery-search-item-p2' }).length
    ).toBeGreaterThan(0);
    expect(component.root.findAllByProps({ testID: 'discovery-search-item-p1' }).length).toBe(0);
  });

  // 6. Selection Race Condition Guard
  it('discards stale place details resolution if a newer selection occurs', async () => {
    let resolveDetailsA: (val: any) => void;
    let resolveDetailsB: (val: any) => void;

    const promiseA = new Promise(resolve => {
      resolveDetailsA = resolve;
    });
    const promiseB = new Promise(resolve => {
      resolveDetailsB = resolve;
    });

    const mockPredictions: MapAutocompletePrediction[] = [
      { place_id: 'place_A', description: 'Address A', main_text: 'A', secondary_text: '' },
      { place_id: 'place_B', description: 'Address B', main_text: 'B', secondary_text: '' },
    ];

    (mapApi.autocomplete as jest.Mock).mockResolvedValue(mockPredictions);
    (mapApi.getPlaceDetails as jest.Mock)
      .mockReturnValueOnce(promiseA)
      .mockReturnValueOnce(promiseB);

    const component = renderComponent();
    const input = getTextInput(component.root);

    act(() => {
      input.props.onChangeText('Place');
    });
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    // User taps suggestion A
    const itemA = component.root.findByProps({ testID: 'discovery-search-item-place_A' });
    act(() => {
      itemA.props.onPress();
    });

    // User refocuses search input to reopen suggestions and taps suggestion B
    act(() => {
      input.props.onFocus();
    });

    const itemB = component.root.findByProps({ testID: 'discovery-search-item-place_B' });
    act(() => {
      itemB.props.onPress();
    });

    // Details B resolves first
    await act(async () => {
      resolveDetailsB!({
        lat: 20.0,
        lng: 105.0,
        formatted_address: 'Address B Resolved',
      });
    });

    expect(mockOnSelectLocation).toHaveBeenCalledTimes(1);
    expect(mockOnSelectLocation).toHaveBeenCalledWith({
      latitude: 20.0,
      longitude: 105.0,
      address: 'Address B Resolved',
    });

    // Details A resolves afterward
    await act(async () => {
      resolveDetailsA!({
        lat: 10.0,
        lng: 100.0,
        formatted_address: 'Address A Resolved',
      });
    });

    // mockOnSelectLocation must NOT have been called with A
    expect(mockOnSelectLocation).toHaveBeenCalledTimes(1);
  });

  // 7. Clear button invalidation
  it('clears state, cancels in-flight requests, and resets session token on clear', async () => {
    let resolveDetails: (val: any) => void;
    const promise = new Promise(resolve => {
      resolveDetails = resolve;
    });

    const mockPredictions: MapAutocompletePrediction[] = [
      {
        place_id: 'place_clear',
        description: 'Test Clear',
        main_text: 'Clear',
        secondary_text: '',
      },
    ];

    (mapApi.autocomplete as jest.Mock).mockResolvedValue(mockPredictions);
    (mapApi.getPlaceDetails as jest.Mock).mockReturnValue(promise);

    const component = renderComponent();
    const input = getTextInput(component.root);

    act(() => {
      input.props.onChangeText('Test');
    });
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    // Select suggestion to put place details in-flight
    const item = component.root.findByProps({ testID: 'discovery-search-item-place_clear' });
    act(() => {
      item.props.onPress();
    });

    // User taps Clear button while in-flight
    const clearButton = component.root.findByProps({ testID: 'discovery-search-clear' });
    act(() => {
      clearButton.props.onPress();
    });

    expect(getTextInput(component.root).props.value).toBe('');

    // In-flight place details resolves
    await act(async () => {
      resolveDetails!({ lat: 21.0, lng: 105.0, formatted_address: 'Late Address' });
    });

    // Callback must NOT have been called
    expect(mockOnSelectLocation).not.toHaveBeenCalled();

    // New search gets a new session token
    act(() => {
      input.props.onChangeText('New Search');
    });
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    expect(Crypto.randomUUID).toHaveBeenCalledTimes(2);
  });

  // 8. Coordinate Validation
  it('rejects invalid coordinates and displays error without calling onSelectLocation', async () => {
    const mockPredictions: MapAutocompletePrediction[] = [
      {
        place_id: 'invalid_coords',
        description: 'Bad Coords',
        main_text: 'Bad',
        secondary_text: '',
      },
    ];

    (mapApi.autocomplete as jest.Mock).mockResolvedValue(mockPredictions);
    (mapApi.getPlaceDetails as jest.Mock).mockResolvedValue({
      lat: 999, // out of range [-90, 90]
      lng: 105.0,
      formatted_address: 'Bad Coordinates Place',
    });

    const component = renderComponent();
    const input = getTextInput(component.root);

    act(() => {
      input.props.onChangeText('Bad');
    });
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    const item = component.root.findByProps({ testID: 'discovery-search-item-invalid_coords' });
    await act(async () => {
      item.props.onPress();
    });

    expect(mockOnSelectLocation).not.toHaveBeenCalled();
    const errorNotice = component.root.findByProps({ testID: 'discovery-search-error-text' });
    expect(errorNotice.props.children).toBe('Tọa độ địa điểm không hợp lệ.');
  });

  // 9. API Error Handling
  it('displays user-friendly error message when autocomplete fails', async () => {
    (mapApi.autocomplete as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const component = renderComponent();
    const input = getTextInput(component.root);

    act(() => {
      input.props.onChangeText('ErrorQuery');
    });
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    const errorNotice = component.root.findByProps({ testID: 'discovery-search-error-text' });
    expect(errorNotice.props.children).toBe('Không thể tải gợi ý. Vui lòng thử lại.');
  });

  // 10. Android BackHandler Integration
  it('closes dropdown on Android back button press if visible', async () => {
    Platform.OS = 'android';
    const backListeners: (() => boolean | null | undefined)[] = [];
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((event, handler) => {
      backListeners.push(handler);
      return {
        remove: jest.fn(),
      } as any;
    });

    const mockPredictions: MapAutocompletePrediction[] = [
      { place_id: 'back_1', description: 'Back Test', main_text: 'Back', secondary_text: '' },
    ];
    (mapApi.autocomplete as jest.Mock).mockResolvedValue(mockPredictions);

    const component = renderComponent();
    const input = getTextInput(component.root);

    act(() => {
      input.props.onChangeText('Back');
    });
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    // Dropdown is visible
    expect(
      component.root.findAllByProps({ testID: 'discovery-search-dropdown' }).length
    ).toBeGreaterThan(0);

    // Fire the registered BackHandler listener
    expect(backListeners.length).toBeGreaterThan(0);
    const handler = backListeners[backListeners.length - 1];
    let handled: boolean | null | undefined = false;
    act(() => {
      handled = handler();
    });

    // Should return true (event was handled by closing dropdown)
    expect(handled).toBe(true);

    // Dropdown is now hidden
    expect(component.root.findAllByProps({ testID: 'discovery-search-dropdown' }).length).toBe(0);
  });

  // 11. Location Bias Passthrough
  it('passes locationBias coordinates and radius to autocomplete', async () => {
    (mapApi.autocomplete as jest.Mock).mockResolvedValue([]);

    const component = renderComponent({
      locationBias: {
        lat: 21.0285,
        lng: 105.8542,
        radius: 10000,
      },
    });
    const input = getTextInput(component.root);

    act(() => {
      input.props.onChangeText('Nearby');
    });
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    expect(mapApi.autocomplete).toHaveBeenCalledWith(
      'Nearby',
      expect.objectContaining({
        lat: 21.0285,
        lng: 105.8542,
        radius: 10000,
      })
    );
  });
});
