import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

export type Tone = "professional" | "witty" | "urgent";
export type ImageSize = "1K" | "2K" | "4K";
export type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";

export interface PlatformContent {
  platform: string;
  text: string;
  imagePrompt: string;
  aspectRatio: AspectRatio;
}

export interface GeneratedPost {
  platform: string;
  text: string;
  imagePrompt: string;
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export async function generateSocialContent(idea: string, tone: Tone, platforms: string[]): Promise<PlatformContent[]> {
  const platformGuidelines = platforms.map(p => {
    if (p === "LinkedIn") return "- LinkedIn: Long-form, professional, insightful. Include a dedicated \"Hashtags\" section at the end with 5-10 relevant professional hashtags. (Aspect Ratio: 16:9)";
    if (p === "Twitter/X") return "- Twitter/X: Short, punchy, engaging. Integrate 2-3 trending hashtags within or at the end of the text. (Aspect Ratio: 16:9)";
    if (p === "Instagram") return "- Instagram: Visual-focused caption, engaging. Include a dedicated \"Hashtags\" section at the end with 15-30 relevant and trending hashtags. (Aspect Ratio: 1:1)";
    return `- ${p}: Create engaging content suitable for this platform.`;
  }).join("\n    ");

  const prompt = `
    Create social media content for the following idea: "${idea}"
    The desired tone is: ${tone}.
    
    Generate content ONLY for the following platforms: ${platforms.join(", ")}.
    
    For each selected platform, follow these specific guidelines:
    ${platformGuidelines}
    
    For each platform, also provide a descriptive image prompt that would work well for that platform's audience.
    
    Use Google Search to find current trends, accurate data, and relevant context for the content.
    
    Return the response as a JSON array of objects with the following structure:
    [
      {
        "platform": "Platform Name",
        "text": "...",
        "imagePrompt": "...",
        "aspectRatio": "..."
      }
    ]
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse content generation response", e);
    throw new Error("Failed to generate content. Please try again.");
  }
}

export async function regenerateSinglePost(idea: string, tone: Tone, platform: string): Promise<PlatformContent> {
  const prompt = `
    Regenerate social media content for the following idea: "${idea}"
    The desired tone is: ${tone}.
    Target platform: ${platform}.
    
    Guidelines for ${platform}:
    ${platform === "LinkedIn" ? "- LinkedIn: Long-form, professional, insightful. Include a dedicated \"Hashtags\" section at the end with 5-10 relevant professional hashtags. (Aspect Ratio: 16:9)" : ""}
    ${platform === "Twitter/X" ? "- Twitter/X: Short, punchy, engaging. Integrate 2-3 trending hashtags within or at the end of the text. (Aspect Ratio: 16:9)" : ""}
    ${platform === "Instagram" ? "- Instagram: Visual-focused caption, engaging. Include a dedicated \"Hashtags\" section at the end with 15-30 relevant and trending hashtags. (Aspect Ratio: 1:1)" : ""}
    
    Also provide a descriptive image prompt that would work well for ${platform}'s audience.
    
    Use Google Search to find current trends and accurate data for this specific post.
    
    Return the response as a JSON object with the following structure:
    {
      "platform": "${platform}",
      "text": "...",
      "imagePrompt": "...",
      "aspectRatio": "..."
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse single post regeneration response", e);
    throw new Error("Failed to regenerate post. Please try again.");
  }
}

export async function generateImage(prompt: string, aspectRatio: AspectRatio, size: ImageSize): Promise<string> {
  // Create a new instance right before making the call to get the latest API key
  const currentApiKey = (typeof process !== "undefined" && process.env.API_KEY) || API_KEY;
  const imageAi = new GoogleGenAI({ apiKey: currentApiKey! });
  
  try {
    const response = await imageAi.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        imageConfig: {
          aspectRatio,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error: any) {
    // If the request fails with "Requested entity was not found" or "PERMISSION_DENIED",
    // it likely means the selected API key is invalid or doesn't have access to this model.
    const errorMessage = error.message || "";
    if (
      errorMessage.includes("Requested entity was not found") || 
      errorMessage.includes("PERMISSION_DENIED") ||
      errorMessage.includes("403") ||
      errorMessage.includes("not authorized")
    ) {
      // Reset key selection and prompt user
      await checkApiKey(true);
    }
    throw error;
  }

  throw new Error("No image data returned from the model.");
}

export async function editImage(base64Image: string, editPrompt: string, aspectRatio: AspectRatio): Promise<string> {
  const currentApiKey = (typeof process !== "undefined" && process.env.API_KEY) || API_KEY;
  const imageAi = new GoogleGenAI({ apiKey: currentApiKey! });

  const mimeType = base64Image.split(";")[0].split(":")[1];
  const data = base64Image.split(",")[1];

  try {
    const response = await imageAi.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              data,
              mimeType,
            },
          },
          {
            text: editPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error: any) {
    const errorMessage = error.message || "";
    if (
      errorMessage.includes("Requested entity was not found") || 
      errorMessage.includes("PERMISSION_DENIED") ||
      errorMessage.includes("403") ||
      errorMessage.includes("not authorized")
    ) {
      await checkApiKey(true);
    }
    throw error;
  }

  throw new Error("No image data returned from the model.");
}

export async function checkApiKey(force = false) {
  if (typeof window !== "undefined" && (window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey || force) {
      await (window as any).aistudio.openSelectKey();
    }
  }
}
