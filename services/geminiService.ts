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
 * Deep Reinforcement Learning Agent for Task Generation
 * Analyzes web data, weather patterns, and farm state to suggest reward-based tasks.
 */
export const getRLDailyTasks = async (
  location: string = 'Bhopal, Madhya Pradesh',
  crop: string = 'Soybean',
  soilType: string = 'Black Soil',
  lang: string = 'en'
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a Deep Reinforcement Learning (DRL) agent optimizing farm management at ${location}.
      Target: Maximize yield and soil health while minimizing resource waste.
      Context: Crop: ${crop}, Soil: ${soilType}, Region: Central/Western India.
      
      Tasks:
      1. Use Google Search to find current weather-based risks (e.g., pests, heatwaves, rainfall) for ${location} today.
      2. Generate 4 highly specific daily tasks for the farmer.
      3. Assign a 'points' value (10-50) to each task based on its difficulty and impact.
      
      Return a JSON array of objects with keys: "title", "description", "points", "category".
      Categories: "irrigation", "soil", "pesticide", "market".
      Language: ${getLanguageName(lang)}.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              points: { type: Type.NUMBER },
              category: { type: Type.STRING }
            },
            required: ["title", "description", "points", "category"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("DRL Task Generation Error:", error);
    return [];
  }
};

/**
 * Predict Crop Yield Outcome based on current data and real-time pattern recognition
 */
export const predictYieldOutcome = async (
  n: number, p: number, k: number, moisture: number, ph: number,
  crop: string, soilType: string, location: string = 'Bhopal, Madhya Pradesh', 
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
      1. ANALYZE PATTERNS: Recognize historical yield patterns for ${location} and compare with current sensor data.
      2. PREDICT: Provide a predicted yield in tons per acre based on these real-time patterns.
      3. Explain the limiting factors based on the NPK and pH values specifically for Central/Western India conditions.
      4. Suggest 2 corrective actions.
      
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
 * Crop / Leaf Health Analysis with Pattern Recognition
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
          2. Pattern Recognition: Detect visual patterns indicative of specific local pests or nutrient deficiencies common in Central/Western India.
          3. Actionable advice.
          
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
 * Intelligent NPK Analysis & Fertilizer Recommendation with Pattern Tracking
 */
export const getNpkFertilizerAdvice = async (
  n: number, p: number, k: number, 
  crop: string, soilType: string, location: string = 'Bhopal, Madhya Pradesh', 
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
      1. PATTERN RECOGNITION: Identify nutrient depletion patterns typical for ${soilType} in the ${location} region.
      2. ANALYZE: Use Google Search to find specific nutrient requirements for ${crop} at ${location}.
      3. RECOMMENDATION: Suggest the EXACT fertilizer types and PRECISE AMOUNTS.
      
      Tone: Scientific and practical.
      Language: ${getLanguageName(lang)}.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini NPK Analysis Error:", error);
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
          1. Use Google Search to identify common soil types in Central India (MP/Maharashtra) that look like this.
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
    throw error;
  }
};

export const getWeatherFeedback = async (region1: string, region2: string, lang: string = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Compare real-time weather and climate patterns for ${region1} and ${region2} in ${getLanguageName(lang)}. Include pattern recognition for rainfall trends.`,
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
    contents: `Analyze crop data and price patterns ${cropData} in ${getLanguageName(lang)}. Detect market volatility patterns.`,
  });
  return { text: response.text, sources: [] };
};

export const getLiveMarketPrices = async (crop: string, region: string, lang: string = 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Fetch real-time mandi prices and trade patterns for ${crop} in ${region} in ${getLanguageName(lang)}. Identify supply chain patterns.`,
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
    contents: `Find ${type} near ${lat}, ${lng} in ${getLanguageName(lang)}. Include reviews and operational patterns.`,
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
