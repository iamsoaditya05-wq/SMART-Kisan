
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getLanguageName = (lang: string) => {
  const names: Record<string, string> = { en: 'English', hi: 'Hindi', mr: 'Marathi', pa: 'Punjabi' };
  return names[lang] || 'English';
};

export const getMarketAnalysis = async (cropData: string, lang: string = 'en') => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Language: ${getLanguageName(lang)}. Analyze these crop prices and provide a 7-day prediction and selling advice: ${cropData}. Include a section "XAI Reasoning" explaining why you made this prediction based on market signals.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Market Analysis Error:", error);
    return "Market analysis currently unavailable.";
  }
};

export const analyzeLeafHealth = async (base64Image: string, lang: string = 'en') => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: `Language: ${getLanguageName(lang)}. Identify diseases on this plant leaf and suggest treatments. Include an "XAI Insight" explaining the visual features (spots, yellowing, etc.) that led to this diagnosis.` }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "Image analysis failed.";
  }
};

export const analyzeSatelliteNDVI = async (base64Image: string, lang: string = 'en') => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: `Language: ${getLanguageName(lang)}. This is a satellite NDVI/Multispectral image of a farm. 
          1. Estimate the soil type (Clayey, Sandy, Loamy) based on the color spectrum and visible texture.
          2. Calculate estimated Nitrogen, Phosphorus, and Potassium requirements.
          3. Recommend specific fertilizer types and quantities.
          4. Provide an "XAI Breakdown" explaining how the spectral bands (Red, NIR) indicate these specific nutrient deficiencies.` }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Satellite Analysis Error:", error);
    return "Satellite spectral analysis failed.";
  }
};

export const getFertilizerRecommendation = async (npk: any, cropType: string, lang: string = 'en') => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Language: ${getLanguageName(lang)}. Provide a precise fertilizer recommendation for ${cropType} with NPK: N${npk.n} P${npk.p} K${npk.k}. 
      Explain your logic in a "Scientist's Note (XAI)" explaining the chemical balance needed for this specific soil type.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Fertilizer Advice Error:", error);
    return "Unable to generate recommendations.";
  }
};
