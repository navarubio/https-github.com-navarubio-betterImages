
import { GoogleGenAI, Part } from "@google/genai";

// Inicialización directa y limpia
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function processImageWithGemini(prompt: string, imagePart: Part): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [
          imagePart,
          { text: prompt },
        ],
      },
    });
    
    const candidate = response.candidates?.[0];

    if (!candidate) {
      throw new Error("No se recibió respuesta de la IA. Intenta con una imagen más clara.");
    }
    
    // Buscamos la parte que contiene los datos de la imagen
    const imageResponsePart = candidate.content?.parts?.find(part => part.inlineData);

    if (imageResponsePart && imageResponsePart.inlineData) {
      return imageResponsePart.inlineData.data;
    } else {
      throw new Error("La IA no generó una imagen de salida. Verifica el formato del archivo.");
    }

  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(error instanceof Error ? error.message : 'Error en la conexión con la IA.');
  }
}
