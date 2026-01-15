
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getLanguageName = (lang: string) => {
  const names: Record<string, string> = { en: 'English', hi: 'Hindi', mr: 'Marathi', pa: 'Punjabi' };
  return names[lang] || 'English';
};

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface GeminiResponse {
  text: string;
  sources: GroundingSource[];
}

export const getMarketAnalysis = async (cropData: string, lang: string = 'en') => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Language: ${getLanguageName(lang)}. Analyze these crop prices and provide a 7-day prediction and selling advice: ${cropData}. Include a section "XAI Reasoning" explaining why you made this prediction based on market signals.`,
    });
    return { text: response.text || "Market analysis currently unavailable.", sources: [] };
  } catch (error) {
    console.error("Gemini Market Analysis Error:", error);
    return { text: "Market analysis currently unavailable.", sources: [] };
  }
};

export const getLiveMarketPrices = async (crop: string, region: string, lang: string = 'en'): Promise<GeminiResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for the latest, real-time market (mandi) prices for ${crop} in ${region}, India for today. Provide a summary in ${getLanguageName(lang)}. Include current price, change from yesterday, and any relevant market news.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources: GroundingSource[] = [];
    response.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({ title: chunk.web.title, uri: chunk.web.uri });
      }
    });

    return {
      text: response.text || "Unable to fetch live data.",
      sources: sources
    };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return { text: "Failed to connect to real-time market data.", sources: [] };
  }
};

export const getNearbyAgriResources = async (lat: number, lng: number, resourceType: string, lang: string = 'en'): Promise<GeminiResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite-latest',
      contents: `Find the 3 nearest ${resourceType} (e.g., Soil Testing Labs, Government Mandis, or Fertilizer Wholesalers) near my location. Provide their names, estimated distance, and why they are recommended. Response in ${getLanguageName(lang)}.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      },
    });

    const sources: GroundingSource[] = [];
    response.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((chunk: any) => {
      if (chunk.maps) {
        sources.push({ title: chunk.maps.title, uri: chunk.maps.uri });
      }
    });

    return {
      text: response.text || "No nearby resources found.",
      sources: sources
    };
  } catch (error) {
    console.error("Gemini Maps Error:", error);
    return { text: "Unable to find nearby resources.", sources: [] };
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
