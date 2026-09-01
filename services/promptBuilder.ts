import { AspectRatio, CameraPerspective, LightingStyle } from "../types";
import { FidelityAnalysisResult } from "./geminiService";

/**
 * Builds the comprehensive Reference Fidelity directive based on the selected percentage (0% - 100%).
 * Provides a true continuous creative transformation control from 0% to 100% where every percentage produces
 * distinct, mathematically calculated, and progressive behavioral instructions.
 * 
 * - EXACTLY 100%: Special strict reference-preserving product replacement mode.
 * - 99%: Near-lock reference preservation with intentional, visible secondary creative reconstruction.
 * - 50% - 98%: Progressive structural preservation with continuous creative reconstruction interpolation.
 * - 50%: Balanced hybrid providing strong visual foundation while composing a genuinely new scene.
 * - 10% - 49%: High creative reconstruction rebuilding the reference visual idea specifically around the user product.
 * - 0%: Pure Creative DNA conceptual extraction with maximum creative freedom.
 */
export function buildReferenceFidelityDirective(
  fidelity: number,
  styleReferenceType: 'PRODUCT' | 'LIFESTYLE' = 'PRODUCT'
): string {
  const roundedFidelity = Math.round(Math.max(0, Math.min(100, fidelity)));
  const preservation = roundedFidelity;
  const deviation = 100 - roundedFidelity;

  // --------------------------------------------------------------------------
  // EXACTLY 100%: ABSOLUTE 100% RULE (STRICT REFERENCE PRESERVATION & DIRECT PRODUCT REPLACEMENT)
  // --------------------------------------------------------------------------
  if (roundedFidelity === 100) {
    return `[ REFERENCE FIDELITY & SCENE EXECUTION PROTOCOL: 100% (STRICT REFERENCE PRESERVATION & PRODUCT REPLACEMENT) ]
----------------------------------------------------------------------
• SELECTED FIDELITY: 100% (ABSOLUTE 100% RULE — STRICT REFERENCE PRESERVATION)
• STRUCTURAL PRESERVATION: 100%
• ALLOWED CREATIVE RECONSTRUCTION / DEVIATION: 0%
• CORE OPERATIONAL HIERARCHY:
  REFERENCE PRESERVATION (100%) > DIRECT HERO PRODUCT REPLACEMENT > PHYSICAL INTEGRATION > ZERO SECONDARY REDESIGN

• THE 100% SPECIAL MODE FORMULA:
  REFERENCE SCENE + USER PRODUCT REPLACEMENT = FINAL RESULT
  (with physically coherent optical, perspective, lighting, and shadow integration).

• WHAT MUST BE STRICTLY PRESERVED (100% LOCKED):
  - Composition & framing: Identical spatial layout, horizon, and visual hierarchy.
  - Product position: The user's product occupies the exact spatial anchor and role of the reference product.
  - Camera position & elevation: Exact camera distance, height, tilt, and optical orientation.
  - Lens perspective & focal compression: Exact focal length characteristics and depth of field falloff.
  - Lighting architecture & vectors: Key light, fill, rim kickers, contrast ratios, and shadow geometries.
  - Color palette & atmosphere: Exact color relationships, grading, ambient tone, and mood.
  - Environment & architecture: Background, surfaces, foreground props, and secondary elements remain 100% intact.
  - Depth planes: Foreground, midground, and background layers remain strictly faithful.

• WHAT MAY CHANGE AT 100%:
  - ONLY the primary product subject is replaced/inserted with the user's uploaded product.
  - Micro-adjustments to contact shadows and reflections strictly necessitated by the new product's physical geometry.

• WHAT MUST NOT CHANGE AT 100%:
  - DO NOT regenerate the scene as a completely new concept.
  - DO NOT redesign the composition or visual layout.
  - DO NOT invent a different camera angle or height.
  - DO NOT change the lens or perspective projection.
  - DO NOT redesign or move the lighting sources.
  - DO NOT alter the background, floor, or environment.
  - DO NOT introduce new secondary props or remove existing objects.

• 10-STEP PRODUCT REPLACEMENT & PHYSICAL INTEGRATION PROTOCOL:
  1. Identify the original hero product in the reference image.
  2. Identify its exact spatial position, center of gravity, and depth plane.
  3. Match its physical scale relative to the surrounding environment and camera.
  4. Match its 3D orientation, tilt, rotation, and camera-facing plane.
  5. Inherit its perspective relationship with the camera lens.
  6. Inherit its physical and optical interaction with the surrounding environment.
  7. Seamlessly insert the uploaded product into the exact visual role of the original product.
  8. Reconstruct lighting, specular highlights, reflections, and ambient occlusion onto the new product.
  9. Cast physically accurate contact shadows and penumbra onto the reference ground surface.
  10. Preserve every other pixel and structural element of the scene.

• PEOPLE, ANIMALS & CHARACTER STAGING (WHEN PRESENT):
  Preserve the subject's exact visual character, species anatomy, facial features, fur/feathers, body orientation, and physical attitude, seamlessly integrating the hero product into their grasp, presence, or scene context with authentic physical contact mechanics and realistic lighting.`;
  }

  // --------------------------------------------------------------------------
  // EXACTLY 99%: CRITICAL 99% RULE (LEAVES STRICT REPLACEMENT MODE)
  // --------------------------------------------------------------------------
  if (roundedFidelity === 99) {
    return `[ REFERENCE FIDELITY & SCENE EXECUTION PROTOCOL: 99% (NEAR-LOCK REFERENCE + DELIBERATE SECONDARY RECONSTRUCTION) ]
----------------------------------------------------------------------
• SELECTED FIDELITY: 99% (CRITICAL 99% RULE — LEAVES STRICT REPLACEMENT MODE)
• STRUCTURAL PRESERVATION: 99%
• ALLOWED CREATIVE RECONSTRUCTION / DEVIATION: 1% (INTENTIONAL & VISIBLE)
• CORE OPERATIONAL HIERARCHY:
  CORE REFERENCE DNA PRESERVATION (99%) > PRODUCT-SPECIFIC HERO INTEGRATION > DELIBERATE 1% SECONDARY RECONSTRUCTION

• THE 99% BEHAVIORAL MANDATE:
  99% MUST NOT behave like 100%. The system has officially left strict replacement mode.
  While remaining extremely close and immediately recognizable as the reference, the system MUST perform a small, intentional, and visible creative reconstruction on secondary visual elements.

• WHAT MUST BE PRESERVED (99%):
  - Core visual identity and overall composition.
  - General camera angle, elevation, and lens perspective.
  - Overall lighting architecture, key direction, and contrast language.
  - Environmental style, color relationships, and atmosphere.
  - Primary subject role and focal placement.

• WHAT MUST BE DELIBERATELY MODIFIED (1% RECONSTRUCTION):
  - Introduce small, deliberate, visible changes to secondary visual elements:
    • Subtle secondary object or prop refinement (adapted to naturally support the user's product).
    • Small environmental variation or surface texture adjustment.
    • Slight background detail variation or lighting accent modulation.
    • Subtle, authentic physical interaction between the product and surrounding elements.
  - Keep modifications restrained so the reference remains immediately recognizable, but noticeably distinct from a pure 100% duplicate replacement.

• WHAT MUST NOT CHANGE:
  - DO NOT rebuild the scene from scratch.
  - DO NOT radically move the camera or alter the primary perspective.
  - DO NOT change the primary color palette or atmospheric mood.`;
  }

  // --------------------------------------------------------------------------
  // EXACTLY 0%: MAXIMUM CREATIVE FREEDOM (PURE CREATIVE DNA)
  // --------------------------------------------------------------------------
  if (roundedFidelity === 0) {
    return `[ REFERENCE FIDELITY & SCENE EXECUTION PROTOCOL: 0% (MAXIMUM CREATIVE FREEDOM — PURE CREATIVE DNA) ]
----------------------------------------------------------------------
• SELECTED FIDELITY: 0% (MAXIMUM CREATIVE FREEDOM)
• STRUCTURAL PRESERVATION: 0%
• ALLOWED CREATIVE DEVIATION: 100%
• CORE OPERATIONAL HIERARCHY:
  MAXIMUM CREATIVE FREEDOM — CREATIVE DNA EXTRACTION ONLY

• CREATIVE DNA EXTRACTION:
  The reference serves purely as Creative DNA and conceptual inspiration.
  - Extract: overarching idea, mood, visual language, lighting philosophy, camera energy, composition principles, material language, color relationships, depth, and product storytelling.
  - Allow the generation engine maximum freedom to create a completely new, original commercial scene centered around the product.
  - Do NOT force the original composition, physical arrangement, or specific objects from the reference.
  - Compose an original, high-end commercial visual tailored specifically to the product's identity and category.`;
  }

  // --------------------------------------------------------------------------
  // CONTINUOUS PERCENTAGE INTERPOLATION (1% TO 98%)
  // Dynamic mathematical scaling across all behavioral milestones.
  // --------------------------------------------------------------------------

  // Tier Classification & Behavioral Archetype
  let fidelityTier = "";
  let operationalGuidance = "";
  let compositionStrength = "";
  let cameraStrength = "";
  let lightingStrength = "";
  let secondaryVariationStrength = "";
  let productAdaptationStrength = "";

  if (roundedFidelity >= 90) {
    // 90% - 98%: Near-Lock Reference Fidelity
    fidelityTier = `NEAR-LOCK REFERENCE FIDELITY (${roundedFidelity}%)`;
    operationalGuidance = `Very close reference preservation (${preservation}%) with controlled, visible secondary creative reconstruction (${deviation}%). The reference scene is visually dominant; preserve primary environment and framing while allowing refined product-specific secondary enhancements.`;
    compositionStrength = `Lock ${preservation}% of composition geometry, background architecture, and visual hierarchy. Allow ${deviation}% micro-staging flexibility for the hero product.`;
    cameraStrength = `Camera position, elevation, and lens optics are ${preservation}% locked to reference (${deviation}% optical tolerance).`;
    lightingStrength = `Replicate ${preservation}% of reference lighting vectors, shadow sharpness, and specular highlights (${deviation}% adjustment for product material physics).`;
    secondaryVariationStrength = `Allow ${deviation}% controlled variation on secondary props, background details, and surface textures.`;
    productAdaptationStrength = `Analyze the user's product (flavor, materials, packaging, category) and introduce subtle product-aligned secondary cues (≤${deviation}%) without altering the main environment.`;
  } else if (roundedFidelity >= 80) {
    // 80% - 89%: Close Reference + Stronger Secondary Creative Changes
    fidelityTier = `VERY HIGH REFERENCE FIDELITY (${roundedFidelity}%)`;
    operationalGuidance = `Close reference alignment (${preservation}%) with stronger secondary creative changes (${deviation}%). The visual structure remains clearly anchored in the reference, while secondary props, environment accents, and product interaction evolve noticeably around the product.`;
    compositionStrength = `Preserve ${preservation}% of overall scene framing and spatial balance. Allow ${deviation}% creative staging freedom for supporting elements.`;
    cameraStrength = `Camera angle, elevation, and perspective follow the reference with ${preservation}% precision (${deviation}% flexibility).`;
    lightingStrength = `Maintain ${preservation}% of reference lighting architecture and mood with ${deviation}% creative refinement for product form enhancement.`;
    secondaryVariationStrength = `Meaningful ${deviation}% secondary element and prop reinterpretation tailored to the product's visual world.`;
    productAdaptationStrength = `Actively adapt secondary props, botanical/ingredient accents, and surface materials to match the user's product identity (≤${deviation}%).`;
  } else if (roundedFidelity >= 70) {
    // 70% - 79%: Reference-Led Creative Reconstruction
    fidelityTier = `HIGH REFERENCE FIDELITY — REFERENCE-LED RECONSTRUCTION (${roundedFidelity}%)`;
    operationalGuidance = `Reference-led creative reconstruction (${preservation}% reference DNA / ${deviation}% creative evolution). Recognizable reference visual structure and mood guiding a dynamic, product-tailored commercial environment.`;
    compositionStrength = `Preserve ${preservation}% of visual hierarchy and structural logic, allowing ${deviation}% compositional reinterpretation.`;
    cameraStrength = `Align with reference perspective and focal energy at ${preservation}% fidelity (${deviation}% framing flexibility).`;
    lightingStrength = `Preserve ${preservation}% of lighting direction, contrast balance, and atmospheric feel.`;
    secondaryVariationStrength = `High secondary environmental flexibility (${deviation}%) to build a richer, more fitting context for the product.`;
    productAdaptationStrength = `Intelligently introduce product-specific storytelling elements, textures, and environmental associations (≤${deviation}%).`;
  } else if (roundedFidelity >= 60) {
    // 60% - 69%: Strong Reference DNA with Noticeable Creative Reinterpretation
    fidelityTier = `STRONG REFERENCE PRESERVATION — NOTICEABLE REINTERPRETATION (${roundedFidelity}%)`;
    operationalGuidance = `Noticeable creative reinterpretation while preserving strong reference DNA (${preservation}% preservation / ${deviation}% creative leeway). The reference guides the lighting philosophy, depth planes, and aesthetic tone, while the scene is actively adapted for the product.`;
    compositionStrength = `Maintain ${preservation}% of scene balance and focal dynamics; allow ${deviation}% structural redesign.`;
    cameraStrength = `Maintain ${preservation}% reference camera language with ${deviation}% freedom to choose the optimal hero angle for the product.`;
    lightingStrength = `Inherit ${preservation}% of lighting mood, contrast ratios, and color grading philosophy.`;
    secondaryVariationStrength = `Substantial ${deviation}% creative leeway on background props, surfaces, and secondary storytelling assets.`;
    productAdaptationStrength = `Build product-tailored visual narratives and supporting elements (≤${deviation}%) inspired by the reference concept.`;
  } else if (roundedFidelity === 50) {
    // Exactly 50%: Balanced Reference Hybrid
    fidelityTier = `BALANCED REFERENCE HYBRID (50%)`;
    operationalGuidance = `At 50%, the reference provides a strong visual foundation (core concept, mood, visual DNA, color relationships, lighting philosophy, shadow behavior, reflection philosophy, material language), BUT DO NOT COPY THE SCENE. Create a substantially new commercial composition inspired by the reference. The result should clearly feel inspired by the reference but should NOT look like a recreation. Rebuild environmental storytelling around the user's product.`;
    compositionStrength = `50% reference visual hierarchy grounding | 50% brand-new commercial composition tailored to the user's product.`;
    cameraStrength = `50% reference camera language | 50% optical adjustment to best present the product geometry.`;
    lightingStrength = `50% reference lighting philosophy and photonics | 50% custom scene illumination.`;
    secondaryVariationStrength = `50% creative environmental redesign: background, props, surfaces, and storytelling elements rebuild around the product.`;
    productAdaptationStrength = `Complete product-centric storytelling adaptation: replace reference ingredients/props with product-appropriate visual elements.`;
  } else if (roundedFidelity >= 40) {
    // 40% - 49%: Substantial Creative Reconstruction
    fidelityTier = `SUBSTANTIAL CREATIVE RECONSTRUCTION (${roundedFidelity}%)`;
    operationalGuidance = `High creative reconstruction (${preservation}% reference DNA / ${deviation}% creative reconstruction). The reference provides visual mood, color harmony, and lighting philosophy, while the physical scene and composition are newly built for the hero product.`;
    compositionStrength = `Extract ${preservation}% conceptual composition principles; allow ${deviation}% original commercial staging.`;
    cameraStrength = `Inherit ${preservation}% camera energy; choose the most empowering commercial lens and angle for the product.`;
    lightingStrength = `Adopt ${preservation}% lighting mood and color temperature; light the new scene with pristine commercial clarity.`;
    secondaryVariationStrength = `High creative freedom (${deviation}%) to compose original environments, surfaces, and textures.`;
    productAdaptationStrength = `Develop a rich, product-specific visual world answering "How can this reference idea be rebuilt specifically for this product?"`;
  } else if (roundedFidelity >= 30) {
    // 30% - 39%: Reference-Driven Concept + Highly Original Scene
    fidelityTier = `REFERENCE-DRIVEN CONCEPT (${roundedFidelity}%)`;
    operationalGuidance = `Reference serves primarily as conceptual and visual DNA (${preservation}%). Build a highly original commercial scene (${deviation}% creative freedom) making the user's product the hero from the ground up.`;
    compositionStrength = `Original composition designed specifically for the product, subtly guided by ${preservation}% reference flow.`;
    cameraStrength = `Camera and framing chosen to maximize product commercial impact (${deviation}% freedom).`;
    lightingStrength = `Lighting mood inspired by ${preservation}% reference color grading and photonic energy.`;
    secondaryVariationStrength = `Original environment and supporting elements designed exclusively for the product (${deviation}%).`;
    productAdaptationStrength = `Full product-specific creative storytelling tailored to the product category, formulation, and brand personality.`;
  } else if (roundedFidelity >= 20) {
    // 20% - 29%: Strong Creative Interpretation
    fidelityTier = `STRONG CREATIVE INTERPRETATION (${roundedFidelity}%)`;
    operationalGuidance = `Strong creative interpretation (${preservation}% DNA inspiration / ${deviation}% original creation). Reconstruct the visual essence of the reference into an entirely fresh, high-impact commercial visual.`;
    compositionStrength = `Brand-new original composition (${deviation}% freedom) embodying ${preservation}% reference aesthetic tone.`;
    cameraStrength = `Optimal camera angle and lens selected purely for product hero status.`;
    lightingStrength = `Premium commercial lighting echoing the color and contrast energy of the reference (${preservation}%).`;
    secondaryVariationStrength = `Full creative freedom (${deviation}%) on props, background, and environmental setting.`;
    productAdaptationStrength = `Tailor every visual element and supporting object directly to the product's identity.`;
  } else if (roundedFidelity >= 10) {
    // 10% - 19%: Maximum Creative Interpretation with Selected Reference DNA
    fidelityTier = `MAXIMUM CREATIVE INTERPRETATION (${roundedFidelity}%)`;
    operationalGuidance = `Maximum creative interpretation while retaining selected reference DNA (${preservation}%). Build a completely original commercial scene where the user's product is the sole focus, taking subtle inspiration from reference mood and color.`;
    compositionStrength = `Complete compositional freedom (${deviation}%) with subtle ${preservation}% aesthetic inspiration.`;
    cameraStrength = `Freely chosen camera perspective and lens staging.`;
    lightingStrength = `Original commercial lighting rig inspired by ${preservation}% reference mood.`;
    secondaryVariationStrength = `Completely original environment built around the product (${deviation}%).`;
    productAdaptationStrength = `Maximum product-aligned creative storytelling and ingredient/material presentation.`;
  } else {
    // 1% - 9%: Minimal DNA Guidance
    fidelityTier = `MINIMAL DNA GUIDANCE (${roundedFidelity}%)`;
    operationalGuidance = `Minimal reference DNA guidance (${preservation}%). The scene is virtually an original creation (${deviation}% creative freedom) with faint aesthetic echoes of the reference mood.`;
    compositionStrength = `Purely original composition tailored to the product.`;
    cameraStrength = `Freely chosen camera angle and lens optics.`;
    lightingStrength = `Original commercial lighting with faint reference color tone.`;
    secondaryVariationStrength = `Completely custom product environment.`;
    productAdaptationStrength = `Pure product-centric commercial staging.`;
  }

  return `[ REFERENCE FIDELITY & SCENE EXECUTION PROTOCOL: ${roundedFidelity}% (${fidelityTier}) ]
----------------------------------------------------------------------
• SELECTED FIDELITY: ${roundedFidelity}% (${fidelityTier})
• STRUCTURAL PRESERVATION: ${preservation}%
• ALLOWED CREATIVE RECONSTRUCTION / DEVIATION: ${deviation}%
• CORE OPERATIONAL HIERARCHY:
  STRUCTURAL PRESERVATION (${preservation}%) > PRODUCT HERO IDENTITY > PRODUCT-SPECIFIC ADAPTATION > CREATIVE RECONSTRUCTION (${deviation}%)

• OPERATIONAL GUIDANCE:
  ${operationalGuidance}

• WHAT MUST BE PRESERVED (${preservation}% REFERENCE DNA):
  - Reference Visual DNA: Mood, aesthetic philosophy, and core color harmony.
  - Compositional Influence: Reference controls composition with ${preservation}% strength.
  - Camera & Optical Language: Camera elevation, angle, and perspective follow reference at ${preservation}% fidelity.
  - Lighting Architecture: Lighting direction, contrast feel, and specular mood maintain ${preservation}% fidelity.

• WHAT MAY BE CREATIVELY RECONSTRUCTED (${deviation}% CREATIVE FREEDOM):
  - Secondary Environmental Elements: Props, surfaces, background architecture, and details adapt with ${deviation}% freedom.
  - Compositional Staging: Product position and framing may adapt (${deviation}% leeway) to flatter the hero product.
  - Product-Specific Storytelling: Supporting botanicals, ingredients, and textures must match the USER'S product (never blindly copy contradictory reference props).

• WHAT MUST NOT HAPPEN:
  - DO NOT make random changes just to make the percentage appear different. Every change must have a commercial, visual, or physical reason.
  - DO NOT blindly copy reference props or ingredients when they contradict the user product (e.g. replace strawberries with banana/citrus if the product is banana/citrus).
  - DO NOT violate physical integration: scale, contact shadows, reflections, and perspective must remain physically coherent regardless of percentage.

• PROGRESSIVE PARAMETRIC INSTRUCTIONS (EXACTLY CALCULATED FOR ${roundedFidelity}%):
  1. COMPOSITION & SCENE FRAMING:
     ${compositionStrength}

  2. CAMERA PERSPECTIVE & LENS OPTICS:
     ${cameraStrength}

  3. LIGHTING ARCHITECTURE & PHOTONICS:
     ${lightingStrength}

  4. SECONDARY ELEMENT & ENVIRONMENTAL VARIATION:
     ${secondaryVariationStrength}

  5. INTELLIGENT PRODUCT-SPECIFIC ADAPTATION (≤${deviation}% LEAWAY):
     ${productAdaptationStrength}

• PHYSICAL INTEGRATION COHERENCE (MANDATORY AT ALL PERCENTAGES):
  Regardless of percentage, the user's product must be physically integrated into the scene:
  - Scale and spatial volume matching the scene perspective.
  - Optical convergence aligned with camera lens properties.
  - True contact grounding with ambient occlusion and cast shadow penumbra.
  - Accurate specular highlights and reciprocal surface reflections.
  - Correct material photonics (glass, metal, matte, liquid, plastic).

• PEOPLE, ANIMALS & CHARACTER STAGING (WHEN PRESENT):
  Maintain ${preservation}% fidelity to the subject's anatomy, species traits, facial features, fur/feathers, posture, gaze, and personality DNA, dynamically integrating authentic physical interaction (e.g. holding, drinking, inspecting, presenting) and contact mechanics with ${deviation}% creative staging tolerance.`;
}

