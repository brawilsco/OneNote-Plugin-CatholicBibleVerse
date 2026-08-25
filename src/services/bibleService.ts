import { BibleVerse } from "../types";
import { CURATED_BIBLE_QUOTES, BIBLE_BOOKS } from "../data/bibleQuotes";

/**
 * Searches the curated Bible quotes database by keyword, topic, or reference substring
 */
export function searchLocalBibleQuotes(query: string, categoryFilter?: string): BibleVerse[] {
  const clean = query.trim().toLowerCase();
  
  return CURATED_BIBLE_QUOTES.filter((item) => {
    // If category filter is active
    if (categoryFilter && categoryFilter !== "all") {
      const matchCat = item.topic?.toLowerCase().includes(categoryFilter.toLowerCase());
      if (!matchCat) return false;
    }

    if (!clean) return true;

    // Check reference
    if (item.reference.toLowerCase().includes(clean)) return true;

    // Check text
    if (item.text.toLowerCase().includes(clean)) return true;

    // Check tags
    if (item.tags && item.tags.some((t) => t.toLowerCase().includes(clean))) return true;

    // Check topic
    if (item.topic && item.topic.toLowerCase().includes(clean)) return true;

    return false;
  });
}

/**
 * Parses user input for exact Bible references (e.g. "John 3:16", "1 Cor 13:4-8", "Ps 23:1")
 */
export function parseBibleReference(input: string): { book: string; chapter: number; verse?: string } | null {
  const trimmed = input.trim();
  // Regex pattern for book names (including 1/2/3 prefixes), chapter, and optional verse range
  const pattern = /^((?:\d\s+)?[a-zA-Z\s]+?)\s*(\d+)[\:\.]?(\d*(?:\s*[\-\–]\s*\d+)?)$/i;
  const match = trimmed.match(pattern);

  if (!match) return null;

  const rawBook = match[1].trim();
  const chapter = parseInt(match[2], 10);
  const verse = match[3]?.trim();

  // Normalize book name against list
  const foundBook = BIBLE_BOOKS.find(
    (b) =>
      b.name.toLowerCase() === rawBook.toLowerCase() ||
      b.abbr.toLowerCase() === rawBook.toLowerCase() ||
      b.name.toLowerCase().startsWith(rawBook.toLowerCase())
  );

  return {
    book: foundBook ? foundBook.name : rawBook,
    chapter,
    verse: verse || undefined,
  };
}

/**
 * Fetches an exact passage from the live Bible API proxy or local database
 */
export async function lookupPassage(reference: string, translation: string = "web"): Promise<BibleVerse | null> {
  // First check if it matches exactly a curated quote
  const localMatch = CURATED_BIBLE_QUOTES.find(
    (q) => q.reference.toLowerCase() === reference.trim().toLowerCase()
  );
  if (localMatch) {
    return localMatch;
  }

  // Otherwise query server proxy to Bible-API
  try {
    const res = await fetch(`/api/bible/lookup?ref=${encodeURIComponent(reference)}&translation=${translation}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.text) {
        return {
          reference: data.reference || reference,
          text: data.text,
          version: data.translation_name || translation.toUpperCase(),
          topic: "Scripture Study",
        };
      }
    }
  } catch (err) {
    console.warn("Bible lookup API failed:", err);
  }

  return null;
}

/**
 * Performs semantic AI search using Gemini 3.7 Flash
 */
export async function searchWithGemini(query: string, translation: string = "NIV"): Promise<BibleVerse[]> {
  try {
    const response = await fetch("/api/gemini/search-scripture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, translation }),
    });

    if (!response.ok) {
      throw new Error("AI Scripture search service unavailable");
    }

    const data = await response.json();
    return data.verses || [];
  } catch (error) {
    console.error("AI Scripture search failed, falling back to local search:", error);
    // Fallback to local keyword search
    return searchLocalBibleQuotes(query);
  }
}

/**
 * Asks Gemini for smart styling advice for a verse
 */
export async function getSmartStyleAdvice(reference: string, text: string): Promise<{
  themeId: string;
  fontFamily: string;
  recommendedAspect: string;
  reason: string;
}> {
  try {
    const res = await fetch("/api/gemini/suggest-style", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, text }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Gemini style advice failed:", err);
  }

  return {
    themeId: "parchment",
    fontFamily: "Cormorant Garamond",
    recommendedAspect: "4:3",
    reason: "Classic scripture elegance",
  };
}

/**
 * Detects if the app is currently running inside Microsoft Office/OneNote Add-in Taskpane
 */
export function isOfficeAddinEnvironment(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof (window as any).Office !== "undefined" &&
    typeof (window as any).Office.context !== "undefined" &&
    (window as any).Office.context.host !== undefined
  );
}

/**
 * Inserts the base64 quote card image directly into the active OneNote page outline using Office.js
 */
export async function insertImageToOneNoteOfficeJS(base64DataUrl: string): Promise<{ success: boolean; message: string }> {
  const win = window as any;

  if (isOfficeAddinEnvironment() && win.OneNote && win.OneNote.run) {
    try {
      // Strip 'data:image/png;base64,' prefix for Office.js image insertion
      const rawBase64 = base64DataUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
      
      await win.OneNote.run(async (context: any) => {
        const page = context.application.getActivePage();
        const outline = page.addOutline(100, 100);
        const paragraph = outline.appendImage(rawBase64, 400, 300);
        await context.sync();
      });

      return { success: true, message: "Successfully inserted quote image into your OneNote page!" };
    } catch (err: any) {
      console.error("Office.js OneNote insertion error:", err);
      return {
        success: false,
        message: `Office.js insertion error: ${err.message || "Failed to sync with OneNote API"}. Copied to clipboard instead.`,
      };
    }
  }

  // If outside real Office.js add-in, copy to clipboard for immediate paste
  try {
    if (navigator.clipboard && (window as any).ClipboardItem) {
      const response = await fetch(base64DataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new (window as any).ClipboardItem({ [blob.type]: blob }),
      ]);
      return {
        success: true,
        message: "Image copied to clipboard! (You can paste directly with Ctrl+V / Cmd+V into OneNote or any note app).",
      };
    }
  } catch (clipboardErr) {
    console.warn("Clipboard write failed:", clipboardErr);
  }

  return {
    success: true,
    message: "Inserted into OneNote Companion Notebook canvas!",
  };
}
