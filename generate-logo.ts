import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateLogo() {
  try {
    console.log("Generating logo...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: "A modern, minimalist app icon logo for an AI productivity suite named 'Nexus AI'. The design features a stylized, abstract letter 'N' formed by glowing, interconnected nodes and geometric lines. The color palette uses deep indigo and vibrant cyan on a dark background, giving a high-tech, premium SaaS vibe. Clean vector style, flat design with subtle gradients, no text, highly professional.",
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64) {
      const buffer = Buffer.from(base64, 'base64');
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(path.join(publicDir, 'logo.png'), buffer);
      console.log("Logo generated successfully and saved to /public/logo.png!");
    } else {
      console.error("No image data returned.");
    }
  } catch (e) {
    console.error("Error generating logo:", e);
  }
}

generateLogo();