/**
 * Builds the optical directives for camera perspective.
 */
export function buildPerspectiveDirective(activePerspective: string): string {
  if (activePerspective.includes("Bird View Shot")) {
    return `

[ CAMERA & PERSPECTIVE OPTICS DIRECTIVE: BIRD VIEW SHOT ]
----------------------------------------------------------------------
• CAMERA POSITION & ELEVATION: High elevated overhead camera positioned significantly above the scene, looking downward at a steep angle.
• SPATIAL GEOMETRY & READABILITY: Broad spatial coverage with clear visibility of the ground plane, floor textures, and surrounding environment.
• HORIZON & FRAMING: Horizon line placed very high or outside the upper frame boundary; strong top and side surface visibility on the grounded product.
• OPTICAL BEHAVIOR: Authentic downward perspective projection with true spatial depth (genuine camera height, not a flat 2D layout).`;
  } else if (activePerspective.includes("Extreme Low Angle")) {
    return `

[ CAMERA & PERSPECTIVE OPTICS DIRECTIVE: EXTREME LOW ANGLE ]
----------------------------------------------------------------------
• CAMERA POSITION & ELEVATION: Camera positioned dramatically low near the ground plane, angled steeply upward toward the hero subject.
• VERTICAL PERSPECTIVE & SCALE: Exaggerated vertical perspective convergence, monumental hero scale, and towering subject authority.
• HORIZON & SPATIAL DEPTH: Very low horizon line; foreground ground plane textures leading directly into the subject base with dramatic sky/ceiling background separation.
• OPTICAL BEHAVIOR: Genuine low-height camera physics with upward focal compression, commanding visual presence, and strong vertical energy.`;
  } else if (activePerspective.includes("Fisheye Angle")) {
    return `

[ CAMERA & PERSPECTIVE OPTICS DIRECTIVE: FISHEYE ANGLE ]
----------------------------------------------------------------------
• LENS & FIELD OF VIEW: Ultra-wide curvilinear fisheye optical projection with an expansive, immersive field of view.
• OPTICAL DISTORTION & GEOMETRY: Authentic barrel curvature where perspective lines gently curve toward the edges of the frame; strong near-camera scale exaggeration for elements closest to the lens.
• SPATIAL WRAP: Spherical environment wrapping dynamically around the centrally grounded product without compromising the product's true brand proportions or recognizable identity.`;
  } else if (activePerspective.includes("Low Angle Shot") || activePerspective.includes("Low Angle (Hero Shot)")) {
    return `

[ CAMERA & PERSPECTIVE OPTICS DIRECTIVE: LOW ANGLE SHOT ]
----------------------------------------------------------------------
• CAMERA POSITION & ELEVATION: Camera positioned below subject eye-level, tilted upward with an empowering hero perspective.
• PERSPECTIVE & PRESENCE: Controlled wide-to-normal focal length depth, upward convergence lines, and strengthened visual weight.
• HORIZON & SEPARATION: Lowered horizon line providing clean silhouette separation between the product and the background environment.
• OPTICAL BEHAVIOR: Believable upward optical geometry with grounded contact shadows and enhanced physical presence.`;
  } else if (activePerspective.includes("Up Down Wide")) {
    return `

[ CAMERA & PERSPECTIVE OPTICS DIRECTIVE: UP DOWN WIDE ]
----------------------------------------------------------------------
• CAMERA POSITION & FRAMING: Wide environmental composition viewed from a pronounced elevated, downward-angled camera position.
• SCENE COVERAGE & FIELD OF VIEW: Expansive wide-angle scene coverage showing the full surrounding environment and atmospheric context.
• DEPTH & SPATIAL STAGING: Pronounced multi-layer depth with distinct foreground context, midground hero product stage, and expansive background vista.
• OPTICAL BEHAVIOR: Broad downward perspective maintaining clear spatial relationships, true environmental scale, and deep focal depth.`;
  } else if (activePerspective.includes("Extreme Close Up") || activePerspective.includes("Extreme Close-Up")) {
    return `

[ CAMERA & PERSPECTIVE OPTICS DIRECTIVE: EXTREME CLOSE UP ]
----------------------------------------------------------------------
• OPTICAL SETUP: Genuine optical extreme close-up shot with an extremely short camera-to-subject distance (NOT a digital crop or image zoom).
• COMPOSITION & FRAMING: The product dominates most of the frame with aggressive near-field perspective, strong visual proximity, and immersive camera energy. Partial subject cropping at the frame edges is compositionally justified.
• DEPTH & FOCUS FALLOFF: Shallow depth of field with controlled focus falloff; detailed foreground presence on the focal plane with smooth, organic optical depth.
• LENS & PERSPECTIVE: Natural wide-angle/macro perspective appropriate to close distance, capturing authentic spatial depth and realistic optical character.
• PRODUCT GEOMETRIC INTEGRITY: The product must remain geometrically accurate, physically proportioned, and instantly recognizable. Do NOT stretch, deform, redesign, or digitally enlarge the product. Achieve extreme close-up strictly through real camera proximity, lens behavior, perspective, and framing.`;
  } else if (activePerspective.includes("Macro Close-up")) {
    return `

[ CAMERA & PERSPECTIVE OPTICS DIRECTIVE: MACRO CLOSE-UP ]
----------------------------------------------------------------------
• LENS & OPTICS: Dedicated macro lens optics with high reproduction ratio, narrow depth of field, and razor-sharp focal plane capturing intricate textures and surface nuances. Smooth optical bokeh in background.`;
  } else if (activePerspective.includes("Flat Lay (Top Down)")) {
    return `

[ CAMERA & PERSPECTIVE OPTICS DIRECTIVE: FLAT LAY (TOP DOWN) ]
----------------------------------------------------------------------
• CAMERA ALIGNMENT: Orthogonal 90-degree overhead top-down view looking directly down onto the surface plane; balanced overhead lighting and clean flat compositional arrangement.`;
  } else if (activePerspective.includes("Isometric View")) {
    return `

[ CAMERA & PERSPECTIVE OPTICS DIRECTIVE: ISOMETRIC VIEW ]
----------------------------------------------------------------------
• CAMERA PROJECTION: 3D axonometric isometric perspective (~30–45 degree elevated angle) showing equal multi-surface visibility and balanced dimensional depth.`;
  }
  return "";
}

