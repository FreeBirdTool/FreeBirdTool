export enum AspectRatio {
  AUTO = "Auto",
  SQUARE = "1:1",
  PORTRAIT = "3:4",
  LANDSCAPE = "4:3",
  MOBILE_PORTRAIT = "9:16",
  CINEMATIC = "16:9"
}

export enum LightingStyle {
  AUTO = "Auto",
  STUDIO = "Studio Lighting",
  NATURAL = "Natural Sunlight",
  NEON = "Neon Cyberpunk",
  DRAMATIC = "Dramatic Shadows",
  SOFTBOX = "Softbox Diffused",
  GOLDEN_HOUR = "Golden Hour",
  HARD_SIDE_LIGHT = "Hard Side Light",
  REMBRANDT = "Rembrandt Lighting",
  BUTTERFLY = "Butterfly Lighting",
  RIM_LIGHT = "Rim Light",
  BACKLIGHT = "Backlight",
  TOP_LIGHT = "Top Light",
  UNDERLIGHT = "Underlight",
  SPLIT_LIGHTING = "Split Lighting",
  OVERCAST_SOFT_LIGHT = "Overcast Soft Light",
  WINDOW_LIGHT = "Window Light",
  CINEMATIC_VOLUMETRIC = "Cinematic Volumetric Light",
  HIGH_KEY = "High-Key Lighting",
  LOW_KEY = "Low-Key Lighting",
  PRODUCT_SPOTLIGHT = "Product Spotlight",
  SUNSET_BACKLIGHT = "Sunset Backlight",
  COOL_MOONLIGHT = "Cool Moonlight",
  HDRI_ENVIRONMENT = "HDRI Environment Light"
}

export enum CameraPerspective {
  AUTO = "Auto",
  EYE_LEVEL = "Eye Level",
  BIRD_VIEW = "Bird View Shot",
  EXTREME_LOW_ANGLE = "Extreme Low Angle",
  FISHEYE = "Fisheye Angle",
  LOW_ANGLE = "Low Angle Shot",
  UP_DOWN_WIDE = "Up Down Wide",
  EXTREME_CLOSE_UP = "Extreme Close Up",
  MACRO = "Macro Close-up",
  TOP_DOWN = "Flat Lay (Top Down)",
  ISOMETRIC = "Isometric View"
}

export interface AnalysisResult {
  description: string;
  recommendedAspectRatio: string;
  recommendedLighting: string;
  recommendedPerspective: string;
  referenceType?: 'PRODUCT' | 'LIFESTYLE';
}

export interface GeneratedImageResponse {
  imageUrl: string | null;
  error?: string;
}

export interface UploadedImage {
  id: string;
  base64: string;
  file: File;
}

export interface GenerationConfig {
  productImageBase64: string;
  prompt: string;
  aspectRatio: string;
}

export interface HistoryItem {
  id: string;
  imageUrl: string;
  timestamp: number;
}