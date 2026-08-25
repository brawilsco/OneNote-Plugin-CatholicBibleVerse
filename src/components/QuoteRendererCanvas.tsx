import React, { useEffect, useRef, useCallback } from "react";
import { BibleVerse, QuoteStyleConfig } from "../types";
import { THEME_PRESETS } from "../data/bibleQuotes";

interface QuoteRendererCanvasProps {
  verse: BibleVerse;
  config: QuoteStyleConfig;
  onImageGenerated?: (dataUrl: string) => void;
  className?: string;
  previewScale?: number;
}

export const QuoteRendererCanvas: React.FC<QuoteRendererCanvasProps> = ({
  verse,
  config,
  onImageGenerated,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dimensions based on aspect ratio
  const getCanvasDimensions = (aspectRatio: string) => {
    const baseWidth = 1200;
    switch (aspectRatio) {
      case "1:1":
        return { width: 1200, height: 1200 };
      case "16:9":
        return { width: 1600, height: 900 };
      case "9:16":
        return { width: 900, height: 1600 };
      case "3:2":
        return { width: 1200, height: 800 };
      case "2:1":
        return { width: 1400, height: 700 };
      case "2:3":
        return { width: 800, height: 1200 };
      case "4:3":
      default:
        return { width: 1200, height: 900 };
    }
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = getCanvasDimensions(config.aspectRatio);
    canvas.width = width;
    canvas.height = height;

    const theme = THEME_PRESETS.find((t) => t.id === config.themeId) || THEME_PRESETS[0];

    // Colors
    const bgColor = config.customBgColor || theme.background.color || "#FAF8F5";
    const textColor = config.customTextColor || theme.textColor;
    const accentColor = config.customAccentColor || theme.accentColor;
    const secondaryTextColor = theme.secondaryTextColor;
    const fontFamily = config.fontFamily || theme.fontFamily;

    // 1. Draw Background
    ctx.save();
    if (theme.background.type === "gradient" && theme.background.gradient) {
      // Parse gradient colors or use default linear angle
      const grad = ctx.createLinearGradient(0, 0, width, height);
      if (config.themeId === "midnight-gold") {
        grad.addColorStop(0, "#0F1218");
        grad.addColorStop(0.5, "#1A1F2C");
        grad.addColorStop(1, "#11141E");
      } else if (config.themeId === "botanical-sage") {
        grad.addColorStop(0, "#EDF2EC");
        grad.addColorStop(1, "#DDE6DC");
      } else if (config.themeId === "sunset-terracotta") {
        grad.addColorStop(0, "#FDF3EC");
        grad.addColorStop(0.6, "#F7DFCD");
        grad.addColorStop(1, "#EED0BA");
      } else if (config.themeId === "deep-navy") {
        grad.addColorStop(0, "#0A1728");
        grad.addColorStop(1, "#183654");
      } else if (config.themeId === "rose-quartz") {
        grad.addColorStop(0, "#FAF2F4");
        grad.addColorStop(1, "#F3DEE3");
      } else if (config.themeId === "stained-glass") {
        grad.addColorStop(0, "#0A1B14");
        grad.addColorStop(0.5, "#143026");
        grad.addColorStop(1, "#0B1D16");
      } else if (config.themeId === "celestial-dawn") {
        grad.addColorStop(0, "#F4F1FA");
        grad.addColorStop(0.5, "#EAE5F7");
        grad.addColorStop(1, "#FDF3E7");
      } else {
        grad.addColorStop(0, bgColor);
        grad.addColorStop(1, theme.background.secondaryColor || bgColor);
      }
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = bgColor;
    }
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    // 2. Draw Background Overlays / Textures
    drawTextureOverlay(ctx, width, height, config.overlay, accentColor, textColor);

    // 3. Draw Decorative Borders / Frames
    if (config.showBorder && config.borderStyle !== "none") {
      drawDecorativeBorder(ctx, width, height, config.borderStyle, accentColor, textColor);
    }

    // 4. Draw Header / Top Ornament
    const paddingX = Math.floor(width * 0.12);
    const topY = Math.floor(height * 0.14);
    
    if (config.showOrnament && config.ornamentType !== "none") {
      drawOrnament(ctx, width / 2, topY, config.ornamentType, accentColor);
    }

    // 5. Draw Scripture Quote Text
    const textStartY = config.showOrnament && config.ornamentType !== "none" ? topY + 45 : topY + 20;
    const textAvailableWidth = width - paddingX * 2;
    const textAvailableHeight = height * 0.58;

    // Determine font size
    const baseFontSize = Math.round(
      Math.min(width, height) * 0.048 * config.fontSize * (verse.text.length > 180 ? 0.8 : verse.text.length > 100 ? 0.92 : 1.05)
    );

    ctx.save();
    ctx.fillStyle = textColor;
    ctx.textAlign = config.textAlign;

    // Apply drop shadow if enabled
    if (config.dropShadow) {
      ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;
    }

    // Draw Quotation Marks (Optional aesthetic)
    const quoteText = config.showQuotationMarks ? `“${verse.text.trim()}”` : verse.text.trim();

    // Font setting
    ctx.font = `400 ${baseFontSize}px '${fontFamily}', 'Playfair Display', serif`;

    // Wrap text into lines
    const words = quoteText.split(/\s+/);
    const lines: string[] = [];
    let currentLine = "";

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > textAvailableWidth && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    const calculatedLineHeight = baseFontSize * config.lineHeight;
    const totalBlockHeight = lines.length * calculatedLineHeight;
    
    // Vertical centering inside content area
    let startY = textStartY + (textAvailableHeight - totalBlockHeight) / 2 + baseFontSize;
    if (startY < textStartY + 30) startY = textStartY + 30;

    let textX = width / 2;
    if (config.textAlign === "left") textX = paddingX;
    if (config.textAlign === "right") textX = width - paddingX;

    lines.forEach((line, index) => {
      ctx.fillText(line, textX, startY + index * calculatedLineHeight);
    });
    ctx.restore();

    // 6. Draw Divider Line & Reference Attribution
    if (config.showReference) {
      const refY = startY + (lines.length - 1) * calculatedLineHeight + 48;
      
      // Subtle elegant divider bar
      ctx.save();
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.6;
      
      const divWidth = Math.min(160, width * 0.2);
      ctx.beginPath();
      ctx.moveTo(width / 2 - divWidth / 2, refY - 14);
      ctx.lineTo(width / 2 + divWidth / 2, refY - 14);
      ctx.stroke();

      // Tiny center diamond on divider
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(width / 2, refY - 14, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Reference Text
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = secondaryTextColor || accentColor;
      const refFontSize = Math.round(baseFontSize * 0.58);
      ctx.font = `600 ${refFontSize}px 'Outfit', 'Plus Jakarta Sans', sans-serif`;
      
      const versionText = config.showVersion && verse.version ? ` (${verse.version})` : "";
      const fullReference = `${verse.reference.toUpperCase()}${versionText}`;
      ctx.letterSpacing = `${config.letterSpacing}px`;
      ctx.fillText(fullReference, width / 2, refY + 16);
      ctx.restore();
    }

    // Export Data URL for OneNote insertion
    const dataUrl = canvas.toDataURL("image/png", 1.0);
    if (onImageGenerated) {
      onImageGenerated(dataUrl);
    }
  }, [verse, config, onImageGenerated]);

  useEffect(() => {
    // Give time for custom web fonts to be verified/loaded by browser
    if (document.fonts) {
      document.fonts.ready.then(() => {
        renderCanvas();
      });
    } else {
      renderCanvas();
    }
  }, [renderCanvas]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-sm border border-[#E0D7D0] transition-all duration-300"
      />
    </div>
  );
};

/* --- Helper Canvas Drawing Functions --- */

function drawTextureOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  overlay: string,
  accentColor: string,
  _textColor: string
) {
  ctx.save();
  if (overlay === "parchment-aged") {
    // Subtle sepia vignette and vintage grain fibers
    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.25,
      width / 2,
      height / 2,
      width * 0.72
    );
    vignette.addColorStop(0, "rgba(255, 255, 255, 0.05)");
    vignette.addColorStop(1, "rgba(90, 60, 30, 0.12)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // Fine organic fibers
    ctx.fillStyle = "rgba(100, 70, 40, 0.03)";
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.fillRect(rx, ry, Math.random() * 3 + 1, Math.random() * 2 + 1);
    }
  } else if (overlay === "celestial-stars") {
    // Tiny starry specks
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    for (let i = 0; i < 70; i++) {
      const sx = Math.random() * width;
      const sy = Math.random() * height;
      const r = Math.random() * 1.8 + 0.5;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (overlay === "subtle-grain") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
    for (let i = 0; i < 300; i++) {
      const gx = Math.random() * width;
      const gy = Math.random() * height;
      ctx.fillRect(gx, gy, 2, 2);
    }
  } else if (overlay === "cross-watermark") {
    // Subtle majestic cross watermark in background
    ctx.strokeStyle = accentColor;
    ctx.globalAlpha = 0.06;
    ctx.lineWidth = 14;
    ctx.beginPath();
    // Vertical beam
    ctx.moveTo(width / 2, height * 0.2);
    ctx.lineTo(width / 2, height * 0.8);
    // Horizontal beam
    ctx.moveTo(width * 0.35, height * 0.38);
    ctx.lineTo(width * 0.65, height * 0.38);
    ctx.stroke();
  } else if (overlay === "botanical-foliage") {
    // Elegant corner leaf silhouettes
    ctx.strokeStyle = accentColor;
    ctx.globalAlpha = 0.12;
    ctx.lineWidth = 2;
    // Top-left vine
    ctx.beginPath();
    ctx.arc(40, 40, 90, 0, Math.PI / 2);
    ctx.stroke();
    // Bottom-right vine
    ctx.beginPath();
    ctx.arc(width - 40, height - 40, 90, Math.PI, (Math.PI * 3) / 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDecorativeBorder(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  borderStyle: string,
  accentColor: string,
  _textColor: string
) {
  const margin = Math.floor(Math.min(width, height) * 0.045);
  ctx.save();
  ctx.strokeStyle = accentColor;

  if (borderStyle === "classic-frame") {
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
  } else if (borderStyle === "double-thin") {
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.7;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
    ctx.strokeRect(margin + 8, margin + 8, width - (margin + 8) * 2, height - (margin + 8) * 2);
  } else if (borderStyle === "corner-ornaments") {
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.85;
    const len = 40;
    
    // Top-left
    ctx.beginPath();
    ctx.moveTo(margin, margin + len);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin + len, margin);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - margin - len, margin);
    ctx.lineTo(width - margin, margin);
    ctx.lineTo(width - margin, margin + len);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(margin, height - margin - len);
    ctx.lineTo(margin, height - margin);
    ctx.lineTo(margin + len, height - margin);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - margin - len, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.lineTo(width - margin, height - margin - len);
    ctx.stroke();

    // Small inner corner dots
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(margin + 12, margin + 12, 3, 0, Math.PI * 2);
    ctx.arc(width - margin - 12, margin + 12, 3, 0, Math.PI * 2);
    ctx.arc(margin + 12, height - margin - 12, 3, 0, Math.PI * 2);
    ctx.arc(width - margin - 12, height - margin - 12, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (borderStyle === "minimal-notch") {
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.5;
    const inset = margin + 10;
    ctx.beginPath();
    ctx.moveTo(inset + 30, inset);
    ctx.lineTo(width - inset - 30, inset);
    ctx.moveTo(inset + 30, height - inset);
    ctx.lineTo(width - inset - 30, height - inset);
    ctx.moveTo(inset, inset + 30);
    ctx.lineTo(inset, height - inset - 30);
    ctx.moveTo(width - inset, inset + 30);
    ctx.lineTo(width - inset, height - inset - 30);
    ctx.stroke();
  } else if (borderStyle === "ornate-cathedral") {
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
    // Diamond corners
    const corners = [
      { x: margin, y: margin },
      { x: width - margin, y: margin },
      { x: margin, y: height - margin },
      { x: width - margin, y: height - margin },
    ];
    ctx.fillStyle = accentColor;
    corners.forEach((c) => {
      ctx.beginPath();
      ctx.moveTo(c.x, c.y - 8);
      ctx.lineTo(c.x + 8, c.y);
      ctx.lineTo(c.x, c.y + 8);
      ctx.lineTo(c.x - 8, c.y);
      ctx.closePath();
      ctx.fill();
    });
  } else if (borderStyle === "dashed-modern") {
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.globalAlpha = 0.6;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function drawOrnament(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: string,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  if (type === "cross") {
    // Latin Cross
    ctx.beginPath();
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x, y + 16);
    ctx.moveTo(x - 12, y - 6);
    ctx.lineTo(x + 12, y - 6);
    ctx.stroke();
  } else if (type === "olive-branch") {
    // Branch with leaves
    ctx.beginPath();
    ctx.moveTo(x - 24, y);
    ctx.quadraticCurveTo(x, y - 6, x + 24, y);
    ctx.stroke();
    // Little leaves
    [-14, -4, 6, 16].forEach((ox, idx) => {
      const dir = idx % 2 === 0 ? -1 : 1;
      ctx.beginPath();
      ctx.ellipse(x + ox, y + dir * 6, 5, 2.5, (dir * Math.PI) / 4, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (type === "sun") {
    // Sunburst / Light rays
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * 10, y + Math.sin(angle) * 10);
      ctx.lineTo(x + Math.cos(angle) * 17, y + Math.sin(angle) * 17);
      ctx.stroke();
    }
  } else if (type === "leaf") {
    ctx.beginPath();
    ctx.ellipse(x, y, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 12, y);
    ctx.lineTo(x + 12, y);
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.stroke();
  } else if (type === "flourish") {
    // Calligraphic scroll flourish
    ctx.beginPath();
    ctx.moveTo(x - 30, y);
    ctx.bezierCurveTo(x - 15, y - 10, x - 10, y + 10, x, y);
    ctx.bezierCurveTo(x + 10, y - 10, x + 15, y + 10, x + 30, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
