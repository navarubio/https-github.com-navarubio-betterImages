
import { GoogleGenAI, Modality, Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function processImageWithGemini(prompt: string, imagePart: Part): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // aka 'nano banana'
      contents: {
        parts: [
          imagePart,
          { text: prompt },
        ],
      },
      config: {
        // The response modality must be IMAGE for image generation/editing tasks.
        responseModalities: [Modality.IMAGE],
      },
    });
    
    const candidate = response.candidates?.[0];

    // Check for blockages or lack of response candidates
    if (!candidate) {
        const blockReason = response.promptFeedback?.blockReason;
        if (blockReason) {
            throw new Error(`La solicitud fue bloqueada por políticas de seguridad (${blockReason}). Intenta con otra imagen.`);
        }
        throw new Error("La API no devolvió una respuesta válida (sin candidatos).");
    }
    
    // If the finish reason is not 'STOP', it indicates a problem (e.g., SAFETY, RECITATION, etc.)
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        throw new Error(`El procesamiento no se completó (${candidate.finishReason}). Intenta con otra imagen.`);
    }

    // Find the image part in the response
    const imageResponsePart = candidate.content?.parts?.find(part => part.inlineData);

    if (imageResponsePart && imageResponsePart.inlineData) {
      return imageResponsePart.inlineData.data;
    } else {
      // If no image, check for a text explanation from the model as a last resort
      const textPart = candidate.content?.parts?.find(part => part.text);
      if (textPart?.text) {
        throw new Error(`La API no devolvió una imagen. Mensaje: "${textPart.text}"`);
      }
      
      // Fallback error
      throw new Error("La API no devolvió una imagen procesada por una razón desconocida.");
    }

  } catch (error) {
    console.error('Error completo de la API de Gemini:', error);
    
    if (error instanceof Error) {
        throw error; // Re-throw the original error object with its specific message
    }
    
    // Generic fallback for unexpected errors (e.g., network issues)
    throw new Error('Fallo en la comunicación con la API de Gemini. Revisa tu conexión de red.');
  }
}