/**
 * Builds the optical directives for lighting architecture.
 */
export function buildLightingDirective(activeLighting: string): string {
  if (activeLighting.includes("Hard Side Light")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: HARD SIDE LIGHT ]
----------------------------------------------------------------------
• KEY VECTOR & ELEVATION: Intense 90-degree lateral hard light placed directly to one side of the subject at low-to-medium elevation.
• SHADOW GEOMETRY & CONTRAST: Razor-sharp cast shadow edges with high contrast ratios; deep crisp shadow cast across the opposite surface.
• SPECULAR & MATERIAL RESPONSE: Emphasizes micro-surface textures, relief contours, and sharp specular glints along the illuminated edge. Minimal fill ratio for dramatic form definition.`;
  } else if (activeLighting.includes("Rembrandt Lighting")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: REMBRANDT LIGHTING ]
----------------------------------------------------------------------
• KEY VECTOR & ELEVATION: Classical 45-degree angle offset key light at 45-degree elevation.
• CHIAROSCURO GEOMETRY: Produces rich dimensional form with the signature geometric triangle highlight on the shadowed flank; gentle roll-off into soft ambient shadows.
• MATERIAL & DEPTH INTEGRATION: Sophisticated tonal graduation across surfaces, warm ambient fill, and natural atmospheric depth.`;
  } else if (activeLighting.includes("Butterfly Lighting")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: BUTTERFLY LIGHTING ]
