import React, { useState } from "react";
import { OneNotePage, OneNoteSection, InsertedQuoteItem } from "../types";
import {
  isOfficeAddinEnvironment,
  insertImageToOneNoteOfficeJS,
} from "../services/bibleService";
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Download,
  Check,
  Sparkles,
  ExternalLink,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  Maximize2,
  FolderOpen,
  Send,
} from "lucide-react";

interface OneNoteCompanionProps {
  currentImageDataUrl: string;
  currentVerseRef: string;
  currentVerseText: string;
  onOpenManifestModal: () => void;
}

const INITIAL_SECTIONS: OneNoteSection[] = [
  {
    id: "sec-devotional",
    name: "Morning Devotional",
    color: "#7719AA", // OneNote Purple
    pages: [
      {
        id: "page-1",
        title: "Walking in Peace & Trust",
        date: "Tuesday, August 25, 2026  •  8:45 AM",
        bodyText:
          "Notes from today's quiet time:\nReflecting on Philippians 4 and God's peace that surpasses all understanding. When worries arise about the upcoming projects, I need to bring them immediately to prayer with thanksgiving instead of letting them spiral.",
        insertedQuotes: [],
      },
      {
        id: "page-2",
        title: "Strength in the Wilderness",
        date: "Monday, August 24, 2026  •  7:15 AM",
        bodyText:
          "Key takeaway: Isaiah 40 promises that those who wait on the Lord will renew their strength. It is not about my human stamina, but resting in His infinite grace.",
        insertedQuotes: [],
      },
    ],
  },
  {
    id: "sec-sermon",
    name: "Sermon Journal",
    color: "#0078D4", // Blue
    pages: [
      {
        id: "page-3",
        title: "Sunday Sermon: The Good Shepherd",
        date: "Sunday, August 23, 2026  •  10:30 AM",
        bodyText:
          "Sermon passage: Psalm 23. The shepherd goes before the sheep, prepares a table in the presence of enemies, and restores the soul.",
        insertedQuotes: [],
      },
    ],
  },
  {
    id: "sec-prayer",
    name: "Prayer & Study",
    color: "#107C41", // Excel/Office Green
    pages: [
      {
        id: "page-4",
        title: "Family & Health Petitions",
        date: "Saturday, August 22, 2026  •  9:00 PM",
        bodyText: "Praying for guidance in decisions, physical healing, and peace for loved ones.",
        insertedQuotes: [],
      },
    ],
  },
];

