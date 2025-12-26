
import type { Part } from '@google/genai';

/**
 * Converts a File object to a base64 encoded string.
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Converts a File object into a Part object for the Gemini API.
 */
export async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedData = await fileToBase64(file);
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}

/**
 * Redimensiona una imagen manteniendo la proporción (aspect ratio) para evitar distorsiones.
 * El resultado final es un lienzo de width x height con el producto centrado.
 */
export async function resizeImage(base64Data: string, targetWidth: number, targetHeight: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = `data:image/webp;base64,${base64Data}`;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error("No se pudo obtener el contexto del canvas"));
        return;
      }

      // 1. Fondo blanco puro obligatorio
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      
      // 2. Cálculo de proporciones para evitar distorsión (Lógica "Contain")
      const sourceWidth = img.width;
      const sourceHeight = img.height;
      const ratio = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
      
      const newWidth = sourceWidth * ratio;
      const newHeight = sourceHeight * ratio;
      
      // 3. Centrado exacto en el lienzo
      const x = (targetWidth - newWidth) / 2;
      const y = (targetHeight - newHeight) / 2;
      
      // 4. Dibujo con suavizado de imagen para máxima calidad
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, x, y, newWidth, newHeight);
      
      // 5. Exportación final
      resolve(canvas.toDataURL('image/webp', 1.0));
    };
    img.onerror = (err) => reject(err);
  });
}
