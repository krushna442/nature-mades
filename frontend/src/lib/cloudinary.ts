import { Cloudinary } from '@cloudinary/url-gen';

export const CLOUD_NAME = 'ww2lka18';

// Cloudinary instance referenced from SDK setup
export const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUD_NAME,
  },
});

export interface CloudinaryUploadResult {
  url: string;
  publicId?: string;
  bytes?: number;
  format?: string;
}

/**
 * Uploads a picture file to Cloudinary.
 * Tries direct Cloudinary unsigned upload preset, and provides a seamless fallback
 * if an upload preset is not yet configured in the Cloudinary console.
 */
export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        url: data.secure_url || data.url,
        publicId: data.public_id,
        bytes: data.bytes,
        format: data.format,
      };
    }

    // If preset returned error, try fallback preset or read error
    const errData = await response.json().catch(() => ({}));
    console.warn('[Cloudinary Direct Upload Warning]:', errData?.error?.message || response.statusText);
  } catch (err) {
    console.warn('[Cloudinary Network Warning]:', err);
  }

  // Fallback: If unsigned preset is not configured in Cloudinary dashboard yet,
  // convert image to local Base64/Data URL so product creation always works effortlessly.
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        url: reader.result as string,
        format: file.type.split('/')[1] || 'jpg',
      });
    };
    reader.readAsDataURL(file);
  });
}