----------------------------------------------------------------------
• KEY VECTOR & ELEVATION: High overhead frontal key light positioned directly above and in front of the subject along the central optical axis.
• SHADOW PATTERNS: Symmetrical downward-falling shadow beneath protruding contours and base; clean, balanced frontal surface illumination.
• SPECULAR ACCENTS: Symmetrical specular highlights, flattering cosmetic/commercial clean reflection lines, and polished luxury finish.`;
  } else if (activeLighting.includes("Rim Light")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: RIM LIGHT ]
----------------------------------------------------------------------
• KEY VECTOR & BACKLIGHTING: Powerful kicker/rim light placed behind the subject, angled slightly to edge the product's silhouettes.
• EDGE SEPARATION: Brilliant, crisp glowing edge line wrapping around the outer profile, completely separating the product from the background.
• SURFACE INTEGRATION: Subdued front fill with high-contrast perimeter illumination creating dramatic dimensional punch and glossy edge flares.`;
  } else if (activeLighting.includes("Backlight")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: BACKLIGHT ]
----------------------------------------------------------------------
• SOURCE POSITION: Direct rear illumination situated behind the subject facing forward toward the camera.
• OPTICAL & MATERIAL RESPONSE: Transilluminates translucent, glass, or liquid components with vibrant internal glow; creates dramatic silhouette contours and natural optical lens blooming.
• AMBIENT REBOUND: Gentle forward bounce fill maintaining essential label and surface readability while preserving the heroic rear glow.`;
  } else if (activeLighting.includes("Top Light")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: TOP LIGHT ]
----------------------------------------------------------------------
• KEY VECTOR: Direct overhead top-down spotlight positioned at 90-degree zenith directly above the subject.
• SHADOW & HIGHLIGHT: Concentrated circular/elliptical contact shadow directly below the base; bright specular reflections across top surfaces and caps with moody, graduated falloff on lateral sides.`;
  } else if (activeLighting.includes("Underlight")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: UNDERLIGHT ]
