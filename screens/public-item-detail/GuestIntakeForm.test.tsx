import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { GuestIntakeForm } from './GuestIntakeForm';

describe('GuestIntakeForm', () => {
  it('requires a valid phone number and consent before starting guest intake', () => {
    const onSubmit = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <GuestIntakeForm loading={false} error={null} onSubmit={onSubmit} onCancel={jest.fn()} />
      );
    });
    const root = renderer!.root;
    const input = root.findByProps({ accessibilityLabel: 'Số điện thoại' });
    const submit = root.findByProps({ accessibilityLabel: 'Tạo phiên khách' });

    act(() => submit.props.onPress());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(root.findByProps({ accessibilityRole: 'alert' }).props.children).toContain(
      'số điện thoại'
    );

    act(() => input.props.onChangeText('0901234567'));
    act(() => submit.props.onPress());
    expect(onSubmit).not.toHaveBeenCalled();

    const consent = root.findByProps({ accessibilityLabel: 'Đồng ý chia sẻ số điện thoại' });
    act(() => consent.props.onPress());
    act(() => submit.props.onPress());
    expect(onSubmit).toHaveBeenCalledWith('0901234567');
  });

  it('shows the API error and keeps a retry action available', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <GuestIntakeForm
          loading={false}
          error="Mạng không ổn định"
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
        />
      );
    });
    expect(renderer!.root.findByProps({ accessibilityRole: 'alert' }).props.children).toBe(
      'Mạng không ổn định'
    );
    expect(
      renderer!.root.findByProps({ accessibilityLabel: 'Thử lại tạo phiên khách' })
    ).toBeDefined();
  });
});
