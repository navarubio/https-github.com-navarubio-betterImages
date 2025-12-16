
import type { Part } from '@google/genai';

/**
 * Converts a File object to a base64 encoded string.
 * @param file The file to convert.
 * @returns A promise that resolves with the base64 encoded string.
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        // We only want the base64 data, not the data URL prefix
        const result = reader.result as string;
        resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Converts a File object into a Part object for the Gemini API.
 * @param file The file to convert.
 * @returns A promise that resolves with a Part object.
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
