import React, { useState, useTransition } from "react";
import { BibleVerse } from "../types";
import {
  BIBLE_BOOKS,
  CURATED_BIBLE_QUOTES,
  POPULAR_TOPICS,
} from "../data/bibleQuotes";
import {
  searchLocalBibleQuotes,
  lookupPassage,
  searchWithGemini,
} from "../services/bibleService";
import {
  Search,
  Sparkles,
  BookOpen,
  SlidersHorizontal,
  BookmarkCheck,
  Flame,
  Shuffle,
  Loader2,
  ChevronRight,
  Info,
  Cross,
} from "lucide-react";

interface VerseSearchPaneProps {
  selectedVerse: BibleVerse;
  onSelectVerse: (verse: BibleVerse) => void;
  onAskAiStyle?: (verse: BibleVerse) => void;
}

export const VerseSearchPane: React.FC<VerseSearchPaneProps> = ({
  selectedVerse,
  onSelectVerse,
  onAskAiStyle,
}) => {
  const [activeTab, setActiveTab] = useState<"keyword" | "reference" | "ai">("keyword");
  const [keyword, setKeyword] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  // Exact Reference fields (default to Wisdom or Philippians)
  const [selectedBook, setSelectedBook] = useState("Wisdom");
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [verseRange, setVerseRange] = useState("1-3");
  const [translation, setTranslation] = useState("dra");
  const [manualRefInput, setManualRefInput] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // AI Search state
  const [aiQuery, setAiQuery] = useState("");
  const [aiResults, setAiResults] = useState<BibleVerse[]>([]);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Local search results
  const localResults = searchLocalBibleQuotes(keyword, selectedTopic);

  // Pick random quote
  const handleRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * CURATED_BIBLE_QUOTES.length);
    const chosen = CURATED_BIBLE_QUOTES[randomIndex];
    onSelectVerse(chosen);
    if (onAskAiStyle) onAskAiStyle(chosen);
  };

  // Perform Exact Reference lookup
  const handleExactLookup = async (overrideRef?: string) => {
    const targetRef = overrideRef || manualRefInput || `${selectedBook} ${selectedChapter}:${verseRange}`;
    if (!targetRef.trim()) return;

    setIsLookingUp(true);
    setLookupError(null);

    try {
      const verse = await lookupPassage(targetRef.trim(), translation);
      if (verse) {
        onSelectVerse(verse);
        if (onAskAiStyle) onAskAiStyle(verse);
      } else {
        setLookupError(`Could not find "${targetRef}". Please verify book, chapter, and verse number.`);
      }
    } catch (err: any) {
      setLookupError("Failed to lookup passage. Please check your reference.");
    } finally {
      setIsLookingUp(false);
    }
  };

  // Perform AI / Semantic Search
  const handleAiSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiSearching(true);
    setAiError(null);

    try {
      const results = await searchWithGemini(aiQuery.trim(), translation.toUpperCase());
      if (results && results.length > 0) {
        setAiResults(results);
        onSelectVerse(results[0]);
        if (onAskAiStyle) onAskAiStyle(results[0]);
      } else {
        setAiError("No verses returned. Try a different topic or Catholic keyword.");
      }
    } catch (err: any) {
      setAiError(err.message || "Failed to search Catholic scriptures.");
    } finally {
      setIsAiSearching(false);
    }
  };

  const currentBookObj = BIBLE_BOOKS.find((b) => b.name === selectedBook) || BIBLE_BOOKS[0];

  return (
    <div className="flex flex-col h-full bg-white border-r border-[#E0D7D0] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#E0D7D0] bg-[#FAF9F8]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4A1D1D] text-white flex items-center justify-center font-serif italic text-base shadow-2xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-[#2D2926] tracking-tight">Catholic Scripture Finder</h2>
                <span className="px-1.5 py-0.2 bg-[#4A1D1D]/10 text-[#4A1D1D] text-[10px] font-bold rounded">
                  73 Books
                </span>
              </div>
              <p className="text-xs text-[#8C7B70]">Douay-Rheims & Catholic Biblical Canon</p>
            </div>
          </div>
          <button
            id="btn-random-verse"
            onClick={handleRandomQuote}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#4A1D1D] bg-[#FAF9F8] hover:bg-[#F5F2F0] rounded-md transition-colors border border-[#D1C7BD]"
            title="Discover a random Catholic verse"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#8C7B70]" />
            <span>Random</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 bg-[#F5F2F0] p-1 rounded-lg border border-[#E0D7D0] text-xs font-medium">
          <button
            id="tab-search-keyword"
            onClick={() => setActiveTab("keyword")}
            className={`py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "keyword"
                ? "bg-white text-[#4A1D1D] shadow-xs font-semibold"
                : "text-[#8C7B70] hover:text-[#2D2926]"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Topics</span>
          </button>
          <button
            id="tab-search-reference"
            onClick={() => setActiveTab("reference")}
            className={`py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "reference"
                ? "bg-white text-[#4A1D1D] shadow-xs font-semibold"
                : "text-[#8C7B70] hover:text-[#2D2926]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>73 Books</span>
          </button>
          <button
            id="tab-search-ai"
            onClick={() => setActiveTab("ai")}
            className={`py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "ai"
                ? "bg-[#4A1D1D] text-white shadow-xs font-semibold"
                : "text-[#8C7B70] hover:text-[#2D2926]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Finder</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Keyword & Topic Explorer */}
      {activeTab === "keyword" && (
        <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-4">
          {/* Keyword Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8C7B70]" />
            <input
              id="input-keyword-search"
              type="text"
              value={keyword}
              onChange={(e) => {
                startTransition(() => {
                  setKeyword(e.target.value);
                });
              }}
              placeholder="Search (e.g. Wisdom, Magnificat, Eucharist, peace, charity)..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF9F8] border border-[#D1C7BD] rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4A1D1D] text-[#2D2926] placeholder-[#8C7B70]"
            />
            {keyword && (
              <button
                onClick={() => setKeyword("")}
                className="absolute right-2.5 top-2.5 text-xs text-[#8C7B70] hover:text-[#2D2926]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Catholic Topic Pills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#8C7B70] uppercase tracking-wider">
                Browse Catholic Topics
              </span>
              {selectedTopic !== "all" && (
                <button
                  onClick={() => setSelectedTopic("all")}
                  className="text-[11px] text-[#4A1D1D] hover:underline font-medium"
                >
                  Clear filter
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedTopic("all")}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                  selectedTopic === "all"
                    ? "bg-[#4A1D1D] text-white"
                    : "bg-[#FAF9F8] text-[#635B55] hover:bg-[#F5F2F0] border border-[#E0D7D0]"
                }`}
              >
                All Verses ({CURATED_BIBLE_QUOTES.length})
              </button>
              {POPULAR_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  id={`topic-pill-${topic.id}`}
                  onClick={() => setSelectedTopic(topic.label)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all border ${
                    selectedTopic === topic.label
                      ? "bg-[#4A1D1D] text-white border-[#4A1D1D] shadow-xs"
                      : "bg-[#FAF9F8] text-[#635B55] border-[#E0D7D0] hover:border-[#D1C7BD]"
                  }`}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-xs text-[#8C7B70] pb-1">
              <span>{localResults.length} scriptures found</span>
              {selectedTopic !== "all" && <span className="font-semibold text-[#4A1D1D]">{selectedTopic}</span>}
            </div>

            {localResults.length === 0 ? (
              <div className="p-6 text-center bg-[#FAF9F8] rounded-xl border border-[#E0D7D0]">
                <Info className="w-6 h-6 mx-auto text-[#8C7B70] mb-2" />
                <p className="text-xs font-semibold text-[#2D2926]">No verses found</p>
                <p className="text-[11px] text-[#8C7B70] mt-1">
                  Try searching a keyword like <em>Wisdom</em>, <em>Sirach</em>, <em>Mary</em>, or <em>Eucharist</em>, or switch to the <strong>73 Books</strong> reference tab.
                </p>
              </div>
            ) : (
              localResults.map((verse, index) => {
                const isSelected = selectedVerse.reference === verse.reference;
                return (
                  <div
                    key={`${verse.reference}-${index}`}
                    id={`verse-card-${index}`}
                    onClick={() => {
                      onSelectVerse(verse);
                      if (onAskAiStyle) onAskAiStyle(verse);
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-[#FAF9F8] border-[#4A1D1D] shadow-xs ring-1 ring-[#4A1D1D]/30"
                        : "bg-white border-[#E0D7D0] hover:border-[#D1C7BD] hover:bg-[#FAF9F8]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#2D2926] flex items-center gap-1.5">
                        {verse.reference}
                        {verse.version && (
                          <span className="px-1.5 py-0.5 text-[10px] font-normal bg-[#F5F2F0] text-[#635B55] rounded border border-[#E0D7D0]">
                            {verse.version}
                          </span>
                        )}
                      </span>
                      {verse.topic && (
                        <span className="text-[10px] font-medium text-[#4A1D1D] bg-[#FAF9F8] px-2 py-0.5 rounded-md border border-[#D1C7BD]">
                          {verse.topic}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#2D2926] line-clamp-3 leading-relaxed font-serif italic">
                      “{verse.text}”
                    </p>
                    {verse.insight && (
                      <p className="text-[11px] text-[#8C7B70] mt-2 pt-1.5 border-t border-[#E0D7D0] flex items-center gap-1">
                        <Flame className="w-3 h-3 text-[#D4AF37] shrink-0" />
                        <span className="line-clamp-1">{verse.insight}</span>
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Exact Reference Lookup (73 Catholic Books) */}
      {activeTab === "reference" && (
        <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Direct Input */}
          <div className="bg-[#FAF9F8] p-3.5 rounded-xl border border-[#E0D7D0]">
            <label className="block text-xs font-bold text-[#2D2926] mb-1.5">
              Quick Catholic Reference Entry
            </label>
            <div className="flex gap-2">
              <input
                id="input-manual-ref"
                type="text"
                value={manualRefInput}
                onChange={(e) => setManualRefInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleExactLookup();
                }}
                placeholder="e.g. Wisdom 3:1-3, Sirach 2:1, Luke 1:28, or Psalm 22:1"
                className="flex-1 px-3 py-2 bg-white border border-[#D1C7BD] rounded-lg text-xs text-[#2D2926] focus:ring-2 focus:ring-[#4A1D1D] focus:outline-none placeholder-[#8C7B70]"
              />
              <button
                id="btn-manual-lookup"
                onClick={() => handleExactLookup()}
                disabled={isLookingUp}
                className="px-3.5 py-2 bg-[#4A1D1D] hover:bg-[#3B1717] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
              >
                {isLookingUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Lookup"}
              </button>
            </div>
            {lookupError && (
              <p className="text-[11px] text-red-600 mt-2 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 shrink-0" /> {lookupError}
              </p>
            )}
          </div>

          {/* Interactive Chapter & Verse Picker for All 73 Catholic Books */}
          <div className="space-y-3 bg-white p-3.5 rounded-xl border border-[#E0D7D0]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#2D2926] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#8C7B70]" />
                <span>Catholic Canon Book Picker</span>
              </h3>
              <span className="text-[10px] text-[#4A1D1D] font-bold bg-[#4A1D1D]/10 px-1.5 py-0.5 rounded">
                73 Books
              </span>
            </div>

            {/* Book Selector grouped by Catholic Biblical Sections */}
            <div>
              <label className="block text-[11px] font-medium text-[#635B55] mb-1">Book</label>
              <select
                id="select-bible-book"
                value={selectedBook}
                onChange={(e) => {
                  setSelectedBook(e.target.value);
                  setSelectedChapter(1);
                }}
                className="w-full px-2.5 py-2 bg-[#FAF9F8] border border-[#D1C7BD] rounded-lg text-xs font-medium text-[#2D2926] focus:ring-2 focus:ring-[#4A1D1D] focus:outline-none"
              >
                <optgroup label="Deuterocanonical Books (Catholic Canon)">
                  {BIBLE_BOOKS.filter((b) => b.isDeuterocanonical).map((b) => (
                    <option key={b.name} value={b.name}>
                      ★ {b.name} ({b.chapters} ch.)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Gospels & Acts (New Testament)">
                  {BIBLE_BOOKS.filter((b) => b.category === "Gospels" || b.category === "Acts").map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} ({b.chapters} ch.)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Pauline & Catholic Epistles">
                  {BIBLE_BOOKS.filter((b) => b.category === "Epistles").map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} ({b.chapters} ch.)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Apocalypse / Revelation">
                  {BIBLE_BOOKS.filter((b) => b.category === "Revelation").map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} ({b.chapters} ch.)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Old Testament - Pentateuch">
                  {BIBLE_BOOKS.filter((b) => b.category === "Pentateuch").map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} ({b.chapters} ch.)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Old Testament - Historical">
                  {BIBLE_BOOKS.filter((b) => b.category === "Historical" && !b.isDeuterocanonical).map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} ({b.chapters} ch.)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Old Testament - Wisdom & Poetry">
                  {BIBLE_BOOKS.filter((b) => b.category === "Wisdom" && !b.isDeuterocanonical).map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} ({b.chapters} ch.)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Old Testament - Prophets">
                  {BIBLE_BOOKS.filter((b) => b.category === "Prophets" && !b.isDeuterocanonical).map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} ({b.chapters} ch.)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Chapter & Verse Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-[#635B55] mb-1">
                  Chapter (1 - {currentBookObj.chapters})
                </label>
                <input
                  type="number"
                  min={1}
                  max={currentBookObj.chapters}
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2.5 py-1.5 bg-[#FAF9F8] border border-[#D1C7BD] rounded-lg text-xs text-[#2D2926] focus:ring-2 focus:ring-[#4A1D1D] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#635B55] mb-1">
                  Verse / Range
                </label>
                <input
                  type="text"
                  value={verseRange}
                  onChange={(e) => setVerseRange(e.target.value)}
                  placeholder="e.g. 1-3 or 28"
                  className="w-full px-2.5 py-1.5 bg-[#FAF9F8] border border-[#D1C7BD] rounded-lg text-xs text-[#2D2926] focus:ring-2 focus:ring-[#4A1D1D] focus:outline-none placeholder-[#8C7B70]"
                />
              </div>
            </div>

            {/* Catholic Translation Selector */}
            <div>
              <label className="block text-[11px] font-medium text-[#635B55] mb-1">
                Catholic Translation
              </label>
              <select
                id="select-translation"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#FAF9F8] border border-[#D1C7BD] rounded-lg text-xs text-[#2D2926] focus:ring-2 focus:ring-[#4A1D1D] focus:outline-none"
              >
                <option value="dra">Douay-Rheims Catholic Bible (DRA - Full 73 Books)</option>
                <option value="cpdv">Catholic Public Domain Version (CPDV)</option>
                <option value="clementine">Clementine Latin Vulgate (Official Catholic)</option>
                <option value="web">World English Bible (WEB)</option>
                <option value="kjv">King James Version (KJV)</option>
              </select>
            </div>

            <button
              id="btn-fetch-passage"
              onClick={() => handleExactLookup(`${selectedBook} ${selectedChapter}:${verseRange}`)}
              disabled={isLookingUp}
              className="w-full py-2.5 bg-[#4A1D1D] hover:bg-[#3B1717] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isLookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
              <span>Load {selectedBook} {selectedChapter}:{verseRange}</span>
            </button>
          </div>

          {/* Quick Catholic Passages */}
          <div>
            <span className="text-[11px] font-bold text-[#8C7B70] uppercase tracking-wider block mb-2">
              Beloved Catholic Passages
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { ref: "Wisdom 3:1-3", desc: "Souls of the Just" },
                { ref: "Luke 1:46-49", desc: "The Magnificat" },
                { ref: "Matthew 26:26-28", desc: "The Holy Eucharist" },
                { ref: "Philippians 4:6-7", desc: "Peace of God" },
                { ref: "Sirach 2:1-3", desc: "Preparing for Trials" },
                { ref: "1 Corinthians 13:4-8", desc: "Hymn to Charity" },
                { ref: "Tobit 12:8-9", desc: "Prayer, Fasting, Alms" },
                { ref: "Psalm 22:1-3", desc: "The Shepherd Psalm (Ps 23)" },
              ].map((item) => (
                <button
                  key={item.ref}
                  onClick={() => handleExactLookup(item.ref)}
                  className="p-2.5 text-left bg-white hover:bg-[#FAF9F8] border border-[#E0D7D0] hover:border-[#D1C7BD] rounded-lg transition-all"
                >
                  <p className="font-semibold text-[#2D2926]">{item.ref}</p>
                  <p className="text-[10px] text-[#8C7B70]">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Catholic AI & Thematic Finder */}
      {activeTab === "ai" && (
        <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-gradient-to-br from-[#4A1D1D] via-[#3B1717] to-[#250E0E] p-4 rounded-xl text-white shadow-md border border-[#4A1D1D]/40">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="text-xs font-bold tracking-tight">Catholic Scripture Assistant</h3>
            </div>
            <p className="text-[11px] text-[#E0D7D0] leading-relaxed">
              Describe your prayer intention, devotional theme (Marian, Eucharistic, Lent, peace), or life question to find matching Catholic scriptures across the 73 books.
            </p>

            <form onSubmit={handleAiSearch} className="mt-3 space-y-2">
              <textarea
                id="input-ai-prompt"
                rows={3}
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="e.g. 'Marian prayer and intercession', 'Eucharistic presence and adoration', 'steadfast courage when tempted (Sirach)', or 'consolation for grieving'..."
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-xs text-white placeholder-[#D1C7BD]/70 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none"
              />
              <button
                id="btn-ai-search"
                type="submit"
                disabled={isAiSearching || !aiQuery.trim()}
                className="w-full py-2 bg-[#FAF9F8] text-[#4A1D1D] font-bold rounded-lg text-xs hover:bg-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs"
              >
                {isAiSearching ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching Catholic Scriptures...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Discover Scriptures</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Catholic Prompt Ideas */}
          <div>
            <span className="text-[11px] font-bold text-[#8C7B70] uppercase tracking-wider block mb-2">
              Catholic Devotional Prompts
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Marian prayer & grace",
                "Eucharist & Bread of Life",
                "Trials & spiritual combat (Sirach 2)",
                "Souls of the faithful departed (Wisdom 3)",
                "Almsgiving & charity (Tobit)",
                "Night prayer & peace (Psalm 90)",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setAiQuery(prompt);
                    setIsAiSearching(true);
                    searchWithGemini(prompt).then((results) => {
                      setAiResults(results);
                      if (results[0]) onSelectVerse(results[0]);
                      setIsAiSearching(false);
                    });
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-[#FAF9F8] text-[#635B55] hover:text-[#2D2926] rounded-md text-[11px] font-medium transition-colors border border-[#E0D7D0] hover:border-[#D1C7BD]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* AI Results */}
          {aiError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs border border-red-200 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {aiResults.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-[#2D2926] block">
                Suggested Catholic Passages ({aiResults.length})
              </span>
              {aiResults.map((verse, idx) => (
                <div
                  key={`ai-${verse.reference}-${idx}`}
                  id={`ai-result-${idx}`}
                  onClick={() => {
                    onSelectVerse(verse);
                    if (onAskAiStyle) onAskAiStyle(verse);
                  }}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                    selectedVerse.reference === verse.reference
                      ? "bg-[#FAF9F8] border-[#4A1D1D] shadow-xs ring-1 ring-[#4A1D1D]/30"
                      : "bg-white border-[#E0D7D0] hover:border-[#D1C7BD] hover:bg-[#FAF9F8]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#2D2926]">{verse.reference}</span>
                    <span className="text-[10px] font-semibold text-[#4A1D1D] bg-[#FAF9F8] px-2 py-0.5 rounded-md border border-[#D1C7BD]">
                      {verse.topic || "Catholic Selection"}
                    </span>
                  </div>
                  <p className="text-xs text-[#2D2926] font-serif italic line-clamp-3">
                    “{verse.text}”
                  </p>
                  {verse.insight && (
                    <p className="text-[11px] text-[#4A1D1D] mt-2 pt-2 border-t border-[#E0D7D0] bg-[#FAF9F8] p-2 rounded-lg">
                      💡 <strong>Context:</strong> {verse.insight}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
