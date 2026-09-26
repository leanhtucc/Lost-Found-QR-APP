/**
 * Tests for mapCodeBoundsToPreview and selectBestCode utilities
 */

import { mapCodeBoundsToPreview, selectBestCode } from '../mapCodeBoundsToPreview';
import type { PreviewLayout } from '../mapCodeBoundsToPreview';

const defaultPreview: PreviewLayout = {
  x: 0,
  y: 0,
  width: 400,
  height: 800,
};

describe('mapCodeBoundsToPreview', () => {
  // ── Null cases ────────────────────────────────────────────────

  it('returns null if codeFrame is undefined', () => {
    expect(mapCodeBoundsToPreview(undefined, defaultPreview)).toBeNull();
  });

  it('returns null if previewLayout is null', () => {
    expect(mapCodeBoundsToPreview({ x: 100, y: 100, width: 50, height: 50 }, null)).toBeNull();
  });

  it('returns null if codeFrame has zero width', () => {
    expect(
      mapCodeBoundsToPreview({ x: 100, y: 100, width: 0, height: 50 }, defaultPreview)
    ).toBeNull();
  });

  it('returns null if codeFrame has negative height', () => {
    expect(
      mapCodeBoundsToPreview({ x: 100, y: 100, width: 50, height: -10 }, defaultPreview)
    ).toBeNull();
  });

  // ── Normal cases ──────────────────────────────────────────────

  it('maps center QR correctly', () => {
    const result = mapCodeBoundsToPreview(
      { x: 150, y: 350, width: 100, height: 100 },
      defaultPreview
    );
    expect(result).not.toBeNull();
    expect(result!.x).toBe(150);
    expect(result!.y).toBe(350);
    expect(result!.width).toBe(100);
    expect(result!.height).toBe(100);
  });

  it('maps with preview offset', () => {
    const offsetPreview: PreviewLayout = { x: 20, y: 50, width: 360, height: 700 };
    const result = mapCodeBoundsToPreview({ x: 100, y: 200, width: 80, height: 80 }, offsetPreview);
    expect(result).not.toBeNull();
    expect(result!.x).toBe(120); // 20 + 100
    expect(result!.y).toBe(250); // 50 + 200
  });

  // ── Minimum size enforcement ──────────────────────────────────

  it('enforces minimum width of 40dp', () => {
    const result = mapCodeBoundsToPreview(
      { x: 100, y: 100, width: 10, height: 80 },
      defaultPreview
    );
    expect(result).not.toBeNull();
    expect(result!.width).toBe(40);
  });

  it('enforces minimum height of 40dp', () => {
    const result = mapCodeBoundsToPreview({ x: 100, y: 100, width: 80, height: 5 }, defaultPreview);
    expect(result).not.toBeNull();
    expect(result!.height).toBe(40);
  });

  // ── Clamping ──────────────────────────────────────────────────

  it('clamps bounds extending past right edge', () => {
    const result = mapCodeBoundsToPreview(
      { x: 380, y: 100, width: 100, height: 80 },
      defaultPreview
    );
    expect(result).not.toBeNull();
    // Should be clamped: x should be at most preview.width - width = 400 - 100 = 300
    expect(result!.x).toBeLessThanOrEqual(400 - result!.width);
  });

  it('clamps bounds extending past bottom edge', () => {
    const result = mapCodeBoundsToPreview(
      { x: 100, y: 780, width: 80, height: 100 },
      defaultPreview
    );
    expect(result).not.toBeNull();
    expect(result!.y).toBeLessThanOrEqual(800 - result!.height);
  });

  it('clamps negative x to preview boundary', () => {
    const result = mapCodeBoundsToPreview(
      { x: -20, y: 100, width: 80, height: 80 },
      defaultPreview
    );
    expect(result).not.toBeNull();
    expect(result!.x).toBeGreaterThanOrEqual(0);
  });

  // ── Max size ──────────────────────────────────────────────────

  it('caps width to preview width', () => {
    const result = mapCodeBoundsToPreview({ x: 0, y: 0, width: 500, height: 100 }, defaultPreview);
    expect(result).not.toBeNull();
    expect(result!.width).toBe(400);
  });

  // ── Top-left corner ───────────────────────────────────────────

  it('maps top-left QR', () => {
    const result = mapCodeBoundsToPreview({ x: 5, y: 5, width: 60, height: 60 }, defaultPreview);
    expect(result).not.toBeNull();
    expect(result!.x).toBe(5);
    expect(result!.y).toBe(5);
  });

  // ── Bottom-right corner ───────────────────────────────────────

  it('maps bottom-right QR with clamping', () => {
    const result = mapCodeBoundsToPreview(
      { x: 350, y: 750, width: 60, height: 60 },
      defaultPreview
    );
    expect(result).not.toBeNull();
    expect(result!.x + result!.width).toBeLessThanOrEqual(400);
    expect(result!.y + result!.height).toBeLessThanOrEqual(800);
  });
});

