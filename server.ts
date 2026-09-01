import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

// Set high limit for base64 image payloads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the server environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

function parseBase64Image(raw: string, fallbackMime = "image/jpeg") {
  if (typeof raw !== "string" || !raw) return { mimeType: fallbackMime, data: "" };
  if (raw.startsWith("data:")) {
    const match = raw.match(/^data:([^;]+);base64,(.*)$/);
    if (match) {
      return { mimeType: match[1], data: match[2] };
    }
  }
  const data = raw.includes(",") ? raw.split(",")[1] : raw;
  return { mimeType: fallbackMime, data };
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const TEXT_FALLBACK_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.1-pro",
];

/**
 * Executes Gemini generateContent with automatic exponential backoff retry and model fallback cascade
 * to smoothly handle temporary 503 (high demand) and 429 (rate limit) spikes.
 */
async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: {
    models?: string[];
    contents: any;
    config?: any;
  },
  maxRetriesPerModel = 1
) {
  const models = params.models || TEXT_FALLBACK_MODELS;
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return { response, model };
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        const status = err?.status || err?.statusCode || err?.error?.code || err?.code;
        const isNotFound =
          status === 404 ||
          msg.includes("404") ||
          msg.includes("NOT_FOUND") ||
          msg.includes("no longer available");
        const is503HighDemand =
          status === 503 ||
          msg.includes("503") ||
          msg.includes("high demand") ||
          msg.includes("UNAVAILABLE");
        const is429RateLimit =
          status === 429 ||
          msg.includes("429") ||
          msg.includes("RESOURCE_EXHAUSTED") ||
          msg.toLowerCase().includes("quota");

        if (isNotFound) {
          // Model does not exist or deprecated, immediately skip to next model
          break;
        }

        console.warn(
          `[Gemini API] Model '${model}' attempt ${attempt + 1}/${maxRetriesPerModel + 1} notice: ${msg}`
        );

        // If the model is under 503 high demand, immediately advance to the next available model in cascade
        if (is503HighDemand) {
          break;
        }

        if (attempt < maxRetriesPerModel && is429RateLimit) {
          const waitTime = Math.min(800 * Math.pow(2, attempt) + Math.random() * 400, 3000);
          await delay(waitTime);
        } else {
          break;
        }
      }
    }
  }

  throw lastError || new Error("All Gemini model attempts failed.");
}

function handleGeminiError(error: any, res: express.Response) {
  console.error("Gemini API server error:", error);
  const status = error?.status || error?.statusCode || error?.error?.code || 500;
  const message = error?.message || error?.error?.message || "Unknown error calling Gemini API";
  const isHighDemand =
    status === 503 ||
    message.toLowerCase().includes("high demand") ||
    message.toLowerCase().includes("unavailable") ||
    message.includes("503");
  const isRateLimit =
    status === 429 ||
    message.toLowerCase().includes("rate") ||
    message.toLowerCase().includes("quota") ||
    message.toLowerCase().includes("resource_exhausted") ||
    message.includes("429");
  
  const code = isHighDemand
    ? "UNAVAILABLE"
    : isRateLimit
    ? "RESOURCE_EXHAUSTED"
    : "GEMINI_API_ERROR";

  const httpStatus = isHighDemand
    ? 503
    : isRateLimit
    ? 429
    : typeof status === "number" && status >= 400 && status < 600
    ? status
    : 500;

  const userFacingMessage = isHighDemand
    ? "The AI model is currently experiencing temporary high demand. Please try again in a few moments."
    : isRateLimit
    ? "Rate limit exceeded. Please wait a moment and try again."
    : message;

  res.setHeader("Content-Type", "application/json");
  res.status(httpStatus).json({
    error: {
      message: userFacingMessage,
      code,
      status: httpStatus,
      details: error?.error?.details || error?.details || undefined,
    },
  });
}

