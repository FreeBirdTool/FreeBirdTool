import { AnalysisResult } from "../types";

/**
 * Helper to process API errors from the backend proxy cleanly without throwing HTML parse errors
 */
async function handleApiResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    let errorDetail = "";
    if (isJson) {
      try {
        const errJson = await response.json();
        if (errJson?.error) {
          const { message, code, status } = errJson.error;
          errorDetail = message || `[Status ${status || response.status} ${code || 'ERROR'}]`;
        } else if (errJson?.message) {
          errorDetail = errJson.message;
        } else {
          errorDetail = JSON.stringify(errJson);
        }
      } catch {
        errorDetail = `Server returned status ${response.status}`;
      }
    } else {
      const text = await response.text();
      if (text.includes("<!DOCTYPE") || text.includes("<html") || text.includes("<!doctype")) {
        if (response.status === 503 || response.status === 502 || response.status === 504) {
          errorDetail = "The AI service is temporarily experiencing high demand. Please try again in a moment.";
        } else {
          errorDetail = `Server request failed with HTTP ${response.status}`;
        }
      } else {
        errorDetail = text.slice(0, 200) || `Server request failed with status ${response.status}`;
      }
    }
    throw new Error(errorDetail || `Server request failed with status ${response.status}`);
  }

  if (!isJson) {
    const text = await response.text();
    if (text.includes("<!DOCTYPE") || text.includes("<html") || text.includes("<!doctype")) {
      throw new Error("Server returned an unexpected HTML response. The server may be restarting or busy.");
    }
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("Failed to parse JSON response from server.");
    }
  }

  return response.json();
}

/**
 * Analyzes style reference images (or product images) to extract descriptive keywords and infer settings.
 * Uses a text model (Gemini 3 Flash) via server-side API endpoint.
 * Accepts multiple images.
 */
export const analyzeStyleReference = async (imagesBase64: string[]): Promise<AnalysisResult> => {
  if (imagesBase64.length === 0) {
    return {
      description: "",
      recommendedAspectRatio: "1:1",
      recommendedLighting: "Studio Lighting",
      recommendedPerspective: "Eye Level",
      referenceType: "PRODUCT"
    };
  }

  try {
    const response = await fetch("/api/gemini/analyze-style", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imagesBase64 }),
    });

    const data = await handleApiResponse(response);
    return {
      description: data.description || "",
      recommendedAspectRatio: data.recommendedAspectRatio || "1:1",
      recommendedLighting: data.recommendedLighting || "Studio Lighting",
      recommendedPerspective: data.recommendedPerspective || "Eye Level",
      referenceType: data.referenceType || "PRODUCT"
    };
  } catch (error) {
    console.warn("Style reference analysis notice:", error);
    return {
      description: "High quality, professional photography with balanced studio lighting and composition.",
      recommendedAspectRatio: "1:1",
      recommendedLighting: "Studio Lighting",
      recommendedPerspective: "Eye Level",
      referenceType: "PRODUCT"
    };
  }
};

/**
 * Performs a deep visual analysis of reference and product images for scene integration.
 * Used exclusively in OFF: Scene Preserve mode via server-side API.
 */
export const analyzeSceneStructure = async (
  referenceImagesBase64: string[],
  productImagesBase64: string[]
): Promise<string> => {
  try {
    const response = await fetch("/api/gemini/analyze-scene", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ referenceImagesBase64, productImagesBase64 }),
    });

    const data = await handleApiResponse(response);
    return data.text || "Analysis complete.";
  } catch (error) {
    console.warn("Scene structure analysis notice:", error);
    return "Preserving reference scene atmosphere, perspective, and lighting while integrating the hero product.";
  }
};

export interface FidelityAnalysisResult {
  productUnderstanding: string;
  referenceUnderstanding: string;
  preservationDirectives: string;
  adaptationDirectives: string;
  synthesizedPromptDirective: string;
}

