import { supabase } from './supabase';

const BUCKET_NAME = 'app-images';

/**
 * Compresses an image by resizing and reducing quality
 * @param base64 - Base64 encoded image data
 * @param maxWidth - Maximum width (height scales proportionally)
 * @param quality - JPEG quality (0-1)
 * @returns Compressed base64 image
 */
export async function compressImage(
  base64: string,
  maxWidth: number = 800,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Scale down if wider than maxWidth
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG with compression
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64;
  });
}

/**
 * Converts base64 to Blob for upload
 */
function base64ToBlob(base64: string): Blob {
  const parts = base64.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const byteString = atob(parts[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mime });
}

/**
 * Uploads an image to Supabase Storage
 * @param base64 - Base64 encoded image
 * @param path - Storage path (e.g., 'recipes/abc123/input.jpg')
 * @returns Public URL of uploaded image
 */
export async function uploadImage(base64: string, path: string): Promise<string | null> {
  try {
    const blob = base64ToBlob(base64);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: blob.type
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    return urlData.publicUrl;
  } catch (e) {
    console.error('Failed to upload image:', e);
    return null;
  }
}

/**
 * Uploads recipe images to Supabase Storage with compression
 * @param recipeId - Unique recipe ID
 * @param inputImage - Base64 input image (optional)
 * @param outputImage - Base64 output image (optional)
 * @returns Object with uploaded image URLs
 */
export async function uploadRecipeImages(
  recipeId: string,
  inputImage?: string | null,
  outputImage?: string | null
): Promise<{
  inputUrl?: string;
  outputUrl?: string;
  coverUrl?: string;
}> {
  const results: { inputUrl?: string; outputUrl?: string; coverUrl?: string } = {};

  try {
    // Upload input image (compressed)
    if (inputImage && inputImage.startsWith('data:')) {
      const compressedInput = await compressImage(inputImage, 800, 0.8);
      const inputUrl = await uploadImage(compressedInput, `recipes/${recipeId}/input.jpg`);
      if (inputUrl) results.inputUrl = inputUrl;
    }

    // Upload output image (compressed)
    if (outputImage && outputImage.startsWith('data:')) {
      const compressedOutput = await compressImage(outputImage, 800, 0.8);
      const outputUrl = await uploadImage(compressedOutput, `recipes/${recipeId}/output.jpg`);
      if (outputUrl) results.outputUrl = outputUrl;

      // Also create a smaller thumbnail for cover
      const thumbnail = await compressImage(outputImage, 400, 0.6);
      const coverUrl = await uploadImage(thumbnail, `recipes/${recipeId}/cover.jpg`);
      if (coverUrl) results.coverUrl = coverUrl;
    }

    return results;
  } catch (e) {
    console.error('Failed to upload recipe images:', e);
    return results;
  }
}