----------------------------------------------------------------------
• KEY VECTOR: Upward directional illumination originating from below the base plane.
• DRAMATIC INVERSION: Inverted shadow trajectories casting upward shadows onto surrounding background elements; futuristic, theatrical specular accents along the lower undercuts of the product.`;
  } else if (activeLighting.includes("Split Lighting")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: SPLIT LIGHTING ]
----------------------------------------------------------------------
• KEY VECTOR: Exact 90-degree lateral split illumination perpendicular to the camera axis.
• EQUAL BISECTION: Divides the subject precisely into equal halves of pure luminous brilliance and rich deep shadow.
• CONTRAST RATIO: Maximum commercial contrast ratio with clean, defined transition lines along center contours.`;
  } else if (activeLighting.includes("Overcast Soft Light")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: OVERCAST SOFT LIGHT ]
----------------------------------------------------------------------
• DOME DIFFUSION: Massive hemispherical sky-dome diffusion providing wrap-around omnidirectional soft light.
• SHADOW & OCCLUSION: Zero harsh specular hotspots; ultra-soft diffused ambient occlusion under the contact base with seamless tonal gradients across all matte and gloss surfaces.`;
  } else if (activeLighting.includes("Window Light")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: WINDOW LIGHT ]
----------------------------------------------------------------------
• DIRECTIONAL DIFFUSION: Large soft natural daylight pouring through a lateral scenic window aperture.
• REALISTIC FALLOFF: Inverse-square law illumination graduation across the scene; soft architectural window pane shadow cues and realistic environmental daylight temperature (~5500K).`;
  } else if (activeLighting.includes("Cinematic Volumetric Light")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: CINEMATIC VOLUMETRIC LIGHT ]