export const getFallbackFidelityAnalysis = (
  fidelity: number,
  productCount = 1
): FidelityAnalysisResult => {
  const rounded = Math.round(Math.max(0, Math.min(100, fidelity)));
  const deviation = 100 - rounded;

  if (rounded === 100) {
    return {
      productUnderstanding: `Uploaded hero product (${productCount} view(s)). Preserving packaging design, typography, materials, and geometry accurately.`,
      referenceUnderstanding: `Reference scene visual structure, composition framing, lighting vectors, and environmental setting.`,
      preservationDirectives: `STRICT 100% PRESERVATION: Keep reference scene composition, camera angle, lighting architecture, environment, and background 100% intact.`,
      adaptationDirectives: `ZERO SECONDARY VARIATION (0%): Only replace the reference product with the uploaded product, matching scale, perspective, contact shadows, and specular highlights.`,
      synthesizedPromptDirective: `Strict 100% reference preservation: Replace reference product with uploaded hero product while keeping surrounding composition, lighting, and environment completely faithful.`
    };
  }

  if (rounded === 99) {
    return {
      productUnderstanding: `Uploaded hero product (${productCount} view(s)). Preserving packaging design, typography, materials, and geometry accurately.`,
      referenceUnderstanding: `Reference scene visual style, overall composition, lighting architecture, and environmental context.`,
      preservationDirectives: `PRESERVE 99% OF REFERENCE: Maintain core visual identity, overall composition, camera perspective, lighting language, and scene structure.`,
      adaptationDirectives: `DELIBERATE 1% SECONDARY RECONSTRUCTION: Introduce subtle visible adjustments to secondary props, textures, or supporting environmental details matching the product.`,
      synthesizedPromptDirective: `Near-lock 99% reference preservation with intentional small creative reconstruction in secondary details while keeping reference immediately recognizable.`
    };
  }

  if (rounded === 50) {
    return {
      productUnderstanding: `Uploaded hero product (${productCount} view(s)). Preserving packaging design, typography, materials, and geometry accurately.`,
      referenceUnderstanding: `Reference scene core visual DNA, mood, color relationships, lighting philosophy, and material language.`,
      preservationDirectives: `PRESERVE 50% REFERENCE DNA: Extract core concept, mood, lighting philosophy, shadow behavior, and reflection language as visual foundation.`,
      adaptationDirectives: `50% CREATIVE RECONSTRUCTION: Create a substantially new commercial composition inspired by the reference; rebuild environment and supporting storytelling around the product.`,
      synthesizedPromptDirective: `Balanced 50% hybrid: Ground in reference visual DNA while building a genuinely new commercial composition tailored to the hero product.`
    };
  }

  if (rounded >= 51) {
    return {
      productUnderstanding: `Uploaded hero product (${productCount} view(s)). Preserving packaging design, typography, materials, and geometry accurately.`,
      referenceUnderstanding: `Reference scene composition hierarchy, lighting architecture, camera language, and environmental atmosphere.`,
      preservationDirectives: `PRESERVE ${rounded}% OF REFERENCE: Lock ${rounded}% of reference scene structure, camera angle, lighting vectors, and primary environment.`,
      adaptationDirectives: `ALLOW ${deviation}% CREATIVE ADAPTATION: Intelligently adapt secondary elements, props, and background cues to naturally complement the product.`,
      synthesizedPromptDirective: `High reference fidelity (${rounded}%): Maintain strong structural preservation while allowing ${deviation}% controlled product-specific creative adaptation.`
    };
  }

  if (rounded >= 1) {
    return {
      productUnderstanding: `Uploaded hero product (${productCount} view(s)). Preserving packaging design, typography, materials, and geometry accurately.`,
      referenceUnderstanding: `Reference visual concept, mood, color palette inspiration, lighting philosophy, and storytelling principles.`,
      preservationDirectives: `PRESERVE ${rounded}% CONCEPTUAL DNA: Extract core visual idea, lighting philosophy, and aesthetic essence from reference.`,
      adaptationDirectives: `ALLOW ${deviation}% HIGH CREATIVE RECONSTRUCTION: Build a genuinely new commercial scene staging the uploaded product as the hero from the ground up.`,
      synthesizedPromptDirective: `Creative reconstruction (${rounded}% fidelity): Rebuild the visual idea of the reference into an original commercial scene tailored to the hero product.`
    };
  }

  return {
    productUnderstanding: `Uploaded hero product (${productCount} view(s)). Preserving packaging design, typography, materials, and geometry accurately.`,
    referenceUnderstanding: `Reference image used purely as conceptual Creative DNA.`,
    preservationDirectives: `0% STRUCTURAL PRESERVATION: Do not copy reference composition, physical layout, or specific objects.`,
    adaptationDirectives: `100% CREATIVE FREEDOM: Compose a completely original high-end commercial visual tailored to the product's identity.`,
    synthesizedPromptDirective: `Maximum creative freedom (0% fidelity): Pure Creative DNA inspiration for an original commercial scene.`
  };
};

/**
 * Performs a fresh fidelity-dependent visual intelligence analysis evaluating product and reference
 * compatibility at the exact selected continuous fidelity percentage (0% to 100%).
 */
export const analyzeFidelityRelationship = async (
  productImagesBase64: string[],
  referenceImagesBase64: string[],
  fidelity: number
): Promise<FidelityAnalysisResult> => {
  try {
    const response = await fetch("/api/gemini/analyze-fidelity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productImagesBase64,
        referenceImagesBase64,
        fidelity,
      }),
    });

    const data = await handleApiResponse(response);
    if (data && data.productUnderstanding && data.synthesizedPromptDirective) {
      return data;
    }
    return getFallbackFidelityAnalysis(fidelity, productImagesBase64.length);
  } catch (error) {
    console.warn("Fidelity analysis notice (using resilient fallback):", error);
    return getFallbackFidelityAnalysis(fidelity, productImagesBase64.length);
  }
};

/**
 * Generates the edited product image using Nano Banana (gemini-2.5-flash-image).
 * Supports arrays of product images and optional reference images.
 * Uses the exact prompt string provided by the caller via server-side API.
 */
export const generateEditedImage = async (
  productImagesBase64: string[],
  prompt: string,
  aspectRatio: string,
  referenceImagesBase64: string[] = []
): Promise<string> => {
  try {
    const response = await fetch("/api/gemini/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productImagesBase64,
        prompt,
        aspectRatio,
        referenceImagesBase64,
      }),
    });

    const data = await handleApiResponse(response);
    if (!data.imageData) {
      throw new Error("No image data returned from server");
    }

    return data.imageData;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

/**
 * Helper to convert Blob/File to Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};
