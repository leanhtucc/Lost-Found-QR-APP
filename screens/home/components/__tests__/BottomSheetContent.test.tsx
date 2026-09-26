import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { BottomSheetContent } from '../BottomSheetContent';

const baseProps = {
  cards: [],
  myLostCount: 0,
  nearbyCount: 0,
  onSelectItem: jest.fn(),
};

const renderContent = (props: Partial<React.ComponentProps<typeof BottomSheetContent>> = {}) => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    renderer = ReactTestRenderer.create(<BottomSheetContent {...baseProps} {...props} />);
  });
  return renderer!;
};

const textValues = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  renderer.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .flat(Infinity);

describe('Home BottomSheetContent states', () => {
  it('renders loading without rendering the empty state', () => {
    const texts = textValues(renderContent({ isRadarLoading: true }));
    expect(texts).toContain('Đang quét đồ thất lạc trong bán kính 10 km...');
    expect(texts).not.toContain('Không có vật phẩm gần bạn');
  });

  it('renders empty only after loading completes', () => {
    const texts = textValues(renderContent());
    expect(texts).toContain('Không có vật phẩm gần bạn');
  });

  it('uses the accurate disconnected radar label', () => {
    const texts = textValues(renderContent({ isRealtimeConnected: false }));
    expect(texts).toContain('Radar tạm ngắt');
    expect(texts).not.toContain('Ngoại tuyến');
  });

  it('renders an error state instead of an empty state when refresh failed', () => {
    const texts = textValues(renderContent({ hasError: true }));
    expect(texts).toContain('Không thể tải dữ liệu Radar');
    expect(texts).not.toContain('Không có vật phẩm gần bạn');
  });
});