// API Health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Style reference analysis - Deep Visual Intelligence & DNA Reconstruction Engine
app.post("/api/gemini/analyze-style", async (req, res) => {
  try {
    const { imagesBase64 } = req.body;
    if (!imagesBase64 || !Array.isArray(imagesBase64) || imagesBase64.length === 0) {
      res.json({
        description: "",
        recommendedAspectRatio: "1:1",
        recommendedLighting: "Studio Lighting",
        recommendedPerspective: "Eye Level",
        referenceType: "PRODUCT",
      });
      return;
    }

    const ai = getGeminiClient();
    const parts: any[] = [];

    imagesBase64.forEach((base64: string, index: number) => {
      const parsed = parseBase64Image(base64);
      if (parsed.data) {
        parts.push({
          inlineData: {
            mimeType: parsed.mimeType,
            data: parsed.data,
          },
        });
        if (imagesBase64.length > 1) {
          parts.push({ text: `[Reference Image ${index + 1}]` });
        }
      }
    });

    parts.push({
      text: `YOU ARE A WORLD-CLASS COMMERCIAL ART DIRECTOR, CINEMATOGRAPHER, AND 3D SCENE/LIGHTING SCIENTIST.

YOUR MISSION:
Perform a deep, multi-layer visual intelligence analysis of the provided reference image(s).
Treat the reference as a CREATIVE BLUEPRINT and VISUAL DNA to reconstruct a brand-new, high-end commercial scene centered around the user's product as the HERO ASSET.

================================================================================
CORE MINDSET: REFERENCE → CREATIVE BLUEPRINT (ANTI-COPY & ANTI-COMPOSITE RULE)
================================================================================
When the reference contains NO product (e.g. an animal, bird, person, character, portrait, object, environment, architecture, or cinematic scene):
- DO NOT simply take the reference subject and place the product beside it.
- DO NOT create a cutout + product paste, generic product placement, or an unchanged reference with a product added.
- The reference provides the VISUAL DNA and CREATIVE BLUEPRINT.
- Understand the visual idea behind the reference and RECONSTRUCT a new, cohesive commercial scene around the product using that same visual DNA.
- The result must feel like a NEW professional advertisement that was creatively inspired and structurally derived from the reference.
- ABSOLUTE ANTI-COMPOSITE RULE: Never allow the creative direction to become "place the product next to the animal/person". Always ask: "WHAT IS THE SUBJECT DOING WITH THE PRODUCT?" and "WHY IS THE PRODUCT PART OF THIS MOMENT?"

================================================================================
NEW INTERNAL LAYER: SEMANTIC CREATIVE ACTION & SCENE RECONSTRUCTION
================================================================================

1. THE REFERENCE SUBJECT IS A CREATIVE ACTOR:
   - Classify the subject (animal, bird, person, character, creature, lifestyle subject) as a CREATIVE ACTOR, not merely a decorative visual element.
   - Determine: What is this subject? What is its role? What is it naturally capable of doing? What behavior is visually believable? What personality does it communicate? What emotional reaction does it create? What type of interaction would make sense with the Product? How can the subject become the protagonist of the Product story?
   - The subject should actively participate in the advertisement.

2. PRODUCT SEMANTIC UNDERSTANDING:
   - Analyze: Product category, product purpose, product usage, flavor/scent/function, physical form, size, material.
   - Determine how a real person or creature would realistically interact with it (consumed, worn, held, used, displayed, poured, sprayed, opened, applied, examined, tasted, etc.).
   - DO NOT assume every product should be held. DO NOT assume every product should be beside the subject. Derive the interaction from the product's actual nature.

3. CREATIVE INTERACTION DECISION ENGINE:
   - Internally evaluate: "What is the most visually powerful AND physically believable way this subject could interact with this Product?"
   - Select the strongest concept based on: (1) Product category, (2) Product purpose, (3) Subject anatomy, (4) Subject behavior, (5) Reference personality, (6) Reference composition, (7) Commercial storytelling, (8) Physical plausibility, (9) Visual impact, (10) Product visibility.
   - Choose the interaction that creates the strongest advertisement.

4. THE ACTION MUST CHANGE THE SCENE (PRODUCT + SUBJECT = ONE EVENT):
   - The chosen interaction must influence the entire composition: body position, head position, mouth position, limb position, product orientation, distance from body, camera framing, depth, background relationship, shadows, contact points, lighting, reflections.
   - The viewer must immediately understand: "Something is happening here."
   - The Product has a reason to exist; the Subject has a reason to interact; the environment supports the interaction; the camera captures the moment intentionally.

5. RECONSTRUCT THE ENVIRONMENT WHEN NECESSARY & INTENTIONAL PROPS:
   - The reference environment is not sacred. Preserve the reference's visual atmosphere, color language, lighting personality, material language, and emotional tone, but allow the environment to evolve (new surfaces, furniture, architectural elements, atmospheric cues) to support the interaction.
   - Only add supporting props if they help explain the product interaction; keep the scene clean, intentional, premium, and commercially controlled.

6. SUBJECT REPOSITIONING & ANATOMICAL RESPECT:
   - The subject may be repositioned, reframed, rotated, scaled, moved closer/farther, or changed in pose/gaze/gesture to create the product interaction.
   - ANIMAL / BIRD / CREATURE LOGIC: Respect anatomy (limbs, paws, claws, wings, beak, mouth, jaw mechanics, neck movement, body weight, center of gravity, natural range of motion, species behavior). Believability > random creativity. If holding is anatomically plausible, create believable grip; if not, construct another natural interaction (drinking posture, inspection, dynamic motion).
   - HUMAN SUBJECT LOGIC: Understand posture, hand placement, facial expression, gaze, gesture, styling, and body language.

7. CHARACTER EXPRESSION & EMOTIONAL REACTION:
   - Determine whether the subject communicates curiosity, enjoyment, confidence, surprise, calmness, desire, satisfaction, focus, playfulness, power, or discovery based on the product and reference context.

8. PRODUCT MUST REMAIN THE COMMERCIAL HERO:
   - Maintain clear product visibility, correct proportions, packaging design, logo, label, typography, colors, shape, perspective, realistic reflections, highlights, contact shadows, and material response.

9. TRUE 3D SCENE THINKING & PHOTONICS:
   - Spatial depth: Foreground → Subject → Product → Interaction → Midground → Background.
   - Camera serves the action: Select camera elevation and lens (eye-level, low angle, extreme low angle, high angle, close-up, medium shot, environmental portrait, macro, etc.) that best communicates the interaction.
   - Lighting rebuilds around the new action: Coherent key vector, fill, ambient bounce, rim separation, contact shadows, and reciprocal reflections.

10. CREATIVE QUALITY CHECK (8 VALIDATION QUESTIONS):
    Ensure the creative blueprint passes:
    (1) Is the subject actively participating?
    (2) Does the product have a meaningful role?
    (3) Is there a clear physical/narrative relationship?
    (4) Did the scene get reconstructed around the relationship?
    (5) Does the interaction make physical sense?
    (6) Does the subject preserve recognizable Reference DNA?
    (7) Does the product remain accurate and commercially usable?
    (8) Does the final image look like a new advertisement rather than a composite?

================================================================================
OUTPUT FORMAT REQUIREMENT:
================================================================================
Generate the 'description' field strictly using this structured CREATIVE BLUEPRINT:

[ REFERENCE_DNA ]
• Classification & Archetype: [PRODUCT, LIFESTYLE, ANIMAL_CHARACTER, ENVIRONMENT, or CINEMATIC_CONCEPT, with aesthetic tier]
• The Core Visual Idea: [What is the core visual concept? Why does this composition work?]
• Underlying Construction Logic: [Why this visual system works; the hidden physical, character, lighting & optical balance]

[ CREATIVE_ACTOR_&_SUBJECT_DECOMPOSITION ] (Detail if person/animal/bird/character present, or state 'None - Pure environment/still-life staging')
• Identity, Species & Anatomy: [Species/human classification, distinctive facial structure, body anatomy, silhouette, proportions]
• Expression, Gaze & Personality: [Facial expression, emotional state, eye direction, head angle, personality conveyed visually]
• Posture, Gestures & Natural Behavior: [Body orientation, limb/hand/paw positioning, natural species behavior, posture energy]
• Fur, Feathers, Hair, Skin & Styling: [Micro-textures, fur strands, feather patterns, skin pores, clothing, accessories, physical details]
• Spatial Staging & Camera Relationship: [Distance to camera, scale in frame, lens perspective, optical depth]

[ PRODUCT_SEMANTIC_ANALYSIS_&_PURPOSE ]
• Category, Form & Usage: [Product category, physical form, materials, usage mode (consumed, worn, held, applied, poured, displayed, etc.)]
• Semantic Role in Scene: [Why the product exists in this specific moment and how it connects to the subject's world]

[ SEMANTIC_CREATIVE_ACTION_&_INTERACTION_ENGINE ]
• Chosen Interaction Concept: [The specific meaningful action selected by the decision engine (e.g. drinking, tasting, holding with authentic grip, inspecting, presenting, applying, or dynamic motion)]
• Physical Action Mechanics: [Exact body/head/mouth/limb/paw positioning, contact points, grip anatomy, weight distribution, and ambient occlusion]
• Emotional Resonance & Reaction: [Subject's reaction — enjoyment, curiosity, confidence, satisfaction, focus, power, or discovery]

[ SCENE_RECONSTRUCTION_&_ENVIRONMENT_EVOLUTION ]
• Environmental Adaptation: [How the environment and surfaces have evolved to support the action while preserving the reference's atmospheric DNA]
• Supporting Props & Storytelling Accents: [Intentional, clean secondary elements supporting the product interaction]
• Spatial Depth & Hierarchy: [Foreground → Subject → Product → Interaction → Midground → Background]

[ PRODUCT_INTEGRATION_DNA ]
• Hero Stance & Scale: [Scale relationship, orientation, tilt, placement (e.g. handheld, hero foreground, interacted)]
• Physical Grounding & Occlusion: [Contact points, ambient occlusion crevices, surface settling, and overlapping depth cues]
• Reciprocal Interaction: [Environmental/skin/fur light bounce on product surfaces and cast shadows/reflections onto the scene]

[ CAMERA_DNA ]
• Elevation & Perspective: [Action-serving camera height, pitch, tilt, shooting distance, horizon line, and vanishing points]
• Optical Characteristics: [Focal length compression/expansion, field of view, aperture depth of field, focus plane, and lens character]

[ LIGHTING_DNA ]
• Key & Fill Setup: [Key vector, elevation, source softness, fill ratio, and ambient balance across subject(s) and product]
• Rim, Bounce & Shadows: [Rim separation, environmental/character bounce, contact shadows, and shadow falloff]

[ MATERIAL_DNA ]
• Surface & Specular Response: [Physics of skin, fur, feathers, fabrics, glass, metal, plastic, liquid, stone, or organics present]
• Textural Fidelity: [Micro-textures, pores, fur strands, weave, fresnel edge response, and highlight roll-off]

[ ENVIRONMENT_&_DEPTH_DNA ]
• Spatial Staging: [Foreground cues, midground hero stage, background atmosphere, and atmospheric perspective]
• Setting & Mood: [Physical architecture, surface textures, time of day, and environmental scale]

[ COLOR_DNA ]
• Harmony & Grading: [Dominant environmental tones, subject tones, product color relationship, warm/cool balance, and grading curves]

[ VISUAL_FINISH_DNA ]
• Photographic Polish: [Commercial retouching standard, optical softness, micro-contrast, and realistic reflections]

[ CREATIVE_RECONSTRUCTION_BLUEPRINT ]
• What to Build: [An original commercial advertisement inspired by the extracted DNA]
• How Product & Subject Command the Frame: [Seamless shared physical space, authentic interaction, heroic scale, and reciprocal lighting]
• How the Camera Sees the Scene: [Precise elevation, focal compression/expansion, and focus hierarchy]
• How Light & Materials Behave: [Coherent photonics, specular highlights, character illumination, and natural shadow stacking]
• Weaknesses to Avoid: [Explicit list of reference artifacts, flat lighting, stiff poses, pasted cutouts, or AI clichés to eliminate]

================================================================================
METADATA FIELDS:
================================================================================
- recommendedAspectRatio: Select the ideal aspect ratio ("1:1", "3:4", "4:3", "9:16", "16:9").
- recommendedLighting: Inferred lighting descriptor based on the optical analysis (e.g. "Studio Lighting", "Natural Sunlight", "Hard Side Light", "Rembrandt Lighting", "Butterfly Lighting", "Rim Light", "Backlight", "Top Light", "Underlight", "Split Lighting", "Overcast Soft Light", "Window Light", "Cinematic Volumetric Light", "High-Key Lighting", "Low-Key Lighting", "Product Spotlight", "Sunset Backlight", "Cool Moonlight", "HDRI Environment Light", "Neon Cyberpunk", "Dramatic Shadows", "Softbox Diffused", "Golden Hour", or custom descriptor).
- recommendedPerspective: Inferred camera perspective based on the optical analysis (e.g. "Eye Level", "Bird View Shot", "Extreme Low Angle", "Fisheye Angle", "Low Angle Shot", "Up Down Wide", "Extreme Close Up", "Macro Close-up", "Flat Lay (Top Down)", "Isometric View", or custom descriptor).
- referenceType: "PRODUCT" if primarily focused on product/still-life; "LIFESTYLE" if featuring people, animals, models, or cinematic character interaction.`,
    });

    const { response } = await generateContentWithRetry(ai, {
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.STRING,
              description: "The complete structured CREATIVE BLUEPRINT with all DNA sections and reconstructed visual intelligence.",
            },
            recommendedAspectRatio: {
              type: Type.STRING,
              enum: ["1:1", "3:4", "4:3", "9:16", "16:9"],
              description: "The optimal aspect ratio for the scene.",
            },
            recommendedLighting: {
              type: Type.STRING,
              description: "The optimal matching lighting style inferred from reference.",
            },
            recommendedPerspective: {
              type: Type.STRING,
              description: "The optimal matching camera perspective inferred from reference.",
            },
            referenceType: {
              type: Type.STRING,
              enum: ["PRODUCT", "LIFESTYLE"],
              description: "Classifies the image as either 'PRODUCT' or 'LIFESTYLE'.",
            },
          },
          required: ["description", "recommendedAspectRatio", "recommendedLighting", "recommendedPerspective", "referenceType"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text response from analysis");
    }

    const json = JSON.parse(text);
    res.setHeader("Content-Type", "application/json");
    res.json({
      description: json.description || "",
      recommendedAspectRatio: json.recommendedAspectRatio || "1:1",
      recommendedLighting: json.recommendedLighting || "Studio Lighting",
      recommendedPerspective: json.recommendedPerspective || "Eye Level",
      referenceType: json.referenceType || "PRODUCT",
    });
  } catch (error) {
    handleGeminiError(error, res);
  }
});

