import { extractItemId } from './scanPayload';

export interface QRBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PreviewLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Maps QR code bounds from VisionCamera Code.frame to screen coordinates.
 *
 * Since VisionCamera v4 returns Code.frame in preview-relative dp,
 * we only need to offset by the preview's position on screen
 * and clamp to preview boundaries.
 *
 * @param codeFrame - The frame of the detected code from VisionCamera.
 * @param previewLayout - The layout of the camera preview view.
 * @returns The screen-relative bounds of the QR code, or null if invalid.
 */
export function mapCodeBoundsToPreview(
  codeFrame: { x: number; y: number; width: number; height: number } | undefined,
  previewLayout: PreviewLayout | null
): QRBounds | null {
  if (!codeFrame || !previewLayout) {
    return null;
  }

  if (codeFrame.width <= 0 || codeFrame.height <= 0) {
    return null;
  }

  const screenX = previewLayout.x + codeFrame.x;
  const screenY = previewLayout.y + codeFrame.y;
  let width = codeFrame.width;
  let height = codeFrame.height;

  // Apply minimum size constraint (e.g., 40dp) to avoid tiny frames
  if (width < 40) width = 40;
  if (height < 40) height = 40;

  // Maximum size constraint (don't exceed preview dimensions)
  if (width > previewLayout.width) width = previewLayout.width;
  if (height > previewLayout.height) height = previewLayout.height;

  // Clamp to ensure bounds don't extend outside preview area
  const clampedX = Math.max(
    previewLayout.x,
    Math.min(screenX, previewLayout.x + previewLayout.width - width)
  );
  const clampedY = Math.max(
    previewLayout.y,
    Math.min(screenY, previewLayout.y + previewLayout.height - height)
  );

  return {
    x: clampedX,
    y: clampedY,
    width,
    height,
  };
}

/**
 * Select the best QR code from multiple detections.
 * Policy: prefer valid FindBack QR closest to center, fallback to largest.
 *
 * @param codes - Array of detected codes from VisionCamera.
 * @param previewLayout - The layout of the camera preview view.
 * @returns The best matching code or null.
 */
export function selectBestCode(
  codes: {
    value?: string;
    frame?: { x: number; y: number; width: number; height: number };
    type?: string;
  }[],
  previewLayout: PreviewLayout | null
): { value: string; frame?: { x: number; y: number; width: number; height: number } } | null {
  if (!codes || codes.length === 0 || !previewLayout) {
    return null;
  }

  const previewCenterX = previewLayout.width / 2;
  const previewCenterY = previewLayout.height / 2;

  let bestCode = null;
  let minDistance = Infinity;
  let maxArea = -1;

  for (const code of codes) {
    if (!code.value) continue;

    // Filter to QR type codes if type info available
    if (code.type && code.type !== 'qr') continue;

    // Only consider valid FindBack payloads — never lock onto / emit a
    // foreign QR when a valid one is present in frame.
    if (!extractItemId(code.value)) continue;

    const hasFrame = code.frame && code.frame.width > 0 && code.frame.height > 0;

    if (hasFrame) {
      const codeCenterX = code.frame!.x + code.frame!.width / 2;
      const codeCenterY = code.frame!.y + code.frame!.height / 2;

      const distance = Math.sqrt(
        Math.pow(codeCenterX - previewCenterX, 2) + Math.pow(codeCenterY - previewCenterY, 2)
      );
      const area = code.frame!.width * code.frame!.height;

      if (distance < minDistance) {
        minDistance = distance;
        maxArea = area;
        bestCode = code;
      } else if (distance === minDistance && area > maxArea) {
        // Tiebreak: prefer larger bounding box
        maxArea = area;
        bestCode = code;
      }
    } else if (!bestCode) {
      bestCode = code;
    }
  }

  return bestCode as {
    value: string;
    frame?: { x: number; y: number; width: number; height: number };
  } | null;
}
