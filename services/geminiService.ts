import { GoogleGenAI } from "@google/genai";

// Exported interface for grounding sources used by Dashboard and PriceWatcher components.
export interface GroundingSource {
  uri: string;
  title: string;
}

const getLanguageName = (lang: string) => {
  const names: Record<string, string> = { en: 'English', hi: 'Hindi', mr: 'Marathi', pa: 'Punjabi' };
  return names[lang] || 'English';
};

/**
 * Intelligent NPK Analysis & Fertilizer Recommendation
 */
export const getNpkFertilizerAdvice = async (
  n: number, p: number, k: number, 
  crop: string, soilType: string, location: string, 
  lang: string = 'en',
  visionContext?: string
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Using gemini-3-flash-preview for broader search capabilities
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a high-precision scientific NPK analysis for a professional farmer.
      
      IMPORTANT: This analysis is grounded in specific soil properties detected via AI Vision:
      VISION CONTEXT: ${visionContext || "General soil profile"}
      SOIL CLASSIFICATION: ${soilType}
      
      Current Soil Nutrient Levels: Nitrogen: ${n}, Phosphorus: ${p}, Potassium: ${k}.
      Target Crop: ${crop}
      Farm Location: ${location}
      
      Tasks:
      1. ANALYZE: Use Google Search to find current nutrient requirements for ${crop} in ${soilType} at ${location}.
      2. RECOMMENDATION: Suggest the EXACT fertilizer types (e.g., Urea, DAP, MOP) and PRECISE AMOUNTS (e.g., kg/acre).
      3. IMAGE-BASED ADJUSTMENT: Explain how the specific soil texture/composition seen in the image affects this recommendation.
      
      Tone: Scientific and practical.
      Language: ${getLanguageName(lang)}.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini NPK Analysis Error:", error);
    const msg = error?.message || "";
    if (msg.includes("403") || msg.includes("PERMISSION_DENIED") || error?.status === 403) {
      throw new Error("AUTH_REQUIRED: Web Grounding with Search requires a Paid API Key. Please authorize in 'My Profile'.");
    }
    return "The nutrient analysis engine encountered an error. Please check your connection.";
  }
};

/**
 * Soil Vision with Web Grounding
 */
export const detectSoilTypeFromImage = async (base64Image: string, lang: string = 'en') => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: `Analyze this soil sample image. 
          1. Use Google Search to identify common soil types in high-production agricultural regions that look like this.
          2. Estimate the percentage composition of Sand, Silt, and Clay based on visual texture, color, and particle size.
          3. Provide a brief analysis of its drainage and nutrient retention.
          
          OUTPUT FORMAT: 
          Return ONLY a JSON object with these keys: 
          {
            "sand": number,
            "silt": number,
            "clay": number,
            "type": "string",
            "analysis": "string"
          }
          
          Language: ${getLanguageName(lang)}.` }
        ]
      },
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    const text = response.text || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid JSON response from AI");
  } catch (error: any) {
    console.error("Soil Vision Error:", error);
    const msg = error?.message || "";
    if (msg.includes("403") || msg.includes("PERMISSION_DENIED") || error?.status === 403) {
      throw new Error("AUTH_REQUIRED: Soil Vision AI requires a Paid API Key. Please authorize in 'My Profile'.");
    }
    throw error;
  }
};

/**
 * Compare weather for two regions with Google Search grounding.
 */
export const getWeatherFeedback = async (region1: string, region2: string, lang: string = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Compare weather for ${region1} and ${region2} in ${getLanguageName(lang)}.`,
    config: { tools: [{ googleSearch: {} }] },
  });

  const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => chunk.web)
    ?.filter((web: any) => web)
    ?.map((web: any) => ({ uri: web.uri, title: web.title })) || [];

  return { text: response.text, sources };
};

export const getMarketAnalysis = async (cropData: string, lang: string = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze crop data ${cropData} in ${getLanguageName(lang)}.`,
  });
  return { text: response.text, sources: [] };
};

/**
 * Fetch mandi prices with Google Search grounding.
 */
export const getLiveMarketPrices = async (crop: string, region: string, lang: string = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Fetch mandi prices for ${crop} in ${region} in ${getLanguageName(lang)}.`,
    config: { tools: [{ googleSearch: {} }] },
  });

  const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => chunk.web)
    ?.filter((web: any) => web)
    ?.map((web: any) => ({ uri: web.uri, title: web.title })) || [];

  return { text: response.text, sources };
};

/**
 * Find nearby resources using Google Maps grounding.
 */
export const getNearbyAgriResources = async (lat: number, lng: number, type: string, lang: string = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Find ${type} near ${lat}, ${lng} in ${getLanguageName(lang)}.`,
    config: { 
      tools: [{ googleMaps: {} }], 
      toolConfig: { 
        retrievalConfig: { 
          latLng: { latitude: lat, longitude: lng } 
        } 
      } 
    },
  });

  const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => chunk.maps)
    ?.filter((maps: any) => maps)
    ?.map((maps: any) => ({ uri: maps.uri, title: maps.title })) || [];

  return { text: response.text, sources };
};

export const getFertilizerRecommendation = async (npk: any, cropType: string, lang: string = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Recommend fertilizer for ${cropType} with NPK ${JSON.stringify(npk)} in ${getLanguageName(lang)}.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  return response.text;
};