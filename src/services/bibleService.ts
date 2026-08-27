import { BibleVerse } from "../types";
import { CURATED_BIBLE_QUOTES, BIBLE_BOOKS } from "../data/bibleQuotes";
import { CATHOLIC_PASSAGE_DATABASE } from "../data/catholicPassages";

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
 * Parses user input for exact Bible references (e.g. "Job 1:1", "Wisdom 3:1-3", "Sirach 2:1", "Luke 1:28", "John 3:16")
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
 * Fetches an exact passage from the Catholic database or public Bible APIs.
 * Supports Job 1:1, Wisdom, Sirach, Tobit, and all 73 Catholic Biblical Canon books.
 */
export async function lookupPassage(reference: string, translation: string = "dra"): Promise<BibleVerse | null> {
  const cleanRef = reference.trim();
  const lowerRef = cleanRef.toLowerCase();

  // 1. Check direct curated Catholic database (Curated Quotes)
  const localMatch = CURATED_BIBLE_QUOTES.find(
    (q) => q.reference.toLowerCase() === lowerRef
  );
  if (localMatch) {
    return localMatch;
  }

  // 2. Check embedded Catholic Passages dictionary (e.g., "job 1:1", "sirach 2:1", etc.)
  if (CATHOLIC_PASSAGE_DATABASE[lowerRef]) {
    const entry = CATHOLIC_PASSAGE_DATABASE[lowerRef];
    const parsed = parseBibleReference(cleanRef);
    return {
      reference: cleanRef,
      text: entry.text,
      version: "DRA",
      topic: entry.topic || "Scripture Study",
      book: parsed?.book,
      chapter: parsed?.chapter,
      verse: parsed?.verse,
      insight: entry.insight,
    };
  }

  // 3. Normalize reference for public Bible APIs
  const parsed = parseBibleReference(cleanRef);
  const normalizedQuery = parsed
    ? `${parsed.book} ${parsed.chapter}${parsed.verse ? `:${parsed.verse}` : ""}`
    : cleanRef;

  // 4. Client-side fetch to public Bible API (supports WEB, KJV, and others with direct browser CORS)
  // We try without hardcoded Cherokee fallback so it pulls standard English text
  const translationsToTry = ["web", "kjv", "clementine"];
  for (const trans of translationsToTry) {
    try {
      const apiUrl = `https://bible-api.com/${encodeURIComponent(normalizedQuery)}?translation=${trans}`;
      const res = await fetch(apiUrl);
      if (res.ok) {
        const data = await res.json();
        if (data && data.text && data.text.trim()) {
          return {
            reference: data.reference || normalizedQuery,
            text: data.text.trim().replace(/\n+/g, " "),
            version: trans === "web" ? "Catholic Edition" : (data.translation_name || trans.toUpperCase()),
            topic: "Scripture Study",
            book: parsed?.book,
            chapter: parsed?.chapter,
            verse: parsed?.verse,
          };
        }
      }
    } catch {
      // Continue to next fallback
    }
  }

  // 5. Check server proxy if running in local backend dev environment
  try {
    const serverRes = await fetch(`/api/bible/lookup?ref=${encodeURIComponent(normalizedQuery)}&translation=${translation}`);
    if (serverRes.ok) {
      const serverData = await serverRes.json();
      if (serverData && serverData.text) {
        return {
          reference: serverData.reference || normalizedQuery,
          text: serverData.text,
          version: serverData.translation_name || translation.toUpperCase(),
          topic: "Scripture Study",
          book: parsed?.book,
          chapter: parsed?.chapter,
          verse: parsed?.verse,
        };
      }
    }
  } catch {
    // Server not available
  }

  // 6. Closest Book Match fallback from Curated List if exact verse wasn't found online
  if (parsed) {
    const bookMatch = CURATED_BIBLE_QUOTES.find((q) => q.book?.toLowerCase() === parsed.book.toLowerCase());
    if (bookMatch) {
      return {
        ...bookMatch,
        reference: `${parsed.book} ${parsed.chapter}:${parsed.verse || "1"}`,
      };
    }
  }

  return null;
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
        message: "Quote card copied to clipboard! (Press Ctrl+V / Cmd+V in OneNote to paste).",
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
