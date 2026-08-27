import React, { useState, useEffect } from "react";
import { BibleVerse, QuoteStyleConfig } from "./types";
import { CURATED_BIBLE_QUOTES, THEME_PRESETS } from "./data/bibleQuotes";
import { QuoteRendererCanvas } from "./components/QuoteRendererCanvas";
import { VerseSearchPane } from "./components/VerseSearchPane";
import { QuoteDesigner } from "./components/QuoteDesigner";
import { AddinManifestModal } from "./components/AddinManifestModal";
import {
  insertImageToOneNoteOfficeJS,
} from "./services/bibleService";
import {
  Download,
  Copy,
  Send,
  Check,
  FileCode,
} from "lucide-react";

export default function App() {
  // Currently active selected verse (Catholic Douay-Rheims default)
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse>(
    CURATED_BIBLE_QUOTES[0] // Wisdom 3:1-3
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
      win.Office.onReady(() => {
        console.log("Office.js taskpane initialized inside Microsoft OneNote!");
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
        showToast("Quote card image copied to clipboard! (Paste with Ctrl+V / Cmd+V)");
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
    a.download = `catholic-quote-${cleanRef}.png`;
    a.click();
    showToast("Downloaded high-resolution quote image!");
  };

  // Direct OneNote Office.js Insert
  const handleInsertDirect = async () => {
    if (!currentImageDataUrl) return;
    setIsInserting(true);
    const res = await insertImageToOneNoteOfficeJS(currentImageDataUrl);
    setIsInserting(false);
    showToast(res.message);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F4F1ED] text-[#2D2926] font-sans antialiased overflow-hidden select-none">
      {/* Top Header */}
      <header className="h-13 bg-white border-b border-[#E0D7D0] px-4 flex items-center justify-between shrink-0 z-20 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#4A1D1D] rounded-lg flex items-center justify-center text-white font-serif italic text-base shadow-xs">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-semibold tracking-tight text-[#2D2926]">
                Catholic ScriptureLink
              </h1>
              <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded bg-[#FAF9F8] text-[#4A1D1D] border border-[#D1C7BD]">
                73 Books
              </span>
            </div>
            <p className="text-[10px] text-[#8C7B70]">
              Douay-Rheims & Catholic Biblical Canon for OneNote
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Manifest Modal */}
          <button
            id="btn-header-manifest"
            onClick={() => setIsManifestOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-[#FAF9F8] text-[#2D2926] rounded-md text-xs font-medium transition-colors border border-[#D1C7BD]"
            title="View Add-in Manifest & GitHub Instructions"
          >
            <FileCode className="w-3.5 h-3.5 text-[#4A1D1D]" />
            <span className="hidden sm:inline">Manifest</span>
          </button>

          {/* Copy Image */}
          <button
            id="btn-header-copy"
            onClick={handleCopyImage}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-[#FAF9F8] text-[#2D2926] border border-[#D1C7BD] rounded-md text-xs font-medium transition-colors shadow-2xs"
            title="Copy quote image to clipboard"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-[#107C41]" /> : <Copy className="w-3.5 h-3.5 text-[#8C7B70]" />}
            <span className="hidden sm:inline">{isCopied ? "Copied" : "Copy"}</span>
          </button>

          {/* Download PNG */}
          <button
            id="btn-header-download"
            onClick={handleDownloadImage}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-[#FAF9F8] text-[#2D2926] border border-[#D1C7BD] rounded-md text-xs font-medium transition-colors shadow-2xs"
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#4A1D1D] hover:bg-[#3B1717] text-white rounded-md text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
            title="Insert into active OneNote page"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Insert to OneNote</span>
          </button>
        </div>
      </header>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-15 right-4 z-50 bg-[#2D2926] text-white px-3.5 py-2 rounded-lg shadow-xl border border-[#4A1D1D]/30 text-xs flex items-center gap-2 animate-fadeIn">
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

      {/* Main Taskpane Layout (Optimized for OneNote Taskpane and standard view) */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-2.5 sm:p-3 gap-3">
        {/* Left Column: Catholic Scripture Finder (73 Books & Topics) */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col shrink-0 rounded-xl overflow-hidden border border-[#E0D7D0] shadow-sm bg-white min-h-[280px] md:min-h-0">
          <VerseSearchPane
            selectedVerse={selectedVerse}
            onSelectVerse={(verse) => setSelectedVerse(verse)}
          />
        </div>

        {/* Right Column: Quote Preview Canvas + Aesthetic Customizer */}
        <div className="flex-1 flex flex-col overflow-y-auto gap-3 min-w-0">
          {/* Card Preview Stage */}
          <div className="bg-white rounded-xl p-4 border border-[#E0D7D0] shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
            {/* Top Gold Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-70" />

            {/* Preview Canvas Header */}
            <div className="w-full flex items-center justify-between mb-2.5 z-10">
              <div>
                <h2 className="text-sm font-serif italic font-bold text-[#4A1D1D]">Quote Card Preview</h2>
                <p className="text-[11px] text-[#8C7B70]">Formatted for OneNote notebook pages</p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-[#FAF9F8] text-[#4A1D1D] text-xs font-semibold border border-[#D1C7BD]">
                  {selectedVerse.reference}
                </span>
              </div>
            </div>

            {/* The Live High-DPI Canvas */}
            <div className="w-full flex items-center justify-center my-auto py-1 z-10">
              <QuoteRendererCanvas
                verse={selectedVerse}
                config={styleConfig}
                onImageGenerated={(dataUrl) => setCurrentImageDataUrl(dataUrl)}
                className="max-w-md w-full"
              />
            </div>

            {/* Quick Action Footer */}
            <div className="w-full pt-2.5 mt-2 border-t border-[#E0D7D0]/60 flex items-center justify-between z-10 text-[11px] text-[#8C7B70]">
              <span>Theme: <strong className="text-[#4A1D1D] font-medium">{THEME_PRESETS.find((t) => t.id === styleConfig.themeId)?.name}</strong></span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyImage}
                  className="text-[#4A1D1D] hover:underline font-semibold flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
                <span>•</span>
                <button
                  onClick={handleDownloadImage}
                  className="text-[#4A1D1D] hover:underline font-semibold flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Save PNG</span>
                </button>
              </div>
            </div>
          </div>

          {/* Theme & Styling Customizer */}
          <div className="flex-1">
            <QuoteDesigner
              verse={selectedVerse}
              config={styleConfig}
              onChangeConfig={(newCfg) => setStyleConfig(newCfg)}
            />
          </div>
        </div>
      </main>

      {/* Office Add-in Sideloading Manifest Modal */}
      <AddinManifestModal
        isOpen={isManifestOpen}
        onClose={() => setIsManifestOpen(false)}
      />
    </div>
  );
}
