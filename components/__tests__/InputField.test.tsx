import React from 'react';
import { TextInput, Text } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { InputField } from '../InputField';

describe('InputField Component (UI Test)', () => {
  it('should render label and placeholder correctly', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <InputField label="Tên tài sản" placeholder="Nhập tên ví hoặc laptop..." />
      );
    });

    const root = renderer!.root;
    const labelText = root.findAllByType(Text).find((t: any) => t.props.children === 'Tên tài sản');
    const input = root.findByType(TextInput);

    expect(labelText).toBeDefined();
    expect(input.props.placeholder).toBe('Nhập tên ví hoặc laptop...');
  });

  it('should render error message when error prop is provided', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <InputField label="Email" error="Vui lòng nhập email hợp lệ" />
      );
    });

    const root = renderer!.root;
    const errorText = root
      .findAllByType(Text)
      .find((t: any) => t.props.children === 'Vui lòng nhập email hợp lệ');

    expect(errorText).toBeDefined();
    expect(errorText?.props.children).toBe('Vui lòng nhập email hợp lệ');
  });

  it('should handle text changes via onChangeText', () => {
    const handleChangeText = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <InputField placeholder="Nhập số điện thoại" onChangeText={handleChangeText} />
      );
    });

    const input = renderer!.root.findByType(TextInput);
    act(() => {
      input.props.onChangeText('0912345678');
    });

    expect(handleChangeText).toHaveBeenCalledWith('0912345678');
  });
});
