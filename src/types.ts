export interface BibleVerse {
  reference: string;
  text: string;
  version?: string;
  topic?: string;
  book?: string;
  chapter?: number;
  verse?: number | string;
  tags?: string[];
  insight?: string;
  suggestedTheme?: string;
}

export type AspectRatioType = "4:3" | "1:1" | "16:9" | "9:16" | "3:2" | "2:1" | "2:3";

export type BorderStyleType =
  | "none"
  | "classic-frame"
  | "double-thin"
  | "corner-ornaments"
  | "minimal-notch"
  | "ornate-cathedral"
  | "dashed-modern";

export type OverlayType =
  | "none"
  | "subtle-grain"
  | "soft-vignette"
  | "botanical-foliage"
  | "celestial-stars"
  | "cross-watermark"
  | "parchment-aged";

export interface ThemeConfig {
  id: string;
  name: string;
  category: "Classic" | "Modern" | "Artistic" | "Dark & Regal" | "Nature";
  description: string;
  background: {
    type: "solid" | "gradient" | "texture";
    color?: string;
    gradient?: string;
    secondaryColor?: string;
  };
  textColor: string;
  accentColor: string;
  secondaryTextColor: string;
  fontFamily: string;
  borderStyle: BorderStyleType;
  overlay: OverlayType;
}

export interface QuoteStyleConfig {
  themeId: string;
  fontFamily: string;
  fontSize: number; // relative scale 0.8 to 1.8
  textAlign: "center" | "left" | "right";
  aspectRatio: AspectRatioType;
  showReference: boolean;
  showVersion: boolean;
  showQuotationMarks: boolean;
  showBorder: boolean;
  borderStyle: BorderStyleType;
  showOrnament: boolean;
  ornamentType: "cross" | "leaf" | "olive-branch" | "sun" | "flourish" | "none";
  overlay: OverlayType;
  customBgColor?: string;
  customTextColor?: string;
  customAccentColor?: string;
  lineHeight: number;
  letterSpacing: number;
  dropShadow: boolean;
  highResolution: boolean; // 2x or 3x canvas scaling
}

export interface InsertedQuoteItem {
  id: string;
  imageDataUrl: string;
  reference: string;
  textSnippet: string;
  timestamp: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface OneNotePage {
  id: string;
  title: string;
  date: string;
  bodyText: string;
  insertedQuotes: InsertedQuoteItem[];
}

export interface OneNoteSection {
  id: string;
  name: string;
  color: string;
  pages: OneNotePage[];
}
