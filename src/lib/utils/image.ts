const MAX_IMAGE_SIZE = 1024 * 1024;

export async function compressImage(file: File, maxSize: number = MAX_IMAGE_SIZE): Promise<Blob> {
  if (file.size <= maxSize) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const { width, height } = bitmap;

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(bitmap, 0, 0);

  let quality = 0.9;
  let result: Blob | null = null;

  while (quality > 0.1) {
    result = await new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        file.type,
        quality
      );
    });

    if (!result) {
      throw new Error('Failed to compress image');
    }

    if (result.size <= maxSize) {
      break;
    }

    quality -= 0.1;
  }

  if (!result || result.size > maxSize) {
    throw new Error('Could not compress image to target size');
  }

  return result;
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