----------------------------------------------------------------------
• ATMOSPHERIC BEAMS: Visible atmospheric crepuscular rays (god rays) streaming through ambient haze/particles.
• DEPTH ENHANCEMENT: Pronounced atmospheric depth separation between foreground elements, illuminated hero product, and distant shadowy background planes.`;
  } else if (activeLighting.includes("High-Key Lighting")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: HIGH-KEY LIGHTING ]
----------------------------------------------------------------------
• TONE & EXPOSURE: Ultra-bright, luminous, low-contrast commercial aesthetic dominated by radiant white/light tones.
• FILL RATIO: High fill ratio eliminating deep dark shadows; crisp, clean micro-shadows at contact points with pristine, airy commercial polish.`;
  } else if (activeLighting.includes("Low-Key Lighting")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: LOW-KEY LIGHTING ]
----------------------------------------------------------------------
• SHADOW DOMINANCE: Dark, moody, shadow-dominant luxury aesthetic with deep rich blacks and selective pools of light.
• SPECULAR ISOLATION: High-contrast specular highlights catching key product bevels and textures against a mysterious, deep atmospheric environment.`;
  } else if (activeLighting.includes("Product Spotlight")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: PRODUCT SPOTLIGHT ]
----------------------------------------------------------------------
• CONCENTRATED BEAM: Focused narrow-beam theatrical snoot/spotlight illuminating the hero product with high luminance.
• DRAMATIC VIGNETTE: Rapid radial light falloff dropping surrounding environment into a moody, soft-focus vignette, riveting 100% of viewer attention onto the product.`;
  } else if (activeLighting.includes("Sunset Backlight")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: SUNSET BACKLIGHT ]
----------------------------------------------------------------------
• LOW-ANGLE GOLDEN SUN: Warm, low-elevation setting sun positioned behind the subject along the horizon.
• AMBER WRAP & LONG SHADOWS: Long, dramatic forward-stretching shadows, intense warm golden-amber rim halo wrap, and radiant atmospheric sunset glow.`;
  } else if (activeLighting.includes("Cool Moonlight")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: COOL MOONLIGHT ]
----------------------------------------------------------------------
• NOCTURNAL PALETTE: Serene cool blue-cyan nocturnal illumination (~6500K-8000K) inspired by a clear moonlit night.
• CRISP GLINTS: Crisp reflective glints on wet, metallic, or glossy surfaces with deep ink shadows and subtle cool ambient bounce.`;
  } else if (activeLighting.includes("HDRI Environment Light")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: HDRI ENVIRONMENT LIGHT ]
