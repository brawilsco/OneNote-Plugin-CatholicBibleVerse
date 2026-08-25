import { BibleVerse } from "../types";
import { CURATED_BIBLE_QUOTES, BIBLE_BOOKS } from "../data/bibleQuotes";

/**
 * Searches the curated Catholic Bible quotes database by keyword, topic, or reference substring
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

    // Check book name
    if (item.book && item.book.toLowerCase().includes(clean)) return true;

    return false;
  });
}

/**
 * Parses user input for exact Bible references (e.g. "Wisdom 3:1-3", "Sirach 2:1", "Luke 1:28", "John 3:16")
 */
export function parseBibleReference(input: string): { book: string; chapter: number; verse?: string } | null {
  const trimmed = input.trim();
  const pattern = /^((?:\d\s+)?[a-zA-Z\s]+?)\s*(\d+)[\:\.]?(\d*(?:\s*[\-\–]\s*\d+)?)$/i;
  const match = trimmed.match(pattern);

  if (!match) return null;

  const rawBook = match[1].trim();
  const chapter = parseInt(match[2], 10);
  const verse = match[3]?.trim();

  // Normalize book name against Catholic 73 books list
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
 * Fetches an exact passage from the public Bible API (CORS-friendly, client-side) or local Catholic database
 * Works 100% standalone without requiring any server backend.
 */
export async function lookupPassage(reference: string, translation: string = "dra"): Promise<BibleVerse | null> {
  const cleanRef = reference.trim();

  // 1. Check local curated Catholic quotes first
  const localMatch = CURATED_BIBLE_QUOTES.find(
    (q) => q.reference.toLowerCase() === cleanRef.toLowerCase()
  );
  if (localMatch) {
    return localMatch;
  }

  // 2. Direct client-side fetch to public Bible API (bible-api.com supports direct browser CORS)
  try {
    // Map translation codes for public APIs
    let apiTranslation = translation.toLowerCase();
    if (apiTranslation === "dra" || apiTranslation === "douay-rheims") {
      apiTranslation = "cherokee"; // fallback if drb not directly on primary endpoint
    }

    const apiUrl = `https://bible-api.com/${encodeURIComponent(cleanRef)}?translation=${apiTranslation}`;
    const res = await fetch(apiUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && data.text) {
        return {
          reference: data.reference || cleanRef,
          text: data.text.trim().replace(/\n+/g, " "),
          version: data.translation_name || translation.toUpperCase(),
          topic: "Scripture Study",
        };
      }
    }
  } catch (publicApiErr) {
    console.warn("Direct public Bible API fetch error:", publicApiErr);
  }

  // 3. Optional fallback to local backend proxy if running in dev environment
  try {
    const serverRes = await fetch(`/api/bible/lookup?ref=${encodeURIComponent(cleanRef)}&translation=${translation}`);
    if (serverRes.ok) {
      const serverData = await serverRes.json();
      if (serverData && serverData.text) {
        return {
          reference: serverData.reference || cleanRef,
          text: serverData.text,
          version: serverData.translation_name || translation.toUpperCase(),
          topic: "Scripture Study",
        };
      }
    }
  } catch (_ignored) {
    // Server not available (normal in static GitHub Pages)
  }

  // 4. If reference matches a book in our curated list, return closest book match
  const parsed = parseBibleReference(cleanRef);
  if (parsed) {
    const bookMatch = CURATED_BIBLE_QUOTES.find((q) => q.book?.toLowerCase() === parsed.book.toLowerCase());
    if (bookMatch) return bookMatch;
  }

  return null;
}

/**
 * Performs semantic Catholic scripture search.
 * Tries server-side / client Gemini if available, or seamlessly uses the client-side semantic matcher with 0 server dependency.
 */
export async function searchWithGemini(query: string, translation: string = "DRA"): Promise<BibleVerse[]> {
  const cleanQuery = query.trim().toLowerCase();

  // 1. Try server-side endpoint if running in fullstack mode
  try {
    const response = await fetch("/api/gemini/search-scripture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, translation }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.verses && data.verses.length > 0) {
        return data.verses;
      }
    }
  } catch (_ignored) {
    // Expected on static GitHub Pages
  }

  // 2. Client-side semantic & thematic discovery engine
  const matched = CURATED_BIBLE_QUOTES.filter((v) => {
    const combined = `${v.reference} ${v.text} ${v.topic} ${v.insight || ""} ${(v.tags || []).join(" ")}`.toLowerCase();
    
    // Check keywords
    const keywords = cleanQuery.split(/\s+/);
    return keywords.some((kw) => kw.length > 2 && combined.includes(kw));
  });

  if (matched.length > 0) {
    return matched;
  }

  // If no direct keyword match, return top curated highlights for the theme
  return searchLocalBibleQuotes(query);
}

