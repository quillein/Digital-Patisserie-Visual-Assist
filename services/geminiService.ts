
import { GoogleGenAI } from "@google/genai";
import { ATELIER_CONTEXT } from "../constants";
import { CakeDesign, StudioMode } from "../types";

export interface GenerateParams {
  prompt: string;
  imageData?: string;
  pastryFormat?: string;
  theme?: string;
  mode: StudioMode;
}

export const generateCakeDesign = async (params: GenerateParams): Promise<CakeDesign> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const studioModeName = params.mode === 'recreation' ? 'Étude de Maître' : 'Poésie Botanique';
  
  const finalPrompt = `
    ${ATELIER_CONTEXT}
    
    CURRENT TASK: Manifest this vision.
    VESSEL: ${params.pastryFormat || 'Single-tier Cake'}
    THEME: ${params.theme || 'Artistic Devotion'}
    INPUT POEM/SUBJECT: "${params.prompt}"
    STUDIO MODE: ${studioModeName}
    
    REMINDER: You must generate the image of this pastry AND provide the JSON technical manifest with Peotraco mixing recipes.
  `;

  const contents: any[] = [{ text: finalPrompt }];

  if (params.imageData) {
    contents.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: params.imageData.split(',')[1]
      }
    });
  }

  try {
    // Primary attempt with Gemini 3 Pro Image
    return await callModel(ai, 'gemini-3-pro-image-preview', contents, params.mode);
  } catch (error: any) {
    console.warn("Manifestation attempt failed, initiating fallback:", error);
    // Fallback attempt with Gemini 2.5 Flash Image
    const fallbackAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await callModel(fallbackAi, 'gemini-2.5-flash-image', contents, params.mode);
  }
};

async function callModel(ai: any, modelName: string, contents: any[], mode: StudioMode): Promise<CakeDesign> {
  const isPro = modelName.includes('pro');
  
  // Construct config carefully. imageSize is ONLY supported on Pro models.
  // Including it on Flash models will trigger 400 INVALID_ARGUMENT.
  const config: any = {
    imageConfig: {
      aspectRatio: "1:1"
    }
  };

  if (isPro) {
    config.imageConfig.imageSize = "1K";
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: { parts: contents },
    config: config
  });

  let cakeData: any = null;
  let imageUrl: string | undefined;
  let textBuffer = "";

  // Safeguard response parsing
  const parts = response.candidates?.[0]?.content?.parts || [];
  
  for (const part of parts) {
    if (part.text) {
      textBuffer += part.text;
    } else if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  // Attempt to extract JSON from text buffer
  try {
    const jsonMatch = textBuffer.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const cleanedJson = jsonMatch[0]
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      cakeData = JSON.parse(cleanedJson);
    }
  } catch (e) {
    console.error("JSON Parse Error. Raw buffer:", textBuffer);
  }

  // Final Validation: Must have technical data AND an image to be a successful manifest
  if (!cakeData || !cakeData.colorRecipes || cakeData.colorRecipes.length === 0) {
    throw new Error("MANIFEST_DATA_INCOMPLETE: Technical directives (JSON) were missing from the manifestation.");
  }

  if (!imageUrl) {
    throw new Error("MANIFEST_IMAGE_MISSING: The visual vision failed to render.");
  }

  return {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
    title: cakeData.title || "Manifestation Sans Titre",
    visualDescription: cakeData.visualDescription || "A vision of botanical soul.",
    technique: cakeData.technique || "Detailed gestural instructions were not captured.",
    colorRecipes: cakeData.colorRecipes,
    imageUrl: imageUrl,
    mode: mode,
    pastryFormat: cakeData.pastryFormat || "Patisserie",
    theme: cakeData.theme || "Artistic"
  };
}
