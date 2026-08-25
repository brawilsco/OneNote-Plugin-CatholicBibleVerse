import React, { useState } from "react";
import {
  BibleVerse,
  QuoteStyleConfig,
  AspectRatioType,
  BorderStyleType,
  OverlayType,
} from "../types";
import { THEME_PRESETS, FONT_OPTIONS } from "../data/bibleQuotes";
import { getSmartStyleAdvice } from "../services/bibleService";
import {
  Palette,
  Type,
  Ratio,
  Frame,
  Sparkles,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Check,
  Loader2,
  RefreshCw,
  Sun,
} from "lucide-react";

interface QuoteDesignerProps {
  verse: BibleVerse;
  config: QuoteStyleConfig;
  onChangeConfig: (newConfig: QuoteStyleConfig) => void;
}

export const QuoteDesigner: React.FC<QuoteDesignerProps> = ({
  verse,
  config,
  onChangeConfig,
}) => {
  const [activeSection, setActiveSection] = useState<"themes" | "typography" | "layout" | "decorations">("themes");
  const [isAiStyling, setIsAiStyling] = useState(false);
  const [aiStyleReason, setAiStyleReason] = useState<string | null>(null);

  // Apply AI Smart Styling
  const handleAiAutoStyle = async () => {
    setIsAiStyling(true);
    setAiStyleReason(null);
    try {
      const advice = await getSmartStyleAdvice(verse.reference, verse.text);
      if (advice) {
        const matchingTheme = THEME_PRESETS.find((t) => t.id === advice.themeId) || THEME_PRESETS[0];
        onChangeConfig({
          ...config,
          themeId: matchingTheme.id,
          fontFamily: advice.fontFamily || matchingTheme.fontFamily,
          aspectRatio: (advice.recommendedAspect as AspectRatioType) || "4:3",
          borderStyle: matchingTheme.borderStyle,
          overlay: matchingTheme.overlay,
        });
        setAiStyleReason(advice.reason);
      }
    } catch (err) {
      console.warn("AI styling failed:", err);
    } finally {
      setIsAiStyling(false);
    }
  };

  const handleSelectTheme = (themeId: string) => {
    const selectedTheme = THEME_PRESETS.find((t) => t.id === themeId);
    if (!selectedTheme) return;

    onChangeConfig({
      ...config,
      themeId: selectedTheme.id,
      fontFamily: selectedTheme.fontFamily,
      borderStyle: selectedTheme.borderStyle,
      overlay: selectedTheme.overlay,
      customBgColor: undefined,
      customTextColor: undefined,
      customAccentColor: undefined,
    });
  };

  const aspectRatios: { id: AspectRatioType; label: string; desc: string }[] = [
    { id: "4:3", label: "4:3", desc: "OneNote Note Card" },
    { id: "1:1", label: "1:1", desc: "Square Tile" },
    { id: "16:9", label: "16:9", desc: "Wide Banner" },
    { id: "9:16", label: "9:16", desc: "Tall Bookmark" },
    { id: "3:2", label: "3:2", desc: "Classic Journal" },
    { id: "2:1", label: "2:1", desc: "Header Ribbon" },
  ];

  const ornaments: { id: QuoteStyleConfig["ornamentType"]; label: string }[] = [
    { id: "none", label: "None" },
    { id: "cross", label: "Cross" },
    { id: "olive-branch", label: "Olive Branch" },
    { id: "leaf", label: "Botanical Leaf" },
    { id: "sun", label: "Sunburst" },
    { id: "flourish", label: "Flourish" },
  ];

  const borderStyles: { id: BorderStyleType; label: string }[] = [
    { id: "none", label: "None" },
    { id: "classic-frame", label: "Classic Frame" },
    { id: "double-thin", label: "Double Thin" },
    { id: "corner-ornaments", label: "Corner Filigree" },
    { id: "minimal-notch", label: "Minimal Notches" },
    { id: "ornate-cathedral", label: "Cathedral Jewel" },
    { id: "dashed-modern", label: "Modern Dash" },
  ];

  const overlays: { id: OverlayType; label: string }[] = [
    { id: "none", label: "None / Solid" },
    { id: "parchment-aged", label: "Aged Parchment" },
    { id: "celestial-stars", label: "Starlight Specks" },
    { id: "botanical-foliage", label: "Foliage Vines" },
    { id: "cross-watermark", label: "Cross Watermark" },
    { id: "subtle-grain", label: "Organic Grain" },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#E0D7D0] shadow-sm overflow-hidden flex flex-col">
      {/* Designer Header */}
      <div className="p-3.5 bg-[#FAF9F8] border-b border-[#E0D7D0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#4A1D1D]" />
          <h3 className="text-xs font-bold text-[#2D2926]">Card Theme & Typography</h3>
        </div>

        <button
          id="btn-ai-auto-style"
          onClick={handleAiAutoStyle}
          disabled={isAiStyling}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4A1D1D] hover:bg-[#3B1717] text-white rounded-md text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
          title="Ask Gemini AI to select the optimal theme and typography"
        >
          {isAiStyling ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          )}
          <span>AI Smart Style</span>
        </button>
      </div>

      {/* AI Styling Recommendation Note */}
      {aiStyleReason && (
        <div className="px-4 py-2 bg-[#FAF9F8] text-[#4A1D1D] text-xs border-b border-[#E0D7D0] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span>
              <strong>AI Match:</strong> {aiStyleReason}
            </span>
          </span>
          <button
            onClick={() => setAiStyleReason(null)}
            className="text-[#8C7B70] hover:text-[#2D2926] text-[11px]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sub-Navigation */}
      <div className="grid grid-cols-4 border-b border-[#E0D7D0] bg-[#F5F2F0] p-1 text-xs">
        <button
          id="tab-designer-themes"
          onClick={() => setActiveSection("themes")}
          className={`py-1.5 rounded-md font-medium flex items-center justify-center gap-1 transition-all ${
            activeSection === "themes"
              ? "bg-white text-[#4A1D1D] shadow-xs font-semibold"
              : "text-[#8C7B70] hover:text-[#2D2926]"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Themes</span>
        </button>
        <button
          id="tab-designer-typography"
          onClick={() => setActiveSection("typography")}
          className={`py-1.5 rounded-md font-medium flex items-center justify-center gap-1 transition-all ${
            activeSection === "typography"
              ? "bg-white text-[#4A1D1D] shadow-xs font-semibold"
              : "text-[#8C7B70] hover:text-[#2D2926]"
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Typography</span>
        </button>
        <button
          id="tab-designer-layout"
          onClick={() => setActiveSection("layout")}
          className={`py-1.5 rounded-md font-medium flex items-center justify-center gap-1 transition-all ${
            activeSection === "layout"
              ? "bg-white text-[#4A1D1D] shadow-xs font-semibold"
              : "text-[#8C7B70] hover:text-[#2D2926]"
          }`}
        >
          <Ratio className="w-3.5 h-3.5" />
          <span>Layout</span>
        </button>
        <button
          id="tab-designer-decorations"
          onClick={() => setActiveSection("decorations")}
          className={`py-1.5 rounded-md font-medium flex items-center justify-center gap-1 transition-all ${
            activeSection === "decorations"
              ? "bg-white text-[#4A1D1D] shadow-xs font-semibold"
              : "text-[#8C7B70] hover:text-[#2D2926]"
          }`}
        >
          <Frame className="w-3.5 h-3.5" />
          <span>Decor</span>
        </button>
      </div>

      {/* Section 1: Themes */}
      {activeSection === "themes" && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {THEME_PRESETS.map((theme) => {
              const isSelected = config.themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  id={`theme-card-${theme.id}`}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between relative overflow-hidden group ${
                    isSelected
                      ? "ring-2 ring-[#4A1D1D] border-transparent shadow-xs"
                      : "border-[#E0D7D0] hover:border-[#D1C7BD] bg-white"
                  }`}
                  style={{
                    backgroundColor: theme.background.color || "#FAF8F5",
                  }}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span
                      className="text-[11px] font-bold truncate"
                      style={{ color: theme.textColor }}
                    >
                      {theme.name}
                    </span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-[#4A1D1D] text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Visual Preview Swatch */}
                  <div
                    className="w-full h-8 rounded-lg flex items-center justify-center px-1 text-[10px] font-serif border border-black/10"
                    style={{
                      color: theme.textColor,
                      background: theme.background.gradient || theme.background.color,
                      borderColor: theme.accentColor,
                    }}
                  >
                    “Holy Word”
                  </div>

                  <span
                    className="text-[9px] mt-1.5 font-medium truncate block opacity-70"
                    style={{ color: theme.textColor }}
                  >
                    {theme.fontFamily} • {theme.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 2: Typography & Text Formatting */}
      {activeSection === "typography" && (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2D2926] mb-2">
              Font Family
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FONT_OPTIONS.map((font) => {
                const isSelected = config.fontFamily === font.id;
                return (
                  <button
                    key={font.id}
                    id={`font-opt-${font.id.replace(/\s+/g, "-")}`}
                    onClick={() => onChangeConfig({ ...config, fontFamily: font.id })}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "bg-[#FAF9F8] border-[#4A1D1D] ring-1 ring-[#4A1D1D]/30"
                        : "bg-white border-[#E0D7D0] hover:border-[#D1C7BD]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-semibold text-[#2D2926] block truncate"
                        style={{ fontFamily: font.id }}
                      >
                        {font.name}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#4A1D1D]" />}
                    </div>
                    <span className="text-[10px] text-[#8C7B70] block truncate">
                      {font.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size & Alignment Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#E0D7D0]">
            {/* Font Size Slider */}
            <div>
              <div className="flex justify-between text-xs text-[#2D2926] font-medium mb-1">
                <span>Font Scale</span>
                <span>{Math.round(config.fontSize * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.05"
                value={config.fontSize}
                onChange={(e) =>
                  onChangeConfig({ ...config, fontSize: parseFloat(e.target.value) })
                }
                className="w-full accent-[#4A1D1D]"
              />
            </div>

            {/* Line Spacing */}
            <div>
              <div className="flex justify-between text-xs text-[#2D2926] font-medium mb-1">
                <span>Line Height</span>
                <span>{config.lineHeight.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1.2"
                max="2.0"
                step="0.1"
                value={config.lineHeight}
                onChange={(e) =>
                  onChangeConfig({ ...config, lineHeight: parseFloat(e.target.value) })
                }
                className="w-full accent-[#4A1D1D]"
              />
            </div>

            {/* Alignment Buttons */}
            <div>
              <label className="block text-xs font-bold text-[#2D2926] mb-1.5">
                Alignment
              </label>
              <div className="flex bg-[#F5F2F0] p-1 rounded-lg border border-[#E0D7D0]">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => onChangeConfig({ ...config, textAlign: align })}
                    className={`flex-1 py-1 flex items-center justify-center rounded-md text-xs transition-all ${
                      config.textAlign === align
                        ? "bg-white text-[#4A1D1D] font-bold shadow-xs"
                        : "text-[#8C7B70] hover:text-[#2D2926]"
                    }`}
                  >
                    {align === "left" && <AlignLeft className="w-3.5 h-3.5" />}
                    {align === "center" && <AlignCenter className="w-3.5 h-3.5" />}
                    {align === "right" && <AlignRight className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Layout & Aspect Ratios */}
      {activeSection === "layout" && (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2D2926] mb-2">
              Card Aspect Ratio
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {aspectRatios.map((ar) => {
                const isSelected = config.aspectRatio === ar.id;
                return (
                  <button
                    key={ar.id}
                    id={`ratio-${ar.id.replace(":", "-")}`}
                    onClick={() => onChangeConfig({ ...config, aspectRatio: ar.id })}
                    className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? "bg-[#FAF9F8] border-[#4A1D1D] ring-1 ring-[#4A1D1D]/30"
                        : "bg-white border-[#E0D7D0] hover:border-[#D1C7BD]"
                    }`}
                  >
                    <span className="text-xs font-bold text-[#2D2926]">{ar.label}</span>
                    <span className="text-[10px] text-[#8C7B70] mt-0.5">{ar.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E0D7D0]">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#2D2926]">
              <input
                type="checkbox"
                checked={config.showQuotationMarks}
                onChange={(e) =>
                  onChangeConfig({ ...config, showQuotationMarks: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#4A1D1D] focus:ring-[#4A1D1D]"
              />
              <span>Smart Quotes (“ ”)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#2D2926]">
              <input
                type="checkbox"
                checked={config.showReference}
                onChange={(e) =>
                  onChangeConfig({ ...config, showReference: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#4A1D1D] focus:ring-[#4A1D1D]"
              />
              <span>Show Reference</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#2D2926]">
              <input
                type="checkbox"
                checked={config.showVersion}
                onChange={(e) =>
                  onChangeConfig({ ...config, showVersion: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#4A1D1D] focus:ring-[#4A1D1D]"
              />
              <span>Show Translation</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#2D2926]">
              <input
                type="checkbox"
                checked={config.dropShadow}
                onChange={(e) =>
                  onChangeConfig({ ...config, dropShadow: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#4A1D1D] focus:ring-[#4A1D1D]"
              />
              <span>Soft Drop Shadow</span>
            </label>
          </div>
        </div>
      )}

      {/* Section 4: Decor, Borders & Ornaments */}
      {activeSection === "decorations" && (
        <div className="p-4 space-y-4">
          {/* Header Ornament */}
          <div>
            <label className="block text-xs font-bold text-[#2D2926] mb-2">
              Top Sacred Ornament
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ornaments.map((orn) => {
                const isSelected =
                  config.showOrnament && config.ornamentType === orn.id;
                return (
                  <button
                    key={orn.id}
                    onClick={() =>
                      onChangeConfig({
                        ...config,
                        showOrnament: orn.id !== "none",
                        ornamentType: orn.id,
                      })
                    }
                    className={`py-2 px-2 text-center rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-[#FAF9F8] border-[#4A1D1D] text-[#4A1D1D] font-bold ring-1 ring-[#4A1D1D]/30"
                        : "bg-white border-[#E0D7D0] text-[#635B55] hover:border-[#D1C7BD]"
                    }`}
                  >
                    {orn.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Border Frame Styles */}
          <div>
            <label className="block text-xs font-bold text-[#2D2926] mb-2">
              Decorative Border Frame
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {borderStyles.map((b) => {
                const isSelected =
                  config.showBorder && config.borderStyle === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() =>
                      onChangeConfig({
                        ...config,
                        showBorder: b.id !== "none",
                        borderStyle: b.id,
                      })
                    }
                    className={`py-2 px-2 text-center rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-[#FAF9F8] border-[#4A1D1D] text-[#4A1D1D] font-bold ring-1 ring-[#4A1D1D]/30"
                        : "bg-white border-[#E0D7D0] text-[#635B55] hover:border-[#D1C7BD]"
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Textures / Watermarks */}
          <div>
            <label className="block text-xs font-bold text-[#2D2926] mb-2">
              Background Texture & Overlay
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {overlays.map((ov) => {
                const isSelected = config.overlay === ov.id;
                return (
                  <button
                    key={ov.id}
                    onClick={() => onChangeConfig({ ...config, overlay: ov.id })}
                    className={`py-2 px-2 text-center rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-[#FAF9F8] border-[#4A1D1D] text-[#4A1D1D] font-bold ring-1 ring-[#4A1D1D]/30"
                        : "bg-white border-[#E0D7D0] text-[#635B55] hover:border-[#D1C7BD]"
                    }`}
                  >
                    {ov.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
