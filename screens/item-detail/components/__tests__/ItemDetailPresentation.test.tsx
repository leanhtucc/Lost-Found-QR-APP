import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { ItemDetailHeader } from '../ItemDetailHeader';
import { QRCodeCard } from '../QRCodeCard';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
}));

jest.mock('react-native-qrcode-svg', () => 'QRCode');
jest.mock('react-native-view-shot', () => 'ViewShot');
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

describe('Item Detail presentation contract', () => {
  it('does not display the internal item id in the header', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(<ItemDetailHeader onDelete={jest.fn()} />);
    });

    const texts = renderer!.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('Chi tiết món đồ');
    expect(texts.join(' ')).not.toContain('internal-item-id');
  });

  it('uses the truthful QR share button label and hides the raw QR identifier', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <QRCodeCard itemId="private-looking-qr-id" itemName="Ví da" />
      );
    });

    const texts = renderer!.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('Chia sẻ mã QR');
    expect(texts.join(' ')).not.toContain('private-looking-qr-id');
    expect(texts.join(' ')).not.toContain('Đã lưu mã QR');
  });
});
