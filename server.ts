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
    const { query, translation = "DRA" } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Search query is required" });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured. Using local scripture database.",
      });
    }

    const prompt = `You are a Catholic biblical scholar and scripture assistant for a OneNote Bible Study Add-in.
A user is searching for Bible verses related to this query: "${query}".
Suggest 4-6 of the most relevant, uplifting, and profound Bible verses from the 73-book Catholic Canon (including Deuterocanonical books like Wisdom, Sirach, Tobit, Judith, 1 & 2 Maccabees, Baruch, or Job, Psalms, Gospels) in Douay-Rheims or Catholic translation.
For each verse, provide the exact reference (e.g. "Wisdom 3:1-3", "Sirach 2:1-3", "Job 1:1", "Luke 1:28", "Philippians 4:6-7"), the full verbatim text, the primary topic tag, a brief 1-sentence contextual insight on why it fits, and recommended aesthetic theme name.`;

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
                  reference: { type: Type.STRING, description: "e.g. Wisdom 3:1-3 or Job 1:1" },
                  text: { type: Type.STRING, description: "The full verse text" },
                  version: { type: Type.STRING, description: "Bible translation e.g. DRA, Catholic Edition" },
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
        themeId: "parchment",
        fontFamily: "Cormorant Garamond",
        aspectRatio: "4:3",
        reason: "Traditional Catholic manuscript presentation",
      });
    }

    const prompt = `Analyze this Catholic Bible verse: "${reference} - ${text}".
Recommend the ideal visual styling preset to reflect its mood and reverence.
Available themes:
- 'parchment' (antique warm historical parchment, classic serif)
- 'stained-glass' (vibrant jewel tones, gothic majesty)
- 'midnight-gold' (regal deep obsidian dark with warm golden accents)
- 'botanical-sage' (peaceful earthy sage green with floral botanical touch)
- 'rose-quartz' (gentle soft rose and burgundy, Marian grace)
- 'deep-navy' (serene deep sea blue and silver, Stella Maris)
- 'minimal-light' (clean modern, high contrast)
- 'sunset-terracotta' (warm radiant amber and terracotta)
- 'celestial-dawn' (ethereal resurrection lavender and gold)
- 'charcoal-linen' (archival slate for scholarly study)

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
      reason: "Classic timeless Catholic scripture presentation",
    });
  }
});

// Live Bible API proxy for any exact passage lookup (Job 1:1, Sirach, Wisdom, Psalms, etc.)
app.get("/api/bible/lookup", async (req: Request, res: Response) => {
  try {
    const ref = req.query.ref as string;
    const requestedTranslation = (req.query.translation as string) || "web";
    if (!ref) {
      return res.status(400).json({ error: "Reference 'ref' query parameter is required" });
    }

    const cleanRef = encodeURIComponent(ref.trim());
    
    // Try multiple translation endpoints to guarantee text retrieval
    const candidateTranslations = [requestedTranslation, "web", "kjv", "clementine"];
    
    for (const trans of candidateTranslations) {
      try {
        const apiUrl = `https://bible-api.com/${cleanRef}?translation=${trans}`;
        const apiRes = await fetch(apiUrl);

        if (apiRes.ok) {
          const data = await apiRes.json();
          if (data && data.text && data.text.trim()) {
            return res.json({
              reference: data.reference || ref,
              text: data.text.trim().replace(/\n+/g, " "),
              translation_name: data.translation_name || trans.toUpperCase(),
              translation_id: data.translation_id || trans,
              verses: data.verses || [],
            });
          }
        }
      } catch {
        // Try next candidate
      }
    }

    return res.status(404).json({ error: `Could not find passage "${ref}"` });
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
  <ProviderName>Catholic Scripture Studio</ProviderName>
  <DefaultLocale>en-US</DefaultLocale>
  <DisplayName DefaultValue="Catholic Bible Quote Studio" />
  <Description DefaultValue="Search 73-book Catholic Bible quotes and insert stylish quote card images directly into OneNote pages." />
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
  res.setHeader("Content-Disposition", 'inline; filename="manifest.xml"');
  res.send(manifestXml);
});

// Setup Vite or static serving
async function startServer() {
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
    console.log(`OneNote Catholic Scripture Studio server running on port ${PORT}`);
  });
}

startServer();
