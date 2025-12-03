import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// Note: In a real production app, this call would be proxied through a backend to protect the API Key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateSalonDescription = async (salonName: string, services: string[]): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Escreva uma descrição curta, atraente e profissional para um salão de beleza chamado "${salonName}". 
    O salão oferece os seguintes serviços: ${services.join(', ')}. 
    A descrição deve ter no máximo 300 caracteres e focar na qualidade e experiência do cliente.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Venha conhecer nosso espaço e aproveitar nossos serviços de qualidade.";
  } catch (error) {
    console.error("Erro ao gerar descrição com Gemini:", error);
    return "Um espaço dedicado à sua beleza e bem-estar.";
  }
};