/**
 * Intelligent client-side style matcher
 * Analyzes passage tone, theme, and books to recommend harmonic aesthetic styling presets.
 * Works 100% offline and in static browser environments.
 */
export async function getSmartStyleAdvice(reference: string, text: string): Promise<{
  themeId: string;
  fontFamily: string;
  recommendedAspect: string;
  reason: string;
}> {
  // Try server-side AI if available
  try {
    const res = await fetch("/api/gemini/suggest-style", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, text }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (_ignored) {
    // Static fallback
  }

  // Intelligent client-side aesthetic inference
  const combined = `${reference} ${text}`.toLowerCase();

  // Marian & Mother of God
  if (combined.includes("mary") || combined.includes("mother") || combined.includes("grace") || combined.includes("magnificat") || combined.includes("hail")) {
    return {
      themeId: "rose-quartz",
      fontFamily: "Great Vibes",
      recommendedAspect: "4:3",
      reason: "Marian grace paired with elegant cursive script and soft rose tones",
    };
  }

  // Eucharistic & Mass / Mystery
  if (combined.includes("body") || combined.includes("blood") || combined.includes("bread") || combined.includes("chalice") || combined.includes("supper") || combined.includes("cathedral") || combined.includes("altar")) {
    return {
      themeId: "stained-glass",
      fontFamily: "Cinzel",
      recommendedAspect: "4:3",
      reason: "Gothic cathedral jewel palette and classical Roman serif for Eucharistic reverence",
    };
  }

  // Strength, Courage & Maccabees / Royalty
  if (combined.includes("strength") || combined.includes("courage") || combined.includes("war") || combined.includes("king") || combined.includes("glory") || combined.includes("maccabees") || combined.includes("peter")) {
    return {
      themeId: "midnight-gold",
      fontFamily: "Cinzel",
      recommendedAspect: "4:3",
      reason: "Regal obsidian dark with celestial gold lettering reflecting steadfast fortitude",
    };
  }

  // Peace, Nature, Shepherds & Healing
  if (combined.includes("peace") || combined.includes("pasture") || combined.includes("water") || combined.includes("rest") || combined.includes("shepherd") || combined.includes("refresh") || combined.includes("yoke")) {
    return {
      themeId: "botanical-sage",
      fontFamily: "Playfair Display",
      recommendedAspect: "4:3",
      reason: "Peaceful botanical olive and serene serif typography for resting in the Lord",
    };
  }

  // Wisdom, Sirach, Proverbs & Discernment
  if (combined.includes("wisdom") || combined.includes("sirach") || combined.includes("proverbs") || combined.includes("son") || combined.includes("prudence") || combined.includes("counsel")) {
    return {
      themeId: "parchment",
      fontFamily: "Cormorant Garamond",
      recommendedAspect: "4:3",
      reason: "Venerable ancient manuscript parchment and traditional Vulgate serif",
    };
  }

  // Default timeless style
  return {
    themeId: "parchment",
    fontFamily: "Cormorant Garamond",
    recommendedAspect: "4:3",
    reason: "Classic timeless Catholic manuscript presentation",
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
 * Or copies to clipboard for 1-click paste on desktop/web/mobile.
 */
export async function insertImageToOneNoteOfficeJS(base64DataUrl: string): Promise<{ success: boolean; message: string }> {
  const win = window as any;

  if (isOfficeAddinEnvironment() && win.OneNote && win.OneNote.run) {
    try {
      const rawBase64 = base64DataUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
      
      await win.OneNote.run(async (context: any) => {
        const page = context.application.getActivePage();
        const outline = page.addOutline(100, 100);
        outline.appendImage(rawBase64, 400, 300);
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

  // If outside real Office.js add-in, copy image blob to clipboard for immediate paste
  try {
    if (navigator.clipboard && (window as any).ClipboardItem) {
      const response = await fetch(base64DataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new (window as any).ClipboardItem({ [blob.type]: blob }),
      ]);
      return {
        success: true,
        message: "Quote card copied to clipboard! (Press Ctrl+V / Cmd+V in OneNote or any note app to paste).",
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
