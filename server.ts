import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Initialize Google GenAI client (lazy/safely guarded)
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Semantic Bible Search & Verse Discovery Endpoint
app.post("/api/gemini/search-scripture", async (req: Request, res: Response) => {
  try {
    const { query, translation = "WEB" } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Search query is required" });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured. Using local scripture database.",
      });
    }

    const prompt = `You are a biblical scholar and scripture assistant for a OneNote Bible Study plugin.
A user is searching for Bible verses related to this query: "${query}".
Suggest 4-6 of the most relevant, uplifting, and profound Bible verses matching this topic, emotion, or question.
For each verse, provide the exact reference (e.g. "Philippians 4:6-7"), the full verbatim text (in ${translation} or modern English), the primary topic tag, a brief 1-sentence contextual insight on why it fits, and recommended aesthetic theme name (e.g. "Parchment & Calligraphy", "Deep Twilight", "Botanical Sage", "Minimalist Light", "Warm Sunset").`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  reference: { type: Type.STRING, description: "e.g. John 3:16 or Psalm 23:1-3" },
                  text: { type: Type.STRING, description: "The full verse text" },
                  version: { type: Type.STRING, description: "Bible translation e.g. WEB, KJV, ESV" },
                  topic: { type: Type.STRING, description: "Key theme e.g. Peace, Hope, Courage" },
                  insight: { type: Type.STRING, description: "Brief reflection/context on this scripture" },
                  suggestedTheme: { type: Type.STRING, description: "Recommended design theme" },
                },
                required: ["reference", "text", "topic", "insight"],
              },
            },
          },
          required: ["verses"],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{"verses":[]}');
    return res.json(parsed);
  } catch (error: any) {
    console.error("Gemini scripture search error:", error);
    return res.status(500).json({
      error: error.message || "Failed to search scriptures with AI",
    });
  }
});

// AI Smart Styling Suggestion for a specific verse
app.post("/api/gemini/suggest-style", async (req: Request, res: Response) => {
  try {
    const { reference, text } = req.body;
    const ai = getGenAI();
    if (!ai) {
      return res.json({
        themeId: "botanical-sage",
        fontFamily: "Playfair Display",
        aspectRatio: "4:3",
        reason: "Default harmonic style",
      });
    }

    const prompt = `Analyze this Bible verse: "${reference} - ${text}".
Recommend the ideal visual styling preset to reflect its mood and reverence.
Available themes:
- 'minimal-light' (clean modern, high contrast)
- 'parchment' (antique warm historical parchment, classic serif)
- 'midnight-gold' (regal deep obsidian dark with warm golden accents)
- 'botanical-sage' (peaceful earthy sage green with floral botanical touch)
- 'sunset-terracotta' (warm radiant amber and terracotta)
- 'modern-editorial' (chic high-fashion editorial typography)
- 'stained-glass' (vibrant jewel tones, gothic majesty)
- 'deep-navy' (serene deep sea blue and silver)
- 'rose-quartz' (gentle soft rose and burgundy)
- 'celestial' (starry indigo and ethereal light)

Available fonts: 'Cinzel', 'Playfair Display', 'Cormorant Garamond', 'Great Vibes', 'Caveat', 'Dancing Script', 'Outfit', 'Syne', 'Fraunces'.

Return JSON with themeId, fontFamily, recommendedAspect ('4:3', '1:1', '16:9', '9:16'), and a 1-sentence design explanation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            themeId: { type: Type.STRING },
            fontFamily: { type: Type.STRING },
            recommendedAspect: { type: Type.STRING },
            reason: { type: Type.STRING },
          },
          required: ["themeId", "fontFamily", "recommendedAspect", "reason"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Gemini suggest style error:", error);
    return res.json({
      themeId: "parchment",
      fontFamily: "Cormorant Garamond",
      recommendedAspect: "4:3",
      reason: "Classic timeless scripture presentation",
    });
  }
});

// Live Bible API proxy for any exact passage lookup
app.get("/api/bible/lookup", async (req: Request, res: Response) => {
  try {
    const ref = req.query.ref as string;
    const translation = (req.query.translation as string) || "web";
    if (!ref) {
      return res.status(400).json({ error: "Reference 'ref' query parameter is required" });
    }

    const cleanRef = encodeURIComponent(ref.trim());
    const apiUrl = `https://bible-api.com/${cleanRef}?translation=${translation}`;
    const apiRes = await fetch(apiUrl);

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: "Could not find passage on Bible API" });
    }

    const data = await apiRes.json();
    return res.json({
      reference: data.reference,
      text: data.text ? data.text.trim().replace(/\n+/g, " ") : "",
      translation_name: data.translation_name || translation.toUpperCase(),
      translation_id: data.translation_id || translation,
      verses: data.verses || [],
    });
  } catch (error: any) {
    console.error("Bible lookup proxy error:", error);
    return res.status(500).json({ error: "Failed to fetch from Bible API" });
  }
});

// Dynamic OneNote / Office Add-in Manifest endpoint
app.get("/api/onenote/manifest.xml", (req: Request, res: Response) => {
  const hostUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  const secureUrl = hostUrl.startsWith("http://") && !hostUrl.includes("localhost") 
    ? hostUrl.replace("http://", "https://") 
    : hostUrl;

  const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<OfficeApp 
  xmlns="http://schemas.microsoft.com/office/appforoffice/1.1" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
  xsi:type="TaskPaneApp">
  <Id>b73d2a01-49b8-4c91-a1e4-8d9e26e3c509</Id>
  <Version>1.0.0.0</Version>
  <ProviderName>OneNote Scripture Studio</ProviderName>
  <DefaultLocale>en-US</DefaultLocale>
  <DisplayName DefaultValue="Bible Quote Studio" />
  <Description DefaultValue="Search Bible quotes and insert stylish quote card images directly into your OneNote notebook pages." />
  <IconUrl DefaultValue="${secureUrl}/favicon.ico" />
  <HighResolutionIconUrl DefaultValue="${secureUrl}/favicon.ico" />
  <SupportUrl DefaultValue="${secureUrl}" />
  <AppDomains>
    <AppDomain>${secureUrl}</AppDomain>
  </AppDomains>
  <Hosts>
    <Host Name="Notebook" />
    <Host Name="Document" />
  </Hosts>
  <DefaultSettings>
    <SourceLocation DefaultValue="${secureUrl}" />
  </DefaultSettings>
  <Permissions>ReadWriteDocument</Permissions>
</OfficeApp>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Content-Disposition", 'attachment; filename="onenote-bible-quote-manifest.xml"');
  res.send(manifestXml);
});

// Setup Vite or Static File Serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`OneNote Bible Quote Studio server running on port ${PORT}`);
  });
}

start();