export const OneNoteCompanion: React.FC<OneNoteCompanionProps> = ({
  currentImageDataUrl,
  currentVerseRef,
  currentVerseText,
  onOpenManifestModal,
}) => {
  const [sections, setSections] = useState<OneNoteSection[]>(INITIAL_SECTIONS);
  const [activeSectionId, setActiveSectionId] = useState<string>("sec-devotional");
  const [activePageId, setActivePageId] = useState<string>("page-1");
  const [insertStatus, setInsertStatus] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [paperStyle, setPaperStyle] = useState<"ruled" | "grid" | "plain">("ruled");

  const currentSection = sections.find((s) => s.id === activeSectionId) || sections[0];
  const currentPage = currentSection.pages.find((p) => p.id === activePageId) || currentSection.pages[0];

  const isRealOffice = isOfficeAddinEnvironment();

  // Insert image directly into current page
  const handleInsertIntoOneNote = async () => {
    if (!currentImageDataUrl) return;

    // Call Office.js helper
    const result = await insertImageToOneNoteOfficeJS(currentImageDataUrl);

    // Also place onto the active Companion page
    const newQuoteItem: InsertedQuoteItem = {
      id: `quote-${Date.now()}`,
      imageDataUrl: currentImageDataUrl,
      reference: currentVerseRef,
      textSnippet: currentVerseText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      width: 480,
      height: 360,
      x: 20,
      y: 20,
    };

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== activeSectionId) return sec;
        return {
          ...sec,
          pages: sec.pages.map((pg) => {
            if (pg.id !== activePageId) return pg;
            return {
              ...pg,
              insertedQuotes: [newQuoteItem, ...pg.insertedQuotes],
            };
          }),
        };
      })
    );

    setInsertStatus({
      message: result.message,
      type: "success",
    });

    setTimeout(() => {
      setInsertStatus(null);
    }, 4500);
  };

  // Add a new page
  const handleAddPage = () => {
    const newPage: OneNotePage = {
      id: `page-${Date.now()}`,
      title: "Untitled Study Page",
      date: new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }),
      bodyText: "",
      insertedQuotes: [],
    };

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== activeSectionId) return sec;
        return {
          ...sec,
          pages: [newPage, ...sec.pages],
        };
      })
    );
    setActivePageId(newPage.id);
  };

  // Delete an inserted quote
  const handleDeleteQuote = (quoteId: string) => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        pages: sec.pages.map((pg) => ({
          ...pg,
          insertedQuotes: pg.insertedQuotes.filter((q) => q.id !== quoteId),
        })),
      }))
    );
  };

  // Copy quote image to clipboard
  const handleCopyQuote = async (dataUrl: string, id: string) => {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new (window as any).ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.warn("Clipboard copy failed:", e);
    }
  };

  // Download quote image as PNG
  const handleDownloadQuote = (dataUrl: string, refName: string) => {
    const link = document.createElement("a");
    link.download = `bible-quote-${refName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Update Page Title
  const handleTitleChange = (newTitle: string) => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        pages: sec.pages.map((pg) =>
          pg.id === activePageId ? { ...pg, title: newTitle } : pg
        ),
      }))
    );
  };

  // Update Body Text
  const handleBodyChange = (newBody: string) => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        pages: sec.pages.map((pg) =>
          pg.id === activePageId ? { ...pg, bodyText: newBody } : pg
        ),
      }))
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-[#E0D7D0] shadow-sm overflow-hidden">
      {/* Microsoft OneNote Header Ribbon */}
      <div className="bg-[#4A1D1D] text-white px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#7719AA] flex items-center justify-center font-bold text-sm tracking-wider text-white shadow-2xs">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight">OneNote Notebook</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white font-medium">
                {isRealOffice ? "Office.js Connected" : "Live Companion View"}
              </span>
            </div>
            <span className="text-[10px] text-[#E0D7D0] block">Personal Faith & Study Notebook</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sideload Plugin Button */}
          <button
            id="btn-open-manifest"
            onClick={onOpenManifestModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white/15 hover:bg-white/25 text-white rounded-md transition-colors border border-white/20"
            title="Download Office XML manifest to sideload into Microsoft OneNote Desktop/Web"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add-in Manifest</span>
          </button>

          {/* Master One-Click Insert Button */}
          <button
            id="btn-insert-onenote-page"
            onClick={handleInsertIntoOneNote}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#C49B2C] text-[#2D2926] rounded-md text-xs font-bold shadow-xs transition-all transform active:scale-95"
            title="Insert the designed Bible quote image into this active OneNote page"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Insert Image into Page</span>
          </button>
        </div>
      </div>

      {/* Status Bar Notification */}
      {insertStatus && (
        <div className="bg-[#FAF9F8] text-[#4A1D1D] border-b border-[#E0D7D0] px-4 py-2 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#107C41] shrink-0" />
            <span className="font-medium">{insertStatus.message}</span>
          </div>
          <button
            onClick={() => setInsertStatus(null)}
            className="text-[#8C7B70] hover:text-[#2D2926] font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sections Tab Bar */}
      <div className="bg-[#F5F2F0] border-b border-[#E0D7D0] px-3 pt-2 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1 overflow-x-auto">
          {sections.map((sec) => {
            const isActive = sec.id === activeSectionId;
            return (
              <button
                key={sec.id}
                id={`section-tab-${sec.id}`}
                onClick={() => {
                  setActiveSectionId(sec.id);
                  if (sec.pages.length > 0) {
                    setActivePageId(sec.pages[0].id);
                  }
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 border-t border-x ${
                  isActive
                    ? "bg-white text-[#2D2926] border-[#E0D7D0] shadow-xs"
                    : "bg-[#FAF9F8] text-[#8C7B70] hover:bg-white border-transparent"
                }`}
                style={{
                  borderTopColor: isActive ? sec.color : "transparent",
                  borderTopWidth: isActive ? "3px" : "1px",
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: sec.color }}
                />
                <span>{sec.name}</span>
                <span className="text-[10px] text-[#8C7B70] font-normal">
                  ({sec.pages.length})
                </span>
              </button>
            );
          })}
        </div>

        {/* Paper Style Selector */}
        <div className="flex items-center gap-1 text-[11px] text-[#635B55] pb-1 shrink-0">
          <span className="text-[#8C7B70]">Paper:</span>
          {(["ruled", "grid", "plain"] as const).map((style) => (
            <button
              key={style}
              onClick={() => setPaperStyle(style)}
              className={`px-1.5 py-0.5 rounded capitalize ${
                paperStyle === style
                  ? "bg-[#4A1D1D] text-white font-medium"
                  : "bg-[#FAF9F8] border border-[#E0D7D0] hover:bg-white text-[#635B55]"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Main OneNote Split View (Pages List + Active Page Canvas) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Page Index Column */}
        <div className="w-56 bg-[#FAF9F8] border-r border-[#E0D7D0] flex flex-col shrink-0">
          <div className="p-2.5 border-b border-[#E0D7D0] flex items-center justify-between bg-[#F5F2F0]">
            <span className="text-[11px] font-bold text-[#8C7B70] uppercase tracking-wider">
              Pages
            </span>
            <button
              id="btn-add-onenote-page"
              onClick={handleAddPage}
              className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-[#FAF9F8] border border-[#D1C7BD] text-[#2D2926] rounded text-xs font-medium shadow-2xs transition-colors"
            >
              <Plus className="w-3 h-3 text-[#4A1D1D]" />
              <span>Add Page</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
            {currentSection.pages.map((page) => {
              const isActive = page.id === activePageId;
              return (
                <button
                  key={page.id}
                  id={`page-nav-${page.id}`}
                  onClick={() => setActivePageId(page.id)}
                  className={`w-full text-left p-2 rounded-lg transition-all border ${
                    isActive
                      ? "bg-white text-[#2D2926] border-[#D1C7BD] shadow-2xs font-semibold"
                      : "text-[#635B55] hover:bg-white border-transparent"
                  }`}
                >
                  <p className="text-xs truncate">{page.title || "Untitled Page"}</p>
                  <p className="text-[10px] text-[#8C7B70] truncate mt-0.5">
                    {page.insertedQuotes.length > 0
                      ? `🖼️ ${page.insertedQuotes.length} quote card${page.insertedQuotes.length > 1 ? "s" : ""}`
                      : "Text notes"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active OneNote Page Canvas */}
        <div
          className={`flex-1 overflow-y-auto p-6 flex flex-col ${
            paperStyle === "ruled"
              ? "bg-[linear-gradient(transparent_27px,#E0D7D0_28px)] bg-[size:100%_28px] bg-[#FAF9F8]/60"
              : paperStyle === "grid"
              ? "bg-[linear-gradient(to_right,#E0D7D0_1px,transparent_1px),linear-gradient(to_bottom,#E0D7D0_1px,transparent_1px)] bg-[size:20px_20px] bg-[#FAF9F8]/60"
              : "bg-white"
          }`}
        >
          {/* Editable Page Title */}
          <input
            type="text"
            value={currentPage.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Page Title..."
            className="w-full text-2xl font-serif font-bold text-[#2D2926] bg-transparent border-b border-transparent hover:border-[#E0D7D0] focus:border-[#4A1D1D] focus:outline-none pb-1 transition-colors"
          />

          {/* Date Stamp */}
          <div className="flex items-center gap-1.5 text-xs text-[#8C7B70] mt-1 mb-4">
            <Calendar className="w-3.5 h-3.5" />
            <span>{currentPage.date}</span>
          </div>

          {/* Inserted Quote Cards (Rendered Images in OneNote) */}
          {currentPage.insertedQuotes.length > 0 && (
            <div className="space-y-4 my-3">
              {currentPage.insertedQuotes.map((quote) => (
                <div
                  key={quote.id}
                  id={`inserted-quote-${quote.id}`}
                  className="relative group rounded-xl bg-white border border-[#D1C7BD] shadow-md p-2 max-w-xl transition-all hover:shadow-lg"
                >
                  <img
                    src={quote.imageDataUrl}
                    alt={quote.reference}
                    className="w-full h-auto rounded-lg object-contain"
                  />

                  {/* Hover Floating Action Bar */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#2D2926]/90 backdrop-blur-xs text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                    <button
                      onClick={() => handleCopyQuote(quote.imageDataUrl, quote.id)}
                      className="p-1.5 hover:bg-white/20 rounded text-xs flex items-center gap-1"
                      title="Copy image to clipboard"
                    >
                      {copiedId === quote.id ? (
                        <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDownloadQuote(quote.imageDataUrl, quote.reference)}
                      className="p-1.5 hover:bg-white/20 rounded text-xs"
                      title="Download PNG"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuote(quote.id)}
                      className="p-1.5 hover:bg-red-500/60 rounded text-xs text-red-300"
                      title="Remove from page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-1.5 px-1 flex items-center justify-between text-[11px] text-[#8C7B70]">
                    <span className="font-semibold text-[#4A1D1D]">{quote.reference}</span>
                    <span>Inserted at {quote.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Editable Text Notes Body */}
          <textarea
            value={currentPage.bodyText}
            onChange={(e) => handleBodyChange(e.target.value)}
            placeholder="Type your notes, prayers, cross-references, or reflections here..."
            rows={10}
            className="w-full flex-1 bg-transparent border-0 focus:ring-0 text-sm text-[#2D2926] placeholder-[#8C7B70] resize-none leading-7 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
