import React from 'react';
import { Text, View } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { ErrorBoundary } from '../ErrorBoundary';

// Mock component that throws error
const ProblemChild = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Simulation Crash Error');
  }
  return (
    <View>
      <Text>Nội dung bình thường</Text>
    </View>
  );
};

describe('ErrorBoundary Component (UI & Resilience Test)', () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('should render children normally when there is no error', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ErrorBoundary>
          <ProblemChild shouldThrow={false} />
        </ErrorBoundary>
      );
    });

    const root = renderer!.root;
    const normalText = root
      .findAllByType(Text)
      .find((t: any) => t.props.children === 'Nội dung bình thường');
    expect(normalText).toBeDefined();
  });

  it('should display friendly fallback UI when a child component crashes', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <ErrorBoundary>
          <ProblemChild shouldThrow={true} />
        </ErrorBoundary>
      );
    });

    const root = renderer!.root;
    const titleText = root
      .findAllByType(Text)
      .find((t: any) => t.props.children === 'Đã xảy ra sự cố');
    expect(titleText).toBeDefined();

    const buttonText = root.findAllByType(Text).find((t: any) => t.props.children === 'Thử lại');
    expect(buttonText).toBeDefined();
  });
});