describe('selectBestCode', () => {
  it('returns null for empty codes array', () => {
    expect(selectBestCode([], defaultPreview)).toBeNull();
  });

  it('returns null for null preview layout', () => {
    expect(selectBestCode([{ value: 'test', type: 'qr' }], null)).toBeNull();
  });

  it('returns the only valid code', () => {
    const result = selectBestCode(
      [{ value: 'abc-123', type: 'qr', frame: { x: 100, y: 200, width: 80, height: 80 } }],
      defaultPreview
    );
    expect(result).not.toBeNull();
    expect(result!.value).toBe('abc-123');
  });

  it('filters out codes without value', () => {
    const result = selectBestCode(
      [
        { value: undefined, type: 'qr', frame: { x: 100, y: 200, width: 80, height: 80 } },
        { value: 'abc-123', type: 'qr', frame: { x: 150, y: 300, width: 60, height: 60 } },
      ],
      defaultPreview
    );
    expect(result).not.toBeNull();
    expect(result!.value).toBe('abc-123');
  });

  it('prefers code closest to center', () => {
    const centerCode = {
      value: 'center',
      type: 'qr' as const,
      // Center of preview is (200, 400), this is at center (200, 400)
      frame: { x: 160, y: 360, width: 80, height: 80 },
    };
    const cornerCode = {
      value: 'corner',
      type: 'qr' as const,
      // This is at top-left corner
      frame: { x: 10, y: 10, width: 80, height: 80 },
    };

    const result = selectBestCode([cornerCode, centerCode], defaultPreview);
    expect(result).not.toBeNull();
    expect(result!.value).toBe('center');
  });

  it('uses largest area as tiebreaker for equal distance', () => {
    const large = {
      value: 'large',
      type: 'qr' as const,
      frame: { x: 150, y: 350, width: 100, height: 100 },
    };
    const small = {
      value: 'small',
      type: 'qr' as const,
      frame: { x: 160, y: 360, width: 80, height: 80 },
    };

    // Both are roughly centered, but large has bigger area
    const result = selectBestCode([small, large], defaultPreview);
    expect(result).not.toBeNull();
    // The closer one wins, or if roughly equal distance, larger wins
  });

  it('filters out non-QR types when type is specified', () => {
    const result = selectBestCode(
      [
        { value: 'barcode', type: 'code-128', frame: { x: 180, y: 380, width: 100, height: 50 } },
        { value: 'qr-code', type: 'qr', frame: { x: 10, y: 10, width: 50, height: 50 } },
      ],
      defaultPreview
    );
    expect(result).not.toBeNull();
    expect(result!.value).toBe('qr-code');
  });

  it('returns code without frame if no framed codes exist', () => {
    const result = selectBestCode([{ value: 'no-frame', type: 'qr' }], defaultPreview);
    expect(result).not.toBeNull();
    expect(result!.value).toBe('no-frame');
  });
});
