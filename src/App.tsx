import React, { useState, useEffect } from "react";
import { BibleVerse, QuoteStyleConfig } from "./types";
import { CURATED_BIBLE_QUOTES, BIBLE_BOOKS, THEME_PRESETS } from "./data/bibleQuotes";
import { lookupPassage, insertImageToOneNoteOfficeJS } from "./services/bibleService";
import { QuoteRendererCanvas } from "./components/QuoteRendererCanvas";
import { AddinManifestModal } from "./components/AddinManifestModal";
import {
  Search,
  Copy,
  Download,
  Send,
  Check,
  Shuffle,
  BookOpen,
  FileCode,
  SlidersHorizontal,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function App() {
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse>(CURATED_BIBLE_QUOTES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState("parchment");
  const [currentImageDataUrl, setCurrentImageDataUrl] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  // Quick book picker state
  const [showBookPicker, setShowBookPicker] = useState(true);
  const [pickerBook, setPickerBook] = useState("Job");
  const [pickerChapter, setPickerChapter] = useState(1);
  const [pickerVerse, setPickerVerse] = useState("1");
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Manifest modal
  const [isManifestOpen, setIsManifestOpen] = useState(false);

  // Office.js ready handler
  useEffect(() => {
    const win = window as any;
    if (win.Office && win.Office.onReady) {
      win.Office.onReady(() => {
        console.log("Office.js taskpane ready for OneNote sidebar");
      });
    }
  }, []);

  const showFeedback = (text: string, isError = false) => {
    setFeedback({ text, isError });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Filter curated quotes or handle search
  const filteredQuotes = CURATED_BIBLE_QUOTES.filter((q) => {
    if (!searchQuery.trim()) return true;
    const s = searchQuery.toLowerCase();
    return (
      q.reference.toLowerCase().includes(s) ||
      q.text.toLowerCase().includes(s) ||
      (q.topic && q.topic.toLowerCase().includes(s)) ||
      (q.book && q.book.toLowerCase().includes(s))
    );
  });

  // Pick random quote
  const handleRandom = () => {
    const r = CURATED_BIBLE_QUOTES[Math.floor(Math.random() * CURATED_BIBLE_QUOTES.length)];
    setSelectedVerse(r);
    showFeedback(`Random: ${r.reference}`);
  };

  // Direct reference lookup on search form submit
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLookingUp(true);
    try {
      const passage = await lookupPassage(searchQuery.trim(), "dra");
      if (passage) {
        setSelectedVerse(passage);
        showFeedback(`Loaded ${passage.reference}`);
      } else {
        showFeedback(`Could not find passage for "${searchQuery}"`, true);
      }
    } catch {
      showFeedback("Lookup failed. Please check reference.", true);
    } finally {
      setIsLookingUp(false);
    }
  };

  // Lookup from Book Picker (e.g. Job 1:1, Wisdom 3:1-3, etc.)
  const handlePickerLookup = async () => {
    const versePart = pickerVerse.trim() ? `:${pickerVerse.trim()}` : ":1";
    const ref = `${pickerBook} ${pickerChapter}${versePart}`;
    setIsLookingUp(true);
    try {
      const passage = await lookupPassage(ref, "dra");
      if (passage) {
        setSelectedVerse(passage);
        showFeedback(`Loaded ${passage.reference}`);
      } else {
        showFeedback(`Could not find "${ref}"`, true);
      }
    } catch {
      showFeedback("Lookup failed. Please check book and chapter.", true);
    } finally {
      setIsLookingUp(false);
    }
  };

  // Copy image to clipboard
  const handleCopyImage = async () => {
    if (!currentImageDataUrl) return;
    try {
      const res = await fetch(currentImageDataUrl);
      const blob = await res.blob();
      if (navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({ [blob.type]: blob }),
        ]);
        setIsCopied(true);
        showFeedback("Copied quote image! Paste into OneNote with Ctrl+V.");
        setTimeout(() => setIsCopied(false), 2500);
      }
    } catch {
      showFeedback("Could not copy directly. Use Save PNG instead.", true);
    }
  };

  // Download image
  const handleDownload = () => {
    if (!currentImageDataUrl) return;
    const a = document.createElement("a");
    a.href = currentImageDataUrl;
    a.download = `catholic-quote-${selectedVerse.reference.replace(/[^a-z0-9]/gi, "-")}.png`;
    a.click();
    showFeedback("Downloaded quote card PNG!");
  };

  // Insert to OneNote
  const handleInsert = async () => {
    if (!currentImageDataUrl) return;
    setIsInserting(true);
    const res = await insertImageToOneNoteOfficeJS(currentImageDataUrl);
    setIsInserting(false);
    showFeedback(res.message, !res.success);
  };

  const activeTheme = THEME_PRESETS.find((t) => t.id === selectedThemeId) || THEME_PRESETS[0];
  const currentBookObj = BIBLE_BOOKS.find((b) => b.name.toLowerCase() === pickerBook.toLowerCase()) || BIBLE_BOOKS[0];

  const styleConfig: QuoteStyleConfig = {
    themeId: activeTheme.id,
    fontFamily: activeTheme.fontFamily,
    fontSize: 1.0,
    textAlign: "center",
    aspectRatio: "4:3",
    showReference: true,
    showVersion: true,
    showQuotationMarks: true,
    showBorder: true,
    borderStyle: activeTheme.borderStyle,
    showOrnament: true,
    ornamentType: "olive-branch",
    overlay: activeTheme.overlay,
    lineHeight: 1.5,
    letterSpacing: 1.5,
    dropShadow: false,
    highResolution: true,
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#FAF9F7] text-[#2D2926] font-sans antialiased overflow-hidden select-none">
      {/* Optimized OneNote Taskpane Sidebar Header */}
      <header className="h-10 bg-white border-b border-[#E5E0DA] px-2.5 flex items-center justify-between shrink-0 z-10 shadow-2xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <BookOpen className="w-4 h-4 text-[#5A1E1E] shrink-0" />
          <h1 className="text-xs font-bold text-[#2D2926] tracking-tight truncate">
            OneNote Scripture Sidebar
          </h1>
          <span className="text-[9px] font-bold text-[#5A1E1E] bg-[#F4EFEB] px-1 py-0.2 rounded border border-[#E5E0DA] shrink-0">
            73 Books
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            id="btn-header-manifest"
            onClick={() => setIsManifestOpen(true)}
            className="p-1 text-[#8C827A] hover:text-[#5A1E1E] rounded hover:bg-[#F4EFEB] transition-colors"
            title="OneNote Add-in Manifest & GitHub Host Instructions"
          >
            <FileCode className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-random-verse"
            onClick={handleRandom}
            className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-[#5A1E1E] bg-[#F4EFEB] hover:bg-[#EBE4DC] rounded transition-colors"
            title="Discover random Catholic verse"
          >
            <Shuffle className="w-3 h-3" />
            <span>Random</span>
          </button>
        </div>
      </header>

      {/* Main Single-Column Scrollable Area for OneNote Side Pane */}
      <div className="flex-1 flex flex-col p-2.5 overflow-y-auto space-y-2.5 min-w-0">
        
        {/* 1. Live Quote Card Preview & Action Controls */}
        <div className="bg-white rounded-xl p-2.5 border border-[#E5E0DA] shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-1 text-xs">
            <span className="font-bold text-[#5A1E1E] truncate">{selectedVerse.reference}</span>
            {selectedVerse.version && (
              <span className="text-[9px] font-semibold text-[#8C827A] uppercase bg-[#FAF9F7] px-1.5 py-0.2 rounded border border-[#E5E0DA] shrink-0 ml-1">
                {selectedVerse.version}
              </span>
            )}
          </div>

          {/* Rendered Live Canvas Image */}
          <div className="w-full flex justify-center py-0.5">
            <QuoteRendererCanvas
              verse={selectedVerse}
              config={styleConfig}
              onImageGenerated={(url) => setCurrentImageDataUrl(url)}
              className="w-full max-w-full"
            />
          </div>

          {/* Primary OneNote Action Buttons */}
          <div className="grid grid-cols-3 gap-1.5 w-full mt-2">
            <button
              id="btn-insert-onenote"
              onClick={handleInsert}
              disabled={isInserting}
              className="py-1.5 px-1 bg-[#5A1E1E] hover:bg-[#461717] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors disabled:opacity-50 shadow-2xs"
              title="Insert quote card image directly into active OneNote page"
            >
              <Send className="w-3 h-3" />
              <span>Insert</span>
            </button>

            <button
              id="btn-copy-image"
              onClick={handleCopyImage}
              className="py-1.5 px-1 bg-[#F4EFEB] hover:bg-[#EBE4DC] text-[#2D2926] text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-colors border border-[#D8D2CA]"
              title="Copy quote image to clipboard (Paste with Ctrl+V / Cmd+V in OneNote)"
            >
              {isCopied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-[#5A1E1E]" />}
              <span>{isCopied ? "Copied" : "Copy"}</span>
            </button>

            <button
              id="btn-download-image"
              onClick={handleDownload}
              className="py-1.5 px-1 bg-[#F4EFEB] hover:bg-[#EBE4DC] text-[#2D2926] text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-colors border border-[#D8D2CA]"
              title="Download high-resolution PNG image"
            >
              <Download className="w-3 h-3 text-[#5A1E1E]" />
              <span>Save PNG</span>
            </button>
          </div>

          {/* Feedback Toast */}
          {feedback && (
            <div
              className={`w-full mt-1.5 px-2 py-1 rounded text-[10px] text-center font-medium flex items-center justify-center gap-1.5 ${
                feedback.isError
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-[#F4EFEB] text-[#5A1E1E] border border-[#E5E0DA]"
              }`}
            >
              <Info className="w-3 h-3 shrink-0" />
              <span className="truncate">{feedback.text}</span>
            </div>
          )}
        </div>

        {/* 2. Scripture Book Picker (Job 1:1, Wisdom, Sirach, Tobit, Psalms, etc.) */}
        <div className="bg-white p-2.5 rounded-xl border border-[#E5E0DA] space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8C827A] uppercase tracking-wider flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-[#5A1E1E]" />
              <span>73-Book Catholic Picker</span>
            </span>
            <button
              onClick={() => setShowBookPicker(!showBookPicker)}
              className="text-[10px] font-semibold text-[#5A1E1E] hover:underline flex items-center gap-0.5"
            >
              <span>{showBookPicker ? "Collapse" : "Expand"}</span>
              {showBookPicker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {showBookPicker && (
            <div className="space-y-2 pt-0.5">
              {/* Book dropdown */}
              <div>
                <label className="block text-[9px] font-bold text-[#8C827A] uppercase mb-0.5">
                  Select Book (Catholic 73 Canon)
                </label>
                <select
                  id="select-bible-book"
                  value={pickerBook}
                  onChange={(e) => {
                    setPickerBook(e.target.value);
                    setPickerChapter(1);
                    setPickerVerse("1");
                  }}
                  className="w-full px-2 py-1 bg-[#FAF9F7] border border-[#D8D2CA] rounded-lg text-xs font-medium text-[#2D2926] focus:outline-none focus:border-[#5A1E1E]"
                >
                  <optgroup label="Wisdom & Poetry">
                    {BIBLE_BOOKS.filter((b) => b.category === "Wisdom").map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name} ({b.chapters} ch.){b.isDeuterocanonical ? " ★" : ""}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Deuterocanonical (Catholic Canon)">
                    {BIBLE_BOOKS.filter((b) => b.isDeuterocanonical).map((b) => (
                      <option key={b.name} value={b.name}>
                        ★ {b.name} ({b.chapters} ch.)
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Gospels & Acts">
                    {BIBLE_BOOKS.filter((b) => b.category === "Gospels" || b.category === "Acts").map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name} ({b.chapters} ch.)
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Epistles & Revelation">
                    {BIBLE_BOOKS.filter((b) => b.category === "Epistles" || b.category === "Revelation").map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name} ({b.chapters} ch.)
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Old Testament Pentateuch & History & Prophets">
                    {BIBLE_BOOKS.filter((b) => !b.isDeuterocanonical && b.category !== "Wisdom" && b.category !== "Gospels" && b.category !== "Acts" && b.category !== "Epistles" && b.category !== "Revelation").map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name} ({b.chapters} ch.)
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Chapter & Verse Inputs */}
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="block text-[9px] font-bold text-[#8C827A] uppercase mb-0.5">
                    Chapter (1 - {currentBookObj.chapters})
                  </label>
                  <input
                    id="input-chapter"
                    type="number"
                    min={1}
                    max={currentBookObj.chapters}
                    value={pickerChapter}
                    onChange={(e) => setPickerChapter(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-2 py-1 bg-[#FAF9F7] border border-[#D8D2CA] rounded-lg text-xs focus:outline-none focus:border-[#5A1E1E]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-[#8C827A] uppercase mb-0.5">
                    Verse / Range
                  </label>
                  <input
                    id="input-verse"
                    type="text"
                    value={pickerVerse}
                    onChange={(e) => setPickerVerse(e.target.value)}
                    placeholder="e.g. 1 or 1-3"
                    className="w-full px-2 py-1 bg-[#FAF9F7] border border-[#D8D2CA] rounded-lg text-xs focus:outline-none focus:border-[#5A1E1E]"
                  />
                </div>
              </div>

              {/* Load Passage Button */}
              <button
                id="btn-load-picker-verse"
                onClick={handlePickerLookup}
                disabled={isLookingUp}
                className="w-full py-1.5 bg-[#5A1E1E] hover:bg-[#461717] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors disabled:opacity-50 shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isLookingUp ? "Fetching passage..." : `Load ${pickerBook} ${pickerChapter}:${pickerVerse || "1"}`}</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Style Themes Selector */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#8C827A] uppercase tracking-wider block">
            Aesthetic Theme
          </span>
          <div className="grid grid-cols-4 gap-1">
            {THEME_PRESETS.slice(0, 8).map((theme) => (
              <button
                key={theme.id}
                id={`theme-btn-${theme.id}`}
                onClick={() => setSelectedThemeId(theme.id)}
                className={`py-1 px-1 rounded-md text-[9px] font-medium transition-all text-center truncate border ${
                  selectedThemeId === theme.id
                    ? "bg-[#5A1E1E] text-white border-[#5A1E1E] shadow-2xs font-semibold"
                    : "bg-white text-[#2D2926] border-[#E5E0DA] hover:bg-[#F4EFEB]"
                }`}
                title={theme.description}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Quick Search Bar */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#8C827A] uppercase tracking-wider block">
            Search or Jump to Reference
          </span>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-2.5 top-2 w-3 h-3 text-[#8C827A]" />
            <input
              id="input-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Job 1:1, Sirach 2:1, peace..."
              className="w-full pl-7 pr-3 py-1 bg-white border border-[#D8D2CA] rounded-lg text-xs text-[#2D2926] placeholder-[#8C827A] focus:outline-none focus:border-[#5A1E1E]"
            />
          </form>
        </div>

        {/* 5. Curated Catholic Verse Library */}
        <div className="space-y-1 pt-0.5">
          <div className="flex items-center justify-between text-[10px] text-[#8C827A] uppercase font-bold tracking-wider">
            <span>Catholic Treasures ({filteredQuotes.length})</span>
            <span>Tap to load</span>
          </div>

          <div className="space-y-1 pb-3">
            {filteredQuotes.map((q, idx) => {
              const isSelected = selectedVerse.reference === q.reference;
              return (
                <div
                  key={`${q.reference}-${idx}`}
                  id={`quote-item-${idx}`}
                  onClick={() => setSelectedVerse(q)}
                  className={`p-2 rounded-lg cursor-pointer transition-all border text-left ${
                    isSelected
                      ? "bg-[#F4EFEB] border-[#5A1E1E] shadow-2xs ring-1 ring-[#5A1E1E]/20"
                      : "bg-white border-[#E5E0DA] hover:bg-[#FAF9F7] hover:border-[#D8D2CA]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-[#2D2926]">{q.reference}</span>
                    {q.topic && (
                      <span className="text-[9px] font-medium text-[#5A1E1E] bg-white px-1.5 py-0.2 rounded border border-[#E5E0DA]">
                        {q.topic}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#4A433E] line-clamp-2 italic font-serif leading-snug">
                    “{q.text}”
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Manifest & Host Modal */}
      <AddinManifestModal
        isOpen={isManifestOpen}
        onClose={() => setIsManifestOpen(false)}
      />
    </div>
  );
}