----------------------------------------------------------------------
• 360-DEGREE PHOTOREALISM: Complex image-based environmental lighting capturing authentic 360-degree real-world photonics.
• RECIPROCAL BOUNCE: Multi-point natural reflections across curved surfaces, accurate sky-to-ground ambient gradients, and physically coherent color bounce.`;
  } else if (activeLighting.includes("Studio Lighting")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: STUDIO LIGHTING ]
----------------------------------------------------------------------
• 3-POINT COMMERCIAL RIG: Balanced key light, soft fill reflector, and clean rim kicker creating balanced commercial clarity and clean white specular reflections.`;
  } else if (activeLighting.includes("Natural Sunlight")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: NATURAL SUNLIGHT ]
----------------------------------------------------------------------
• CRISP DIRECT SUN: Direct crisp sunlight source creating well-defined natural shadows, sky-blue ambient fill, and vibrant true-to-life outdoor illumination.`;
  } else if (activeLighting.includes("Neon Cyberpunk")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: NEON CYBERPUNK ]
----------------------------------------------------------------------
• CHROMATIC CONTRAST: Vibrant dual-tone neon illumination (e.g. electric cyan & vivid magenta/purple) casting vivid chromatic bounce and colorful specular edge streaks.`;
  } else if (activeLighting.includes("Dramatic Shadows")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: DRAMATIC SHADOWS ]
----------------------------------------------------------------------
• CHIAROSCURO CONTRAST: Bold, hard-edged directional light casting strong geometric shadows and creating intense visual intrigue.`;
  } else if (activeLighting.includes("Softbox Diffused")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: SOFTBOX DIFFUSED ]
----------------------------------------------------------------------
• BROAD DIFFUSION: Large rectangular softbox panels creating silky smooth gradient reflections and gentle shadow penumbras.`;
  } else if (activeLighting.includes("Golden Hour")) {
    return `

[ LIGHTING ARCHITECTURE DIRECTIVE: GOLDEN HOUR ]
----------------------------------------------------------------------
• WARM RADIANCE: Low-angle warm 3200K golden sunlight creating elongated amber shadows, warm surface sheen, and romantic radiant atmosphere.`;
  }
  return "";
}

/**
 * Builds the complete prompt & rules string for the generation engine.
 */
