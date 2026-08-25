import React, { useState, useEffect, useCallback } from "react";
import { BibleVerse, QuoteStyleConfig } from "./types";
import { CURATED_BIBLE_QUOTES, THEME_PRESETS } from "./data/bibleQuotes";
import { QuoteRendererCanvas } from "./components/QuoteRendererCanvas";
import { VerseSearchPane } from "./components/VerseSearchPane";
import { QuoteDesigner } from "./components/QuoteDesigner";
import { OneNoteCompanion } from "./components/OneNoteCompanion";
import { AddinManifestModal } from "./components/AddinManifestModal";
import {
  insertImageToOneNoteOfficeJS,
  isOfficeAddinEnvironment,
} from "./services/bibleService";
import {
  BookOpen,
  Sparkles,
  Download,
  Copy,
  Send,
  Check,
  LayoutGrid,
  Maximize2,
  FileCode,
  Share2,
  HelpCircle,
  Columns,
  Smartphone,
  Eye,
  Sliders,
} from "lucide-react";

export default function App() {
  // Currently active selected verse
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse>(
    CURATED_BIBLE_QUOTES[0] // Philippians 4:6-7
  );

  // Quote styling configuration state
  const [styleConfig, setStyleConfig] = useState<QuoteStyleConfig>({
    themeId: "botanical-sage",
    fontFamily: "Playfair Display",
    fontSize: 1.0,
    textAlign: "center",
    aspectRatio: "4:3",
    showReference: true,
    showVersion: true,
    showQuotationMarks: true,
    showBorder: true,
    borderStyle: "classic-frame",
    showOrnament: true,
    ornamentType: "olive-branch",
    overlay: "botanical-foliage",
    lineHeight: 1.5,
    letterSpacing: 2,
    dropShadow: false,
    highResolution: true,
  });

  // Generated high-resolution image data URL
  const [currentImageDataUrl, setCurrentImageDataUrl] = useState<string>("");

  // Layout View Modes: 'split' (Studio + OneNote Notebook), 'taskpane' (Focused Sidebar for docked OneNote), 'canvas-focus'
  const [viewMode, setViewMode] = useState<"split" | "taskpane" | "canvas-focus">("split");

  // Addin Manifest modal state
  const [isManifestOpen, setIsManifestOpen] = useState(false);

  // Action toast state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isInserting, setIsInserting] = useState(false);

  // Initialize Office.js on mount if available
  useEffect(() => {
    const win = window as any;
    if (win.Office && win.Office.onReady) {
      win.Office.onReady((info: any) => {
        if (info.host === win.Office.HostType.OneNote) {
          console.log("Office.js initialized inside Microsoft OneNote!");
          setViewMode("taskpane");
        }
      });
    }
  }, []);

  const showToast = (text: string, type: "success" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!currentImageDataUrl) return;
    try {
      const response = await fetch(currentImageDataUrl);
      const blob = await response.blob();
      if (navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({ [blob.type]: blob }),
        ]);
        setIsCopied(true);
        showToast("Quote card image copied to clipboard! (Ready to paste with Ctrl+V / Cmd+V)");
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.warn("Clipboard copy failed:", err);
      showToast("Could not copy directly. Use Download PNG instead.", "info");
    }
  };

  // Download High-Res PNG
  const handleDownloadImage = () => {
    if (!currentImageDataUrl) return;
    const a = document.createElement("a");
    a.href = currentImageDataUrl;
    const cleanRef = selectedVerse.reference.toLowerCase().replace(/[^a-z0-9]/g, "-");
    a.download = `bible-quote-${cleanRef}.png`;
    a.click();
    showToast("Downloaded high-resolution quote image!");
  };

  // Quick Direct OneNote Insert
  const handleInsertDirect = async () => {
    if (!currentImageDataUrl) return;
    setIsInserting(true);
    const res = await insertImageToOneNoteOfficeJS(currentImageDataUrl);
    setIsInserting(false);
    showToast(res.message);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F4F1ED] text-[#2D2926] font-sans antialiased overflow-hidden select-none">
      {/* Top Application Header */}
      <header className="h-14 bg-white border-b border-[#E0D7D0] px-6 flex items-center justify-between shrink-0 z-20 shadow-xs">
        <div className="flex items-center gap-3.5">
          {/* Professional Polish Scripture & OneNote Monogram Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#4A1D1D] rounded-lg flex items-center justify-center text-white font-serif italic text-lg shadow-xs">
              S
            </div>
            <div className="h-4 w-px bg-[#E0D7D0] mx-0.5" />
            <div className="w-9 h-9 rounded-lg bg-[#7719AA] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              N
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-[#2D2926]">
                ScriptureLink <span className="text-[#8C7B70] font-normal">for OneNote</span>
              </h1>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#FAF9F8] text-[#4A1D1D] border border-[#D1C7BD]">
                Studio
              </span>
            </div>
            <p className="text-[11px] text-[#8C7B70] hidden sm:block">
              Search scriptures • Craft quote card aesthetics • Insert directly into OneNote
            </p>
          </div>
        </div>

        {/* Header Action Buttons & View Mode Switcher */}
        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="hidden md:flex bg-[#F5F2F0] p-1 rounded-lg border border-[#E0D7D0] text-xs">
            <button
              id="view-mode-split"
              onClick={() => setViewMode("split")}
              className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all text-xs font-medium ${
                viewMode === "split"
                  ? "bg-white text-[#4A1D1D] font-bold shadow-xs"
                  : "text-[#8C7B70] hover:text-[#2D2926]"
              }`}
              title="Studio + Live OneNote Companion"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Full Studio</span>
            </button>
            <button
              id="view-mode-taskpane"
              onClick={() => setViewMode("taskpane")}
              className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all text-xs font-medium ${
                viewMode === "taskpane"
                  ? "bg-white text-[#4A1D1D] font-bold shadow-xs"
                  : "text-[#8C7B70] hover:text-[#2D2926]"
              }`}
              title="Docked Taskpane Mode for OneNote Sidebar"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Taskpane View</span>
            </button>
          </div>

          {/* Sideload Manifest Guide */}
          <button
            id="btn-header-manifest"
            onClick={() => setIsManifestOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FAF9F8] text-[#2D2926] rounded-md text-xs font-medium transition-colors border border-[#D1C7BD]"
          >
            <FileCode className="w-3.5 h-3.5 text-[#4A1D1D]" />
            <span className="hidden sm:inline">Add-in Manifest</span>
          </button>

          {/* Copy Image */}
          <button
            id="btn-header-copy"
            onClick={handleCopyImage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FAF9F8] text-[#2D2926] border border-[#D1C7BD] rounded-md text-xs font-medium transition-colors shadow-2xs"
            title="Copy high-res image to clipboard"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-[#107C41]" /> : <Copy className="w-3.5 h-3.5 text-[#8C7B70]" />}
            <span className="hidden sm:inline">{isCopied ? "Copied" : "Copy Image"}</span>
          </button>

          {/* Download PNG */}
          <button
            id="btn-header-download"
            onClick={handleDownloadImage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FAF9F8] text-[#2D2926] border border-[#D1C7BD] rounded-md text-xs font-medium transition-colors shadow-2xs"
            title="Download PNG image"
          >
            <Download className="w-3.5 h-3.5 text-[#8C7B70]" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Master Insert Button */}
          <button
            id="btn-header-insert"
            onClick={handleInsertDirect}
            disabled={isInserting}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#4A1D1D] hover:bg-[#3B1717] text-white rounded-md text-xs font-semibold transition-all shadow-sm shadow-[#4A1D1D22] transform active:scale-95 disabled:opacity-50"
            title="Insert into active OneNote page"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Insert to OneNote</span>
          </button>
        </div>
      </header>

      {/* Global Action Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-[#2D2926] text-white px-4 py-2.5 rounded-lg shadow-xl border border-[#4A1D1D]/30 text-xs flex items-center gap-2.5 animate-fadeIn">
          <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#BCB1A8] hover:text-white font-bold ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 flex overflow-hidden p-3.5 gap-3.5">
        {/* Left Column: Scripture Search & Reference Finder */}
        <div className={`${viewMode === "taskpane" ? "w-80" : "w-80 md:w-96"} flex flex-col shrink-0 rounded-xl overflow-hidden border border-[#E0D7D0] shadow-sm bg-white`}>
          <VerseSearchPane
            selectedVerse={selectedVerse}
            onSelectVerse={(verse) => setSelectedVerse(verse)}
            onAskAiStyle={(verse) => {
              if (verse.suggestedTheme) {
                const match = THEME_PRESETS.find((t) => t.id === verse.suggestedTheme);
                if (match) {
                  setStyleConfig((prev) => ({
                    ...prev,
                    themeId: match.id,
                    fontFamily: match.fontFamily,
                    borderStyle: match.borderStyle,
                    overlay: match.overlay,
                  }));
                }
              }
            }}
          />
        </div>

        {/* Middle Column: Live Canvas Preview + Styling Designer */}
        <div className="flex-1 flex flex-col overflow-y-auto gap-3.5 min-w-[320px]">
          {/* Card Preview Stage with Professional Polish Theme */}
          <div className="bg-white rounded-xl p-5 border border-[#E0D7D0] shadow-sm flex flex-col items-center justify-center relative min-h-[360px] overflow-hidden">
            {/* Top Gold Accent Border */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-70" />
            
            {/* Subtle Warm Gradient Overlay */}
            <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-[#FAF9F8] to-transparent pointer-events-none opacity-50" />

            {/* Quick Card Reference & Status Header */}
            <div className="w-full flex items-center justify-between mb-3 z-10">
              <div>
                <h2 className="text-xl font-serif italic text-[#4A1D1D] tracking-tight">Preview Canvas</h2>
                <p className="text-xs text-[#8C7B70]">Adjust the visual aesthetic before sending to OneNote</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-[#FAF9F8] text-[#4A1D1D] text-xs font-semibold tracking-wide border border-[#D1C7BD]">
                  {selectedVerse.reference}
                </span>
                <button
                  onClick={handleCopyImage}
                  className="px-2.5 py-1 bg-white hover:bg-[#FAF9F8] text-[#2D2926] border border-[#D1C7BD] rounded-md text-xs font-medium transition-colors flex items-center gap-1 shadow-2xs"
                  title="Copy Image"
                >
                  <Copy className="w-3.5 h-3.5 text-[#8C7B70]" />
                  <span className="hidden sm:inline">Copy</span>
                </button>
                <button
                  onClick={handleDownloadImage}
                  className="px-2.5 py-1 bg-white hover:bg-[#FAF9F8] text-[#2D2926] border border-[#D1C7BD] rounded-md text-xs font-medium transition-colors flex items-center gap-1 shadow-2xs"
                  title="Download PNG"
                >
                  <Download className="w-3.5 h-3.5 text-[#8C7B70]" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            </div>

            {/* The Live High-DPI Canvas */}
            <div className="w-full flex items-center justify-center my-auto py-2 z-10">
              <QuoteRendererCanvas
                verse={selectedVerse}
                config={styleConfig}
                onImageGenerated={(dataUrl) => setCurrentImageDataUrl(dataUrl)}
                className="max-w-xl w-full"
              />
            </div>

            {/* Footer Metadata Indicator */}
            <div className="w-full pt-3 mt-2 border-t border-[#E0D7D0]/60 flex items-center justify-center gap-6 z-10">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-xs shadow-[#D4AF37]"></span>
                <span className="text-[11px] text-[#8C7B70]">Ready for High-Res OneNote Export</span>
              </div>
              <div className="w-px h-3 bg-[#D1C7BD]"></div>
              <p className="text-[11px] text-[#8C7B70]">
                Theme: <span className="text-[#4A1D1D] font-medium">{THEME_PRESETS.find((t) => t.id === styleConfig.themeId)?.name}</span>
              </p>
            </div>
          </div>

          {/* Theme & Typography Designer Controls */}
          <div className="flex-1">
            <QuoteDesigner
              verse={selectedVerse}
              config={styleConfig}
              onChangeConfig={(newCfg) => setStyleConfig(newCfg)}
            />
          </div>
        </div>

        {/* Right Column: OneNote Interactive Live Workspace (In Split Mode) */}
        {viewMode === "split" && (
          <div className="w-[460px] xl:w-[520px] flex flex-col shrink-0 rounded-xl overflow-hidden border border-[#E0D7D0] shadow-sm bg-white">
            <OneNoteCompanion
              currentImageDataUrl={currentImageDataUrl}
              currentVerseRef={selectedVerse.reference}
              currentVerseText={selectedVerse.text}
              onOpenManifestModal={() => setIsManifestOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Office Add-in Sideloading Manifest Modal */}
      <AddinManifestModal
        isOpen={isManifestOpen}
        onClose={() => setIsManifestOpen(false)}
      />
    </div>
  );
}
