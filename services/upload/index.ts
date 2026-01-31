/**
 * Upload API Service
 * Handles file upload operations
 */

import { authStorage } from '@storage/auth';
import { getApiUrl } from '@constants/environment';

// Get API URL from environment
const getUploadUrl = (): string => `${getApiUrl()}/api/upload`;

// ==================== TYPES ====================

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: UploadedFile;
  timestamp?: string;
}

export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedBy: string;
}

export interface UploadError {
  success: false;
  message: string;
  timestamp: string;
}

// Validation constants
export const UPLOAD_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp'],
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Validate file before upload
 */
export const validateFile = (
  uri: string,
  fileSize?: number,
  mimeType?: string
): { isValid: boolean; error?: string } => {
  // Check file size if provided
  if (fileSize && fileSize > UPLOAD_LIMITS.MAX_SIZE) {
    return {
      isValid: false,
      error: `File quá lớn. Kích thước tối đa cho phép là ${UPLOAD_LIMITS.MAX_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Check file type if provided
  if (mimeType && !UPLOAD_LIMITS.ALLOWED_TYPES.includes(mimeType.toLowerCase())) {
    return {
      isValid: false,
      error: 'Định dạng file không hợp lệ. Chỉ chấp nhận JPEG, PNG và WebP',
    };
  }

  // Check extension from URI
  const extension = uri.split('.').pop()?.toLowerCase();
  if (extension && !UPLOAD_LIMITS.ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: 'Định dạng file không hợp lệ. Chỉ chấp nhận JPEG, PNG và WebP',
    };
  }

  return { isValid: true };
};

/**
 * Get file name from URI
 */
const getFileName = (uri: string): string => {
  const parts = uri.split('/');
  return parts[parts.length - 1] || `image_${Date.now()}.jpg`;
};

/**
 * Get MIME type from file extension
 */
const getMimeType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
};

// ==================== API FUNCTIONS ====================

export const uploadApi = {
  /**
   * Upload an image file
   * @param uri - Local file URI from image picker
   * @returns Promise with upload response containing the uploaded file URL
   */
  async uploadImage(uri: string): Promise<UploadResponse> {
    try {
      const uploadUrl = `${getUploadUrl()}/image`;

      // DEBUG: Log API URL
      console.log('=== UPLOAD DEBUG ===');
      console.log('API Base URL:', getApiUrl());
      console.log('Upload URL:', uploadUrl);
      console.log('File URI:', uri);

      // Get auth token
      const token = await authStorage.getAccessToken();
      console.log('Has Token:', !!token);

      // Create form data
      const formData = new FormData();
      const fileName = getFileName(uri);
      const mimeType = getMimeType(fileName);

      console.log('File Name:', fileName);
      console.log('MIME Type:', mimeType);

      // Append file to form data
      // React Native requires this specific format for file uploads
      formData.append('image', {
        uri: uri,
        name: fileName,
        type: mimeType,
      } as unknown as Blob);

      console.log('Making fetch request to:', uploadUrl);

      // Make upload request
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // Note: Don't set Content-Type manually for multipart/form-data
          // fetch will set it automatically with the correct boundary
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Upload thất bại',
        };
      }

      return data;
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Lỗi kết nối khi upload ảnh',
      };
    }
  },

  /**
   * Delete an uploaded image
   * @param filename - The filename to delete (not full URL)
   * @returns Promise with delete response
   */
  async deleteImage(filename: string): Promise<UploadResponse> {
    try {
      const deleteUrl = `${getUploadUrl()}/${filename}`;

      const token = await authStorage.getAccessToken();

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Xóa ảnh thất bại',
        };
      }

      return data;
    } catch (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Lỗi kết nối khi xóa ảnh',
      };
    }
  },

  /**
   * Get full URL for an uploaded image
   * @param relativePath - The relative path returned from upload API (e.g., "/public/uploads/...")
   * @returns Full URL to the image
   */
  getImageUrl(relativePath: string): string {
    if (!relativePath) return '';
    // If already a full URL, return as is
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    // Otherwise, prepend base URL
    return `${getApiUrl()}${relativePath}`;
  },
};

export default uploadApi;