// Scene structure analysis - Deep Physical & Spatial Intelligence
app.post("/api/gemini/analyze-scene", async (req, res) => {
  try {
    const { referenceImagesBase64, productImagesBase64 } = req.body;
    const ai = getGeminiClient();
    const parts: any[] = [];

    if (Array.isArray(referenceImagesBase64)) {
      referenceImagesBase64.forEach((base64: string, idx: number) => {
        const parsed = parseBase64Image(base64);
        if (parsed.data) {
          parts.push({
            inlineData: {
              mimeType: parsed.mimeType,
              data: parsed.data,
            },
          });
          parts.push({ text: `[Reference Scene Image ${idx + 1}]` });
        }
      });
    }

    if (Array.isArray(productImagesBase64)) {
      productImagesBase64.forEach((base64: string, idx: number) => {
        const parsed = parseBase64Image(base64);
        if (parsed.data) {
          parts.push({
            inlineData: {
              mimeType: parsed.mimeType,
              data: parsed.data,
            },
          });
          parts.push({ text: `[Product Subject Image ${idx + 1}]` });
        }
      });
    }

    parts.push({
      text: `PERFORM A DEEP STRUCTURAL, SPATIAL, AND PHYSICAL VISUAL ANALYSIS for SEAMLESS SCENE INTEGRATION.

INSPIRATION & SPATIAL INTEGRATION RULE:
- Infer the physical logic, spatial planes, and lighting dynamics of the scene.
- Apply the formula: ROLE → POSITION → SCALE → DEPTH → LIGHT → MATERIAL → RELATIONSHIP → PURPOSE.

1. SPATIAL & PERSPECTIVE ARCHITECTURE:
   - Identify camera pitch, optical horizon line, visual balance center, and depth plane layering.
   - Establish true focal length compression and optical scale cues.

2. GROUNDING & PHYSICAL FORCES:
   - Identify precise contact points, surface friction, weight distribution, and ambient occlusion crevices.
   - Analyze resting planes, surface tilts, and environmental forces (compression, balance, gravity).

3. LIGHTING & OPTICAL RECIPROCITY:
   - Map key light vectors, secondary bounce fill, rim separation, and contact shadow softness.
   - Trace reciprocal light interactions: how the environment casts light and reflections onto the product, and how the product casts contact shadows and specular bounce back onto the scene.

4. MATERIAL RESPONSE:
   - Define exact material reactions across glass, metal, stone, wood, cloth, or moisture textures.
   - Enforce specular roll-off, fresnel edge falloff, and micro-texture integrity.

5. FINAL SYNTHESIS DIRECTIVE:
   - Output a cohesive, highly detailed creative integration directive for the image generation engine that ensures flawless physical grounding, natural scale, realistic shadow stacking, and commercial-grade art direction.`,
    });

    const { response } = await generateContentWithRetry(ai, {
      contents: { parts },
    });

    res.setHeader("Content-Type", "application/json");
    res.json({ text: response.text || "Analysis complete." });
  } catch (error) {
    handleGeminiError(error, res);
  }
});

