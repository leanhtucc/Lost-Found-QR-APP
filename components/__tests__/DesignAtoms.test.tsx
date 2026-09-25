import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { StatusBadge } from '../atoms/StatusBadge';
import { LoadingState } from '../atoms/LoadingState';
import { EmptyState } from '../atoms/EmptyState';
import { ErrorState } from '../atoms/ErrorState';
import { Typography } from '../atoms/Typography';

describe('Design Atoms (Foundational UI Components)', () => {
  describe('StatusBadge', () => {
    it('renders correct labels for each status', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;

      act(() => {
        renderer = ReactTestRenderer.create(
          <>
            <StatusBadge status="SAFE" />
            <StatusBadge status="LOST" />
            <StatusBadge status="FOUND" />
            <StatusBadge status="RESOLVED" />
            <StatusBadge status="PENDING_PAYMENT" />
          </>
        );
      });

      const textNodes = renderer!.root.findAllByType(Text).map((t: any) => t.props.children);
      expect(textNodes).toContain('An toàn');
      expect(textNodes).toContain('Báo mất');
      expect(textNodes).toContain('Nhặt được');
      expect(textNodes).toContain('Đã hoàn trả');
      expect(textNodes).toContain('Chờ thanh toán');
    });
  });

  describe('LoadingState', () => {
    it('renders custom loading message', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;

      act(() => {
        renderer = ReactTestRenderer.create(<LoadingState message="Đang tải dữ liệu radar..." />);
      });

      const text = renderer!.root
        .findAllByType(Text)
        .find((t: any) => t.props.children === 'Đang tải dữ liệu radar...');
      expect(text).toBeDefined();
    });
  });

  describe('EmptyState', () => {
    it('renders title, description and triggers action button', () => {
      const handleAction = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;

      act(() => {
        renderer = ReactTestRenderer.create(
          <EmptyState
            title="Chưa có dữ liệu"
            description="Hãy thử quét lại khu vực"
            actionTitle="Làm mới"
            onAction={handleAction}
          />
        );
      });

      const titleNode = renderer!.root
        .findAllByType(Text)
        .find((t: any) => t.props.children === 'Chưa có dữ liệu');
      const descNode = renderer!.root
        .findAllByType(Text)
        .find((t: any) => t.props.children === 'Hãy thử quét lại khu vực');
      const actionText = renderer!.root
        .findAllByType(Text)
        .find((t: any) => t.props.children === 'Làm mới');

      expect(titleNode).toBeDefined();
      expect(descNode).toBeDefined();
      expect(actionText).toBeDefined();
    });
  });

  describe('ErrorState', () => {
    it('renders error message and retry action', () => {
      const handleRetry = jest.fn();
      let renderer: ReactTestRenderer.ReactTestRenderer;

      act(() => {
        renderer = ReactTestRenderer.create(
          <ErrorState
            message="Kết nối máy chủ thất bại"
            retryTitle="Thử kết nối lại"
            onRetry={handleRetry}
          />
        );
      });

      const msgNode = renderer!.root
        .findAllByType(Text)
        .find((t: any) => t.props.children === 'Kết nối máy chủ thất bại');
      const retryNode = renderer!.root
        .findAllByType(Text)
        .find((t: any) => t.props.children === 'Thử kết nối lại');

      expect(msgNode).toBeDefined();
      expect(retryNode).toBeDefined();
    });
  });

  describe('Typography', () => {
    it('renders sectionTitle variant correctly', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;

      act(() => {
        renderer = ReactTestRenderer.create(
          <Typography variant="sectionTitle">Tiêu đề phân mục</Typography>
        );
      });

      const textNode = renderer!.root.findByType(Text);
      expect(textNode.props.children).toBe('Tiêu đề phân mục');
    });
  });
});
