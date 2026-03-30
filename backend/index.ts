import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";
import otpRoutes from "./routes/otp.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API route to fetch URL content for summarization
  app.post("/api/fetch-url", async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const fetchWithRetry = async (url: string, retries = 2): Promise<any> => {
      const urlObj = new URL(url);
      try {
        return await axios.get(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Cache-Control": "max-age=0",
            "Referer": `${urlObj.protocol}//${urlObj.hostname}/`,
            "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1"
          },
          timeout: 15000,
          maxRedirects: 5,
          validateStatus: (status) => status >= 200 && status < 300
        });
      } catch (error: any) {
        if (retries > 0 && (error.code === 'ECONNRESET' || error.message.includes('socket hang up') || error.code === 'ETIMEDOUT')) {
          console.log(`Retrying fetch for ${url}. Retries left: ${retries}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchWithRetry(url, retries - 1);
        }
        throw error;
      }
    };

    try {
      const response = await fetchWithRetry(url);
      const $ = cheerio.load(response.data);
      
      // Remove scripts, styles, etc.
      $("script, style, nav, footer, header, noscript, iframe, ads").remove();
      
      const text = $("body").text().replace(/\s+/g, " ").trim();
      
      if (!text || text.length < 50) {
        // Fallback if body text is too short, maybe content is in a specific div
        const mainContent = $("main, article, #content, .content, .post-content").text().replace(/\s+/g, " ").trim();
        if (mainContent.length > text.length) {
          return res.json({ text: mainContent.substring(0, 15000) });
        }
      }

      res.json({ text: text.substring(0, 15000) }); // Limit text length
    } catch (error: any) {
      console.error("Error fetching URL:", error.message, error.code, error.response?.status);
      let message = "Failed to fetch URL content. Make sure the URL is valid and accessible.";
      
      if (error.response?.status === 403) {
        message = "Access Forbidden (403). This website blocks automated access. You can try copying the text manually.";
      } else if (error.code === 'ECONNRESET' || error.message.includes('socket hang up')) {
        message = "The server closed the connection unexpectedly. This often happens with sites that block automated access.";
      } else if (error.code === 'ETIMEDOUT') {
        message = "The request timed out. The website took too long to respond.";
      }
      
      res.status(500).json({ error: message });
    }
  });

  app.use("/api", otpRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