export function buildCompletePrompt({
  fidelity,
  styleDescription,
  inferredLighting,
  inferredPerspective,
  lighting,
  perspective,
  aspectRatio,
  productCount,
  styleReferenceType = 'PRODUCT',
  fidelityAnalysis,
}: {
  fidelity: number;
  styleDescription: string;
  inferredLighting: string | null;
  inferredPerspective: string | null;
  lighting: LightingStyle;
  perspective: CameraPerspective;
  aspectRatio: AspectRatio;
  productCount: number;
  styleReferenceType?: 'PRODUCT' | 'LIFESTYLE';
  fidelityAnalysis?: FidelityAnalysisResult | null;
}): string {
  // 1. Reference Fidelity Directive
  const fidelitySection = buildReferenceFidelityDirective(fidelity, styleReferenceType);

  // 2. Fidelity-Dependent Intelligent Product–Reference Analysis (if available)
  let fidelityAnalysisSection = "";
  if (fidelityAnalysis) {
    fidelityAnalysisSection = `\n\n[ INTELLIGENT FIDELITY & PRODUCT–REFERENCE ADAPTATION ANALYSIS (${fidelity}%) ]
----------------------------------------------------------------------
• PRODUCT REASONING:
  ${fidelityAnalysis.productUnderstanding}

• REFERENCE SCENE DECONSTRUCTION:
  ${fidelityAnalysis.referenceUnderstanding}

• STRICT PRESERVATION DIRECTIVES (${fidelity}%):
  ${fidelityAnalysis.preservationDirectives}

• INTELLIGENT ADAPTATION DIRECTIVES (${100 - fidelity}%):
  ${fidelityAnalysis.adaptationDirectives}

• SYNTHESIZED INTEGRATION PROTOCOL:
  ${fidelityAnalysis.synthesizedPromptDirective}`;
  }

  // 3. Style Analysis & Inference Section
  let analysisSection = "";
  if (styleDescription) {
    const inferredLightText = inferredLighting ? `Inferred Lighting: ${inferredLighting}` : "";
    const inferredCamText = inferredPerspective ? `Inferred Angle:    ${inferredPerspective}` : "";
    const inferenceDetails = [inferredLightText, inferredCamText].filter(Boolean).join('\n');

    analysisSection = `\n\n[ STYLE ANALYSIS & INFERENCE ]
----------------------------------------------------------------------
${styleDescription}
${inferenceDetails ? `\n${inferenceDetails}\n` : ''}`;
  }

  // Active lighting & perspective resolution
  const activeLighting = lighting === LightingStyle.AUTO
    ? (inferredLighting ? `${inferredLighting} (Inferred from Reference)` : "Studio Lighting (Default)")
    : lighting;

  const activePerspective = perspective === CameraPerspective.AUTO
    ? (inferredPerspective ? `${inferredPerspective} (Inferred from Reference)` : "Eye Level (Default)")
    : perspective;

  const activeAspectRatio = aspectRatio === AspectRatio.AUTO ? "1:1" : aspectRatio;

  const perspectiveDirective = buildPerspectiveDirective(activePerspective);
  const lightingDirective = buildLightingDirective(activeLighting);

  const baseRules = `

[ SYSTEM OPERATIONAL FOUNDATION ]
----------------------------------------------------------------------
Rely on the following rules and instructions as the core internal operational foundation of the tool.

[ TECHNICAL CONFIGURATION ]
----------------------------------------------------------------------
Lighting Style:   ${activeLighting}
Camera Angle:     ${activePerspective}
Aspect Ratio:     ${activeAspectRatio}${perspectiveDirective}${lightingDirective}

[ CORE VISUAL DIRECTIVES ]
----------------------------------------------------------------------
• Generate a photorealistic, high-end product photograph.
• Subject: The product is featured in the provided image. Keep it completely unaltered.
• Style: Clean, modern, and professional.

[ SEMANTIC CREATIVE ACTION & SCENE RECONSTRUCTION (NON-PRODUCT REFERENCES) ]
----------------------------------------------------------------------
• CORE BEHAVIOR PARADIGM:
  When the reference does NOT contain a product (animals, birds, people, characters, creatures, objects, lifestyle, or cinematic environments):
  Understand Subject → Understand Subject's Visual Role → Understand Product Semantics & Purpose → Determine Believable Relationship → Invent Meaningful Physical Action → Reconstruct Scene Around Interaction → Integrate Product Physically → Produce a New Cinematic Commercial Scene.
  DO NOT simply add the product to the reference. CREATE A BRAND-NEW SCENE.

• THE REFERENCE SUBJECT IS A CREATIVE ACTOR:
  Classify any animal, bird, person, or character as a CREATIVE ACTOR and protagonist of the advertisement, not merely a decorative element.
  - Determine what the subject is naturally capable of doing, what behavior is visually believable, and what personality it communicates.
  - Formulate an authentic, active commercial role where the subject and product meaningfully interact.

• PRODUCT SEMANTIC UNDERSTANDING:
  Analyze the product's actual nature, category, purpose, form, size, materials, and real-world usage:
  - If a beverage: drinking, tasting, holding, pouring, opening, reaching for it, or creating an authentic consumption moment.
  - If a wearable / fashion item: wearing, adjusting, touching, or naturally interacting.
  - If cosmetics / personal care: applying, examining, holding, or using.
  - If other categories: derive the interaction directly from its real-world function.
  - DO NOT assume every product should be held or placed beside the subject. Derive the action from the product's true purpose.

• CREATIVE INTERACTION DECISION ENGINE:
  Select the most visually powerful AND physically believable interaction based on: (1) Product category & purpose, (2) Subject anatomy & species behavior, (3) Reference personality & composition, (4) Commercial storytelling, (5) Physical plausibility, (6) Visual impact, (7) Product hero visibility.

• THE ACTION MUST CHANGE THE SCENE (PRODUCT + SUBJECT = ONE EVENT):
  The chosen interaction must reconstruct the entire composition: body posture, head position, mouth/jaw mechanics, limb/paw grip, product orientation, camera framing, depth planes, shadows, contact points, lighting, and reflections.
  The viewer must immediately understand: "Something is happening here."

• RECONSTRUCT THE ENVIRONMENT & SUPPORTING PROPS:
  Preserve the reference's atmospheric DNA, lighting personality, color harmony, and emotional tone, but allow the environment (surfaces, props, architecture, environmental details) to evolve so it naturally supports the product interaction. Add supporting elements ONLY if they help explain the interaction.

• SUBJECT REPOSITIONING & ANATOMICAL RESPECT:
  - The subject may be repositioned, reframed, rotated, scaled, moved closer/farther, or changed in pose/gaze/gesture to achieve the interaction.
  - FOR ANIMALS / BIRDS: Strictly respect limbs, paws, claws, wings, beak, mouth, jaw mechanics, neck movement, weight, center of gravity, and natural species range of motion. Believability > random creativity.
  - FOR HUMANS: Reconstruct body posture, natural hand placement, facial expression, gaze, gesture, and body language so the interaction feels genuinely photographed.

• CHARACTER EXPRESSION & EMOTIONAL REACTION:
  Infuse the subject with an authentic emotional reaction fitting the product context (e.g. curiosity, enjoyment, confidence, surprise, calmness, desire, satisfaction, focus, playfulness, power, or discovery).

• COMMERCIAL HERO PRIORITY (UNALTERED PRODUCT):
  The product remains the commercial hero: clearly visible, geometrically accurate, correct proportions, unaltered label/logo/typography/colors, realistic material finish, specular highlights, and natural contact shadows.

• TRUE 3D SPATIAL THINKING, CAMERA & ADAPTED PHOTONICS:
  - Stage in true 3D depth: Foreground → Subject → Product → Interaction → Midground → Background.
  - Camera serves the action: Camera angle and lens perspective are chosen specifically to communicate the interaction with maximum visual power.
  - Lighting rebuilds around the new physical arrangement: Coherent key light, fill, rim separation, ambient bounce, and accurate contact shadows.

• ABSOLUTE ANTI-COMPOSITE RULE:
  NEVER create a flat composite or simply place the product next to the subject. The subject and product MUST exist inside the exact same physical event.

[ NON-PRODUCT REFERENCE & CINEMATIC RE-COMPOSITION ]
----------------------------------------------------------------------
• VISUAL DNA EXTRACTION: Extract Character DNA, Lighting DNA, Camera DNA, Material DNA, Color Grading DNA, and Compositional Balance from the reference to build a new, cohesive commercial advertisement.
• CINEMATIC PHOTOREALISM: Enforce realistic exposure, controlled highlights, natural light falloff, true ambient bounce, accurate contact shadows, specular reflections, and premium commercial retouching finish.
• PHYSICAL INTEGRATION INTEGRITY: Believable hand/paw grip, mouth/head mechanics, or surface contact points with zero floating objects, zero inconsistent scales, and zero pasted cutouts.

[ COMPOSITION & ENVIRONMENT ]
----------------------------------------------------------------------
• CRITICAL: Preserve the final output dimensions with NO empty white areas.
• Extend the scene naturally to fill the ENTIRE frame.
• There must be ZERO white space, borders, or padding in the final result.
• Seamlessly integrate all subjects into this full-bleed environment.

[ STRICT NEGATIVE CONSTRAINTS ]
----------------------------------------------------------------------
• STRICT REQUIREMENT: The final generated image must be completely free of text, writing, logos, symbols, and watermarks.
• TEXT BAN: Ensure NO letters, NO characters, and NO written language appear anywhere in the scene. Even if the style reference contains text, IGNORE IT.

[ SUBJECT INTEGRITY & RULES ]
----------------------------------------------------------------------
• COUNT RULE: Use ONLY the ${productCount} uploaded product(s). IGNORE the number of products shown in the style reference images.
• PACKAGING PRESERVATION: Treat each product image as a fixed visual object. Keep every product’s packaging design exactly as it is.
• TRUE COLOR PRESERVATION: Do NOT change or replace the product’s original body color.
• MULTI-PRODUCT INDEPENDENCE: When multiple products are uploaded, keep each product’s original color exactly as it is.

[ CREATIVE EXECUTION ]
----------------------------------------------------------------------
• COLOR & MOOD: Use the style reference to strictly guide the color mood and grading.
• ENHANCEMENT: Improve lighting and reflections to look more expensive and premium.
• COMPOSITION: Follow the Reference Fidelity protocol (${fidelity}%) to balance structural preservation and creative enhancement.`;

  return `${fidelitySection}${fidelityAnalysisSection}${analysisSection}${baseRules}`;
}