// Fidelity-dependent Relationship Analysis - Evaluates product and reference compatibility at the exact continuous fidelity percentage
app.post("/api/gemini/analyze-fidelity", async (req, res) => {
  try {
    const { referenceImagesBase64, productImagesBase64, fidelity } = req.body;
    const ai = getGeminiClient();
    const parts: any[] = [];

    const targetFidelity = typeof fidelity === "number" ? Math.min(100, Math.max(0, Math.round(fidelity))) : 100;

    if (Array.isArray(productImagesBase64)) {
      productImagesBase64.forEach((base64: string, idx: number) => {
        const parsed = parseBase64Image(base64);
        if (parsed.data) {
          parts.push({
            inlineData: {
              mimeType: parsed.mimeType,
              data: parsed.data,
            },
          });
          parts.push({ text: `[Product Subject Image ${idx + 1}]` });
        }
      });
    }

    if (Array.isArray(referenceImagesBase64)) {
      referenceImagesBase64.forEach((base64: string, idx: number) => {
        const parsed = parseBase64Image(base64);
        if (parsed.data) {
          parts.push({
            inlineData: {
              mimeType: parsed.mimeType,
              data: parsed.data,
            },
          });
          parts.push({ text: `[Reference Scene Image ${idx + 1}]` });
        }
      });
    }

    parts.push({
      text: `YOU ARE A WORLD-CLASS COMMERCIAL ART DIRECTOR AND PRODUCT–SCENE REASONING SCIENTIST.

MISSION:
Perform a deep visual intelligence reasoning pass evaluating the relationship between the USER'S ACTUAL PRODUCT and the REFERENCE SCENE at an exact REFERENCE FIDELITY of ${targetFidelity}%.

================================================================================
REFERENCE FIDELITY — CREATIVE TRANSFORMATION CONTROL PRINCIPLE:
================================================================================
Reference Fidelity is NOT a simple similarity slider or copy command.
It is a CREATIVE TRANSFORMATION CONTROL that determines:
1. HOW MUCH OF THE REFERENCE'S VISUAL DNA is preserved.
2. HOW MUCH NEW CREATIVE INTERPRETATION is introduced.
3. The distinction between REFERENCE DNA (mood, lighting philosophy, color relationships, material physics) and REFERENCE PIXEL STRUCTURE (exact composition, camera position, background coordinates, props).

================================================================================
EXACT 21-DIMENSION REFERENCE DECONSTRUCTION MANDATE:
================================================================================
Before applying Reference Fidelity, you must analyze and decompose the reference across these 21 dimensions:
1. Core concept
2. Composition & visual hierarchy
3. Product placement & spatial role
4. Subject placement (persons, animals, birds, characters)
5. Camera position & distance
6. Camera angle & elevation
7. Lens characteristics & focal length feel
8. Perspective & optical convergence
9. Lighting direction & key vectors
10. Lighting intensity & contrast ratios
11. Shadow structure & penumbra softness
12. Reflection behavior & specular highlights
13. Materials & surface response
14. Color relationships & palette grading
15. Background structure & architecture
16. Foreground structure & framing elements
17. Depth planes (foreground, midground, background)
18. Atmosphere & ambient mood
19. Secondary objects & supporting props
20. Visual storytelling & narrative intent
21. Product/environment interaction mechanics

================================================================================
PRODUCT-SPECIFIC INTELLIGENCE (MANDATORY FOR ALL FIDELITY LEVELS):
================================================================================
Analyze the user's actual product thoroughly:
- Product identity, name, and exact category.
- Flavor, scent, variant, or formulation when visually inferable from packaging.
- Materials (glass, frosted glass, brushed metal, matte plastic, gloss paper, liquids, textiles).
- Geometry, shape, aspect ratio, and physical scale.
- Visual personality and brand aesthetics.
- Relevant ingredients, botanicals, or visual associations.
- Relevant environmental associations (kitchen, luxury vanity, bathroom, outdoor nature, studio, athletic, cafe).
- Physical interaction possibilities (holding, pouring, applying, opening, tasting, resting, spraying).

CRITICAL PRODUCT-SPECIFIC RULE:
- NEVER blindly copy reference ingredients or props that contradict the user's product (e.g. if the reference uses strawberries but the user's product is banana or citrus flavored, do NOT preserve strawberries; adapt supporting storytelling elements to banana/citrus or appropriate neutral luxury textures).
- Every creative modification must have a visual, physical, or commercial justification.

================================================================================
EXACT FIDELITY BEHAVIORAL EXECUTION AT ${targetFidelity}%:
================================================================================
${targetFidelity === 100 ? `
>>> ABSOLUTE 100% RULE (SPECIAL PRODUCT REPLACEMENT MODE):
- This is the ONLY percentage that acts as strict reference preservation and direct replacement.
- Treat the reference scene as the absolute structural source.
- Preserve 100% of the reference: composition, subject placement, product position, camera angle, camera height, lens perspective, framing, lighting direction, lighting character, color relationships, environment, background, foreground, shadows, reflections, depth, atmosphere, visual hierarchy, and major secondary objects.
- The ONLY primary creative operation at 100% is: REPLACE / INSERT THE REFERENCE PRODUCT WITH THE USER'S PRODUCT.
- The user's product occupies the same intended position and role, with physically correct scale, perspective, contact shadows, reflections, and lighting integration.
- Formula: REFERENCE SCENE + USER PRODUCT REPLACEMENT = FINAL RESULT.
- ZERO secondary variation (0% creative redesign).
` : targetFidelity === 99 ? `
>>> CRITICAL 99% RULE (LEAVES STRICT REPLACEMENT MODE):
- 99% MUST NOT behave like 100%. The moment fidelity drops to 99%, the system leaves strict replacement mode.
- Preserve the reference's core visual identity, overall composition, visual style, camera language, lighting language, and environment.
- BUT introduce small, deliberate, visible changes to secondary visual elements:
  • Subtle secondary object modification
  • Small environmental or surface detail variation
  • Slight background detail variation
  • Subtle prop or ingredient variation matching the user's product
  • Small texture or atmospheric variation
  • Subtle interaction between the product and surrounding elements
- The changes must be restrained and the reference immediately recognizable, but visibly distinct from a pure replacement.
` : targetFidelity >= 50 ? `
>>> 50% — 98% PROGRESSIVE CREATIVE RECONSTRUCTION RANGE:
- Selected Fidelity: ${targetFidelity}% (Preservation: ${targetFidelity}%, Creative Leeway: ${100 - targetFidelity}%).
- Continuously interpolates between near-lock reference preservation and balanced creative reconstruction.
- Higher percentage (${targetFidelity}%): Preserves more reference structure, composition, camera language, lighting, and environment. Introduces fewer creative changes.
- Lower percentage: Preserves less literal structure; introduces more creative reconstruction, environmental variation, original composition decisions, and product-specific visual storytelling.
${targetFidelity === 50 ? `
- AT EXACTLY 50% (BALANCED RECONSTRUCTION):
  • The reference provides a strong visual foundation.
  • Preserve: core visual concept, mood, visual DNA, color relationships, lighting philosophy, shadow behavior, reflection philosophy, material language, product/environment relationship, general camera language.
  • DO NOT COPY THE SCENE. Create a substantially new commercial composition inspired by the reference.
  • The product's position may change, background may change, supporting elements may change, composition may change, camera framing may change moderately, lens may change moderately.
  • Environmental storytelling is rebuilt around the user's product.
` : ''}
` : `
>>> 10% — 49% HIGH CREATIVE RECONSTRUCTION RANGE:
- Selected Fidelity: ${targetFidelity}% (Preservation: ${targetFidelity}%, Creative Leeway: ${100 - targetFidelity}%).
- The reference provides: visual idea, mood, color inspiration, lighting philosophy, material behavior, shadow/reflection language, conceptual relationship, visual storytelling principles.
- Do NOT reproduce reference composition literally.
- Build a genuinely new commercial scene where the user's product is the hero from the beginning.
- Ask: "What is the visual idea behind this reference?" and "How can this visual idea be rebuilt specifically for the user's product?"
${targetFidelity === 0 ? `
- AT 0%: Maximum creative freedom, pure Creative DNA extraction only.
` : ''}
`}

================================================================================
NON-PRODUCT REFERENCE SCENES (ANIMALS, BIRDS, PEOPLE, CHARACTERS):
================================================================================
- When the reference has no product, classify the subject as a CREATIVE ACTOR.
- Invent a natural, meaningful physical interaction (holding, drinking, tasting, wearing, using, examining) derived from the product's true purpose.
- At 100%: Preserve subject anatomy, facial features, species DNA, and scene setting 100%, integrating the product with authentic physical contact.
- Below 100%: Progressively allow posture, interaction, and scene evolution proportional to the allowed ${100 - targetFidelity}% creative leeway while preserving the subject's visual character DNA.

================================================================================
OUTPUT REQUIREMENTS:
================================================================================
Generate a comprehensive, structured evaluation in valid JSON:
- productUnderstanding: Deep analysis of the user's product identity, category, flavor/variant if applicable, materials, colors, physical properties, and storytelling associations.
- referenceUnderstanding: Structured deconstruction of the reference across key dimensions (concept, composition, camera, lighting, environment, materials, mood, subjects).
- preservationDirectives: Explicit, detailed list of what MUST be strictly preserved from the reference at ${targetFidelity}% fidelity.
- adaptationDirectives: Exact product-specific adaptations, secondary element refinements, environment adjustments, and interaction mechanics appropriate for ${targetFidelity}% fidelity.
- synthesizedPromptDirective: A consolidated, authoritative instructions block to be embedded into the generation prompt specifying precise preservation vs reconstruction parameters.`,
    });

    const { response } = await generateContentWithRetry(ai, {
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productUnderstanding: { type: Type.STRING },
            referenceUnderstanding: { type: Type.STRING },
            preservationDirectives: { type: Type.STRING },
            adaptationDirectives: { type: Type.STRING },
            synthesizedPromptDirective: { type: Type.STRING },
          },
          required: [
            "productUnderstanding",
            "referenceUnderstanding",
            "preservationDirectives",
            "adaptationDirectives",
            "synthesizedPromptDirective",
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text response from fidelity analysis");
    }

    const json = JSON.parse(text);
    res.setHeader("Content-Type", "application/json");
    res.json(json);
  } catch (error) {
    handleGeminiError(error, res);
  }
});

// Image editing and generation
app.post("/api/gemini/generate-image", async (req, res) => {
  try {
    const { productImagesBase64, prompt, aspectRatio, referenceImagesBase64 } = req.body;
    const ai = getGeminiClient();
    const parts: any[] = [];

    if (Array.isArray(productImagesBase64)) {
      productImagesBase64.forEach((base64: string) => {
        const parsed = parseBase64Image(base64);
        if (parsed.data) {
          parts.push({
            inlineData: {
              mimeType: parsed.mimeType,
              data: parsed.data,
            },
          });
        }
      });
    }

    if (Array.isArray(referenceImagesBase64)) {
      referenceImagesBase64.forEach((base64: string) => {
        const parsed = parseBase64Image(base64);
        if (parsed.data) {
          parts.push({
            inlineData: {
              mimeType: parsed.mimeType,
              data: parsed.data,
            },
          });
        }
      });
    }

    parts.push({ text: prompt });

    const validAspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
    const finalAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : "1:1";

    // Primary image generation using official gemini-3.1-flash-image with graceful fallback to gemini-3.1-flash-lite-image
    const candidateModels = ["gemini-3.1-flash-image", "gemini-3.1-flash-lite-image"];
    let generatedImageUrl = "";
    let lastError: any = null;
    let textFeedback = "";

    for (const modelName of candidateModels) {
      for (let attempt = 0; attempt <= 1; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: {
              imageConfig: {
                aspectRatio: finalAspectRatio,
              },
            },
          });

          for (const candidate of response.candidates || []) {
            for (const part of candidate.content?.parts || []) {
              if (part.inlineData && part.inlineData.data) {
                generatedImageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
                break;
              } else if (part.text) {
                textFeedback += part.text + " ";
              }
            }
            if (generatedImageUrl) break;
          }

          if (generatedImageUrl) {
            break;
          }
        } catch (err: any) {
          lastError = err;
          const msg = err?.message || String(err);
          const status = err?.status || err?.statusCode || err?.error?.code || err?.code;
          const is503 =
            status === 503 ||
            msg.includes("503") ||
            msg.includes("high demand") ||
            msg.includes("UNAVAILABLE");

          console.warn(`[Gemini API] Image gen model '${modelName}' attempt ${attempt + 1}/2 notice: ${msg}`);

          if (is503) {
            break; // Switch to the fallback model immediately without delay
          }

          if (attempt < 1) {
            await delay(1000);
          } else {
            break;
          }
        }
      }
      if (generatedImageUrl) break;
    }

    if (!generatedImageUrl) {
      if (lastError) {
        throw lastError;
      }
      throw new Error(textFeedback.trim() ? `Image generation response: ${textFeedback.trim()}` : "No image data found in Gemini response");
    }

    res.setHeader("Content-Type", "application/json");
    res.json({ imageData: generatedImageUrl });
  } catch (error) {
    handleGeminiError(error, res);
  }
});

// Setup Vite middleware for development and static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FreeBirdTool server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
