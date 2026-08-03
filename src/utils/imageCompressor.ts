/**
 * Compresses base64 image data URLs using HTML Canvas to keep payload size lightweight
 * and prevent LocalStorage QuotaExceeded errors.
 */
export async function compressImageDataUrl(
  dataUrl: string,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.82
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return dataUrl; // Return as-is if not a base64 image (e.g. pdf or external url)
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        // Fill white background for transparent PNGs converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
      } catch (err) {
        console.warn('Failed to compress image:', err);
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

/**
 * Strips or compresses documents across a CampaignUser object if storage space is tight.
 */
export async function optimizeUserDocuments(user: any): Promise<any> {
  if (!user.documents) return user;

  const optimizedDocs = { ...user.documents };

  for (const docKey of Object.keys(optimizedDocs)) {
    const doc = optimizedDocs[docKey];
    if (doc && doc.dataUrl && doc.dataUrl.startsWith('data:image/')) {
      doc.dataUrl = await compressImageDataUrl(doc.dataUrl, 800, 800, 0.6);
    }
  }

  return { ...user, documents: optimizedDocs };
}
