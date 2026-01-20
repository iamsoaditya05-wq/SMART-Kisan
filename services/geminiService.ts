
import { GoogleGenAI, Type } from "@google/genai";

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
 * Predict Crop Yield Outcome based on current data
 */
export const predictYieldOutcome = async (
  n: number, p: number, k: number, moisture: number, ph: number,
  crop: string, soilType: string, location: string, 
  lang: string = 'en'
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As an expert agronomist, predict the yield outcome for ${crop} at ${location}.
      Current Parameters: N: ${n}, P: ${p}, K: ${k}, Moisture: ${moisture}%, pH: ${ph}.
      Soil Type: ${soilType}.
      
      Tasks:
      1. Provide a predicted yield in tons per acre.
      2. Explain the limiting factors based on the NPK and pH values.
      3. Suggest 2 corrective actions to maximize yield.
      
      Use Google Search for current benchmark yields of ${crop} in ${location}.
      Language: ${getLanguageName(lang)}.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Yield Prediction Error:", error);
    return "Yield prediction unavailable. Check sensors and API key.";
  }
};

/**
 * Crop / Leaf Health Analysis
 */
export const analyzeCropHealth = async (base64Image: string, lang: string = 'en') => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: `Analyze this crop/leaf image for agricultural health.
          Identify:
          1. Health Status: Healthy, Stressed, or Diseased.
          2. Signs of pests, nutrient deficiency, or water stress.
          3. Actionable advice to restore health.
          
          Format the output as a structured JSON object with keys: "status", "analysis", "confidence_pct", and "recommendations" (array).
          Language: ${getLanguageName(lang)}.` }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Crop Health Analysis Error:", error);
    throw error;
  }
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
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a high-precision scientific NPK analysis for a professional farmer.
      
      CONTEXT FROM SOIL IMAGE ANALYSIS: ${visionContext || "Standard soil profile"}
      DETECTED SOIL TYPE: ${soilType}
      
      Current Soil Nutrient Levels: Nitrogen: ${n}, Phosphorus: ${p}, Potassium: ${k}.
      Target Crop: ${crop}
      Farm Location: ${location}
      
      Tasks:
      1. ANALYZE: Use Google Search to find specific nutrient requirements for ${crop} in ${soilType} at ${location}.
      2. RECOMMENDATION: Based on the image analysis and current NPK readings, suggest the EXACT fertilizer types and PRECISE AMOUNTS (e.g., kg per acre).
      
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
      throw new Error("AUTH_REQUIRED: Web Grounding with Search requires a billable API Key. Please authorize a paid key in 'My Profile'.");
    }
    return "The nutrient analysis engine encountered an error.";
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
          1. Use Google Search to identify common soil types that look like this.
          2. Estimate percentage composition of Sand, Silt, and Clay.
          
          OUTPUT FORMAT: JSON { "sand": number, "silt": number, "clay": number, "type": "string", "analysis": "string" }
          Language: ${getLanguageName(lang)}.` }
        ]
      },
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    const text = response.text || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("Invalid JSON response");
  } catch (error: any) {
    console.error("Soil Vision Error:", error);
    if (error?.status === 403) throw new Error("AUTH_REQUIRED");
    throw error;
  }
};

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
