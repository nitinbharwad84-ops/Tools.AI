import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

export type Tone = "professional" | "witty" | "urgent";
export type TargetAudience = "general" | "tech" | "business" | "creatives" | "students";
export type ContentLength = "short" | "medium" | "long";
export type SummaryFocus = "key-takeaways" | "action-items" | "executive-summary";
export type RoastIntensity = "mild" | "spicy" | "nuclear";
export type EmailTone = "polite" | "assertive" | "friendly" | "formal";
export type WritingStyle = "formal" | "casual" | "academic" | "creative";
export type Dialect = "US" | "UK";
export type ImageStyle = "photorealistic" | "digital-art" | "oil-painting" | "sketch" | "3d-render";

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

export async function generateSocialContent(
  idea: string, 
  tone: Tone, 
  platforms: string[], 
  targetAudience: TargetAudience,
  length: ContentLength,
  includeEmojis: boolean
): Promise<PlatformContent[]> {
  const audienceDescriptions: Record<TargetAudience, string> = {
    general: "a broad, general audience with diverse interests.",
    tech: "tech-savvy individuals, developers, and early adopters.",
    business: "professionals, entrepreneurs, and corporate decision-makers.",
    creatives: "artists, designers, writers, and content creators.",
    students: "students, educators, and lifelong learners."
  };

  const lengthDesc = {
    short: "Keep the content very concise and punchy.",
    medium: "Provide a balanced length with sufficient detail.",
    long: "Go into depth and provide comprehensive information."
  }[length];

  const emojiInstruction = includeEmojis 
    ? "Use relevant emojis throughout the content to make it engaging." 
    : "Do NOT use any emojis in the content.";

  const platformGuidelines = platforms.map(p => {
    if (p === "LinkedIn") return "- LinkedIn: Professional, insightful. Include a dedicated \"Hashtags\" section at the end with 5-10 relevant professional hashtags. (Aspect Ratio: 16:9)";
    if (p === "Twitter/X") return "- Twitter/X: Engaging. Integrate 2-3 trending hashtags within or at the end of the text. (Aspect Ratio: 16:9)";
    if (p === "Instagram") return "- Instagram: Visual-focused caption, engaging. Include a dedicated \"Hashtags\" section at the end with 15-30 relevant and trending hashtags. (Aspect Ratio: 1:1)";
    return `- ${p}: Create engaging content suitable for this platform.`;
  }).join("\n    ");

  const prompt = `
    Create social media content for the following idea: "${idea}"
    The desired tone is: ${tone}.
    The target audience is: ${audienceDescriptions[targetAudience]}.
    Content length: ${lengthDesc}
    ${emojiInstruction}
    
    Generate content ONLY for the following platforms: ${platforms.join(", ")}.
    
    For each selected platform, follow these specific guidelines:
    ${platformGuidelines}
    
    For each platform, also provide a descriptive image prompt that would work well for that platform's audience and the specified target audience.
    
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

export async function regenerateSinglePost(
  idea: string, 
  tone: Tone, 
  platform: string, 
  targetAudience: TargetAudience,
  length: ContentLength,
  includeEmojis: boolean
): Promise<PlatformContent> {
  const audienceDescriptions: Record<TargetAudience, string> = {
    general: "a broad, general audience with diverse interests.",
    tech: "tech-savvy individuals, developers, and early adopters.",
    business: "professionals, entrepreneurs, and corporate decision-makers.",
    creatives: "artists, designers, writers, and content creators.",
    students: "students, educators, and lifelong learners."
  };

  const lengthDesc = {
    short: "Keep the content very concise and punchy.",
    medium: "Provide a balanced length with sufficient detail.",
    long: "Go into depth and provide comprehensive information."
  }[length];

  const emojiInstruction = includeEmojis 
    ? "Use relevant emojis throughout the content to make it engaging." 
    : "Do NOT use any emojis in the content.";

  const prompt = `
    Regenerate social media content for the following idea: "${idea}"
    The desired tone is: ${tone}.
    The target audience is: ${audienceDescriptions[targetAudience]}.
    Content length: ${lengthDesc}
    ${emojiInstruction}
    Target platform: ${platform}.
    
    Guidelines for ${platform}:
    ${platform === "LinkedIn" ? "- LinkedIn: Professional, insightful. Include a dedicated \"Hashtags\" section at the end with 5-10 relevant professional hashtags. (Aspect Ratio: 16:9)" : ""}
    ${platform === "Twitter/X" ? "- Twitter/X: Engaging. Integrate 2-3 trending hashtags within or at the end of the text. (Aspect Ratio: 16:9)" : ""}
    ${platform === "Instagram" ? "- Instagram: Visual-focused caption, engaging. Include a dedicated \"Hashtags\" section at the end with 15-30 relevant and trending hashtags. (Aspect Ratio: 1:1)" : ""}
    
    Also provide a descriptive image prompt that would work well for ${platform}'s audience and the specified target audience.
    
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

export async function enhanceImagePrompt(prompt: string): Promise<string> {
  const promptText = `
    You are an expert AI image generation prompt engineer. 
    Take the following basic prompt and enhance it into a highly detailed, descriptive, and visually rich prompt suitable for a text-to-image model. 
    Focus on lighting, composition, mood, and specific details. 
    Do not add any conversational text, just return the enhanced prompt.

    Basic prompt: ${prompt}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: promptText }] }],
  });

  return response.text?.trim() || prompt;
}

export async function generateImage(prompt: string, aspectRatio: AspectRatio, size: ImageSize, style?: ImageStyle): Promise<string> {
  const currentApiKey = (typeof process !== "undefined" && process.env.API_KEY) || API_KEY;
  const imageAi = new GoogleGenAI({ apiKey: currentApiKey! });
  
  const styledPrompt = style ? `A ${style} of: ${prompt}` : prompt;

  try {
    const response = await imageAi.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ role: "user", parts: [{ text: styledPrompt }] }],
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

export async function summarizeContent(
  content: string, 
  type: "text" | "file" | "url",
  length: ContentLength,
  focus: SummaryFocus,
  tone: WritingStyle
): Promise<string> {
  const focusDesc = {
    "key-takeaways": "Focus on the most important points and insights.",
    "action-items": "Focus on extracting actionable steps and tasks.",
    "executive-summary": "Provide a high-level overview suitable for busy executives."
  }[focus];

  const prompt = `
    Summarize the following ${type} content. 
    Summary Length: ${length}.
    Focus Area: ${focusDesc}
    Tone: ${tone}.
    
    Provide a clean, structured summary.
    
    Content:
    ${content}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  return response.text || "Failed to generate summary.";
}

export async function roastResume(resumeText: string, intensity: RoastIntensity): Promise<string> {
  const intensityDesc = {
    mild: "A gentle, playful roast. Be funny but kind.",
    spicy: "A sharp, witty roast. Don't hold back too much.",
    nuclear: "A brutal, no-holds-barred roast. Be as savage as possible."
  }[intensity];

  const prompt = `
    You are a resume roaster. 
    Roast Intensity: ${intensityDesc}
    
    Roast the following resume content in a funny but sharp way. 
    Be creative and use humor. 
    
    At the end of the roast, provide 3-5 actionable and serious improvement tips.
    
    Resume Content:
    ${resumeText}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  return response.text || "Failed to roast resume.";
}

export async function pacifyEmail(emailText: string, tone: EmailTone, length: ContentLength): Promise<string> {
  const prompt = `
    The following email is angry, rude, or passive-aggressive. 
    Rewrite it to be ${tone} and polished while preserving the original intent. 
    Length: ${length}.
    Remove all negativity and make it sound professional.
    
    Original Email:
    ${emailText}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  return response.text || "Failed to pacify email.";
}

export async function fixGrammar(text: string, style: WritingStyle, dialect: Dialect): Promise<string> {
  const prompt = `
    Fix the grammar, spelling, and punctuation of the following text. 
    Writing Style: ${style}.
    English Dialect: ${dialect === "US" ? "American English" : "British English"}.
    
    Make it flow better while keeping the original meaning intact. 
    Only return the corrected text.
    
    Text:
    ${text}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  return response.text || "Failed to fix grammar.";
}

export async function analyzeVideo(
  videoBase64: string,
  mimeType: string,
  tab: "summarization" | "qna" | "action" | "reasoning",
  promptText: string,
  options: any
): Promise<string> {
  const currentApiKey = (typeof process !== "undefined" && process.env.API_KEY) || API_KEY;
  const videoAi = new GoogleGenAI({ apiKey: currentApiKey! });

  let finalPrompt = "";
  if (tab === "summarization") {
    finalPrompt = `Summarize this video. Length: ${options.length}. Focus: ${options.focus}.`;
  } else if (tab === "qna") {
    finalPrompt = `Answer this question based on the video: ${promptText}. Detail level: ${options.detailLevel}.`;
  } else if (tab === "action") {
    finalPrompt = `Identify actions and provide timestamps for events in this video. Granularity: ${options.granularity}.`;
  } else if (tab === "reasoning") {
    finalPrompt = `Perform complex reasoning on this video based on the following context/prompt: ${promptText}. Reasoning depth: ${options.depth}.`;
  }

  const response = await videoAi.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { data: videoBase64, mimeType } },
          { text: finalPrompt }
        ]
      }
    ]
  });

  return response.text || "Failed to analyze video.";
}

export async function checkApiKey(force = false) {
  if (typeof window !== "undefined" && (window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey || force) {
      await (window as any).aistudio.openSelectKey();
    }
  }
}
