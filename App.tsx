import React, { useState, useEffect, useCallback } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { Controls } from './components/Controls';
import { AspectRatio, LightingStyle, CameraPerspective, HistoryItem, UploadedImage } from './types';
import { 
  analyzeStyleReference, 
  generateEditedImage, 
  fileToBase64, 
  analyzeSceneStructure,
  analyzeFidelityRelationship,
  FidelityAnalysisResult
} from './services/geminiService';
import { buildCompletePrompt } from './services/promptBuilder';
import { Maximize2, Minimize2 } from 'lucide-react';

const App: React.FC = () => {
  // Mode State: ON = Auto/Creative, OFF = Manual/Scene Preservation
  const [mode, setMode] = useState<'ON' | 'OFF'>('ON');

  // Reference Fidelity States: Selected (Slider UI) vs Applied (Confirmed by Apply button)
  const [selectedFidelity, setSelectedFidelity] = useState<number>(100);
  const [appliedFidelity, setAppliedFidelity] = useState<number>(100);

  // Internal Analysis Session / Version Counter (ensures stale asynchronous results are discarded)
  const analysisSessionRef = React.useRef<number>(1);
  const [, setAnalysisSessionVersion] = useState<number>(1);

  // State for Inputs (Arrays)
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [styleImages, setStyleImages] = useState<UploadedImage[]>([]);
  
  const [styleDescription, setStyleDescription] = useState<string>("");
  const [styleReferenceType, setStyleReferenceType] = useState<'PRODUCT' | 'LIFESTYLE'>('PRODUCT');
  const [isAnalyzingStyle, setIsAnalyzingStyle] = useState<boolean>(false);

  // Fidelity-Dependent Re-Analysis State
  const [fidelityAnalysis, setFidelityAnalysis] = useState<FidelityAnalysisResult | null>(null);
  const [isAnalyzingFidelity, setIsAnalyzingFidelity] = useState<boolean>(false);

  // State for Controls - Defaulting to AUTO
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.AUTO);
  const [lighting, setLighting] = useState<LightingStyle>(LightingStyle.AUTO);
  const [perspective, setPerspective] = useState<CameraPerspective>(CameraPerspective.AUTO);

  // State for Custom Inferred Values (when Auto is selected but analysis finds a custom value)
  const [inferredLighting, setInferredLighting] = useState<string | null>(null);
  const [inferredPerspective, setInferredPerspective] = useState<string | null>(null);

  // State for Prompt
  const [prompt, setPrompt] = useState<string>("");
  
  // State for Generation
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State for Lightbox
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  // State for History
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // State for Download Menu
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState<boolean>(false);

  // State for Prompt Box Expansion
  const [isPromptExpanded, setIsPromptExpanded] = useState<boolean>(false);

  // Typewriter State
  const [typewriterText, setTypewriterText] = useState('');
  const [sloganIndex, setSloganIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Ambient Canvas Cursor Tracking Effect & Cinematic Twinkling Star Field
  useEffect(() => {
    const canvas = document.getElementById("ambientCanvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: width / 2, y: height / 2 };
    let target = { x: width / 2, y: height / 2 };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    // Fixed glow outer radius (constant size at all times)
    const FIXED_GLOW_RADIUS = 350;

    // Cinematic star field across entire viewport (4-7s gentle continuous twinkle cycles)
    const starCount = 120;
    const stars: Array<{
      normX: number;
      normY: number;
      radius: number;
      cycleDuration: number;
      phase: number;
      minOpacity: number;
      maxOpacity: number;
    }> = [];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        normX: Math.random(),
        normY: Math.random(),
        radius: Math.random() * 0.9 + 0.65, // 0.65px - 1.55px crisp pinpoint stars
        cycleDuration: Math.random() * 3.0 + 4.0, // 4.0s - 7.0s cycle
        phase: Math.random() * Math.PI * 2,
        minOpacity: Math.random() * 0.12 + 0.08, // 0.08 - 0.20
        maxOpacity: Math.random() * 0.35 + 0.55 // 0.55 - 0.90
      });
    }

    function renderAmbient() {
      // Responsive smooth cursor tracking
      mouse.x += (target.x - mouse.x) * 0.2;
      mouse.y += (target.y - mouse.y) * 0.2;

      ctx!.clearRect(0, 0, width, height);

      // 1. Render Cinematic Shimmering Stars
      const now = performance.now() / 1000;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const x = star.normX * width;
        const y = star.normY * height;

        // Smooth sine easing for seamless natural shimmer
        const progress = (now / star.cycleDuration) * Math.PI * 2 + star.phase;
        const smoothSine = 0.5 + 0.5 * Math.sin(progress);
        const opacity = star.minOpacity + (star.maxOpacity - star.minOpacity) * smoothSine;

        ctx!.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx!.beginPath();
        ctx!.arc(x, y, star.radius, 0, Math.PI * 2);
        ctx!.fill();

        // Delicate ambient halo for bright peaks
        if (star.radius > 1.1 && opacity > 0.65) {
          ctx!.fillStyle = `rgba(255, 255, 255, ${(opacity - 0.65) * 0.3})`;
          ctx!.beginPath();
          ctx!.arc(x, y, star.radius * 2.2, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      // 2. Constant Fixed-Radius Mouse Glow (size never changes; velocity only modulates subtle opacity)
      const dist = Math.hypot(target.x - mouse.x, target.y - mouse.y);
      const speedFactor = Math.min(dist / 60, 1);
      const centerOpacity = 0.125 + 0.035 * speedFactor;
      const midOpacity = 0.035 + 0.015 * speedFactor;

      const glowGradient = ctx!.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        FIXED_GLOW_RADIUS
      );
      glowGradient.addColorStop(0, `rgba(255, 255, 255, ${centerOpacity})`);
      glowGradient.addColorStop(0.38, `rgba(255, 255, 255, ${midOpacity})`);
      glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx!.fillStyle = glowGradient;
      ctx!.beginPath();
      ctx!.arc(mouse.x, mouse.y, FIXED_GLOW_RADIUS, 0, Math.PI * 2);
      ctx!.fill();

      animId = requestAnimationFrame(renderAmbient);
    }
    renderAmbient();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  useEffect(() => {
    const slogans = [
      "Generate better than your reference",
      "Turn product shots into premium visuals",
      "AI that understands your product",
      "No prompt needed. Just results",
      "Professional output with smarter direction"
    ];
    const currentSlogan = slogans[sloganIndex];
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      timer = setTimeout(() => {
        setTypewriterText(currentSlogan.substring(0, typewriterText.length - 1));
        if (typewriterText.length <= 1) {
          setIsDeleting(false);
          setSloganIndex((prev) => (prev + 1) % slogans.length);
        }
      }, 50);
    } else {
      if (typewriterText === currentSlogan) {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      } else if (typewriterText === '') {
        timer = setTimeout(() => {
          setTypewriterText(currentSlogan.substring(0, 1));
        }, 500);
      } else {
        timer = setTimeout(() => {
          setTypewriterText(currentSlogan.substring(0, typewriterText.length + 1));
        }, 100);
      }
    }
    return () => clearTimeout(timer);
  }, [typewriterText, isDeleting, sloganIndex]);

  // Update prompt whenever controls, applied fidelity, or style description changes (ONLY IN ON MODE)
  useEffect(() => {
    if (mode === 'OFF') return;

    const fullPrompt = buildCompletePrompt({
      fidelity: appliedFidelity,
      styleDescription,
      inferredLighting,
      inferredPerspective,
      lighting,
      perspective,
      aspectRatio,
      productCount: productImages.length || 1,
      styleReferenceType,
      fidelityAnalysis,
    });

    setPrompt(fullPrompt);
  }, [
    appliedFidelity,
    fidelityAnalysis,
    lighting,
    perspective,
    aspectRatio,
    productImages.length,
    styleDescription,
    mode,
    inferredLighting,
    inferredPerspective,
    styleReferenceType
  ]);

  // Helper to extract clean base64s from UploadedImage array
  const getCleanBase64s = (images: UploadedImage[]) => {
    return images.map(img => img.base64.split(',')[1]);
  };

  // Slider Change: Updates ONLY the selected fidelity UI value.
  // STRICT RULE: Does NOT trigger analysis or change applied rules until user clicks "Apply".
  const handleSelectedFidelityChange = useCallback((newFidelity: number) => {
    const rounded = Math.min(100, Math.max(0, Math.round(newFidelity)));
    setSelectedFidelity(rounded);
  }, []);

  // Core Visual Intelligence & Reference Fidelity Analysis Engine
  const executeFidelityAnalysis = async (
    targetFidelity: number,
    sessionId: number,
    products: UploadedImage[] = productImages,
    styles: UploadedImage[] = styleImages
  ) => {
    if (products.length === 0 && styles.length === 0) {
      return;
    }

    try {
      setIsAnalyzingFidelity(true);
      setIsAnalyzingStyle(true);
      const productBase64s = products.length > 0 ? getCleanBase64s(products) : [];
      const styleBase64s = styles.length > 0 ? getCleanBase64s(styles) : [];
      const imagesToAnalyze = styleBase64s.length > 0 ? styleBase64s : productBase64s;

      // Run visual style inspection and deep continuous fidelity relationship analysis in parallel
      const [styleRes, fidelityRes] = await Promise.all([
        imagesToAnalyze.length > 0 ? analyzeStyleReference(imagesToAnalyze) : Promise.resolve(null),
        (productBase64s.length > 0 || styleBase64s.length > 0)
          ? analyzeFidelityRelationship(productBase64s, styleBase64s, targetFidelity)
          : Promise.resolve(null)
      ]);

      // Strict Race Condition Guard: Only the latest applied session may commit to state
      if (sessionId !== analysisSessionRef.current) {
        console.log(`[Session Guard] Discarded stale analysis from session ${sessionId} (active: ${analysisSessionRef.current})`);
        return;
      }

      let currentStyleDesc = styleDescription;
      let newInferredLighting = inferredLighting;
      let newInferredPerspective = inferredPerspective;
      let refType = styleReferenceType;

      if (styleRes) {
        refType = styleRes.referenceType || 'PRODUCT';
        setStyleReferenceType(refType);

        const styleText = styleRes.description || "High quality, professional photography with excellent lighting and composition.";
        const productText = products.length > 0 
          ? `${products.length} product shot(s) loaded as core subject.`
          : "No product images uploaded.";
        currentStyleDesc = `[ PRODUCT SUBJECT ANALYSIS ]\n${productText}\n\n[ STYLE REFERENCE ANALYSIS ]\n${styleText}`;
        setStyleDescription(currentStyleDesc);

        setAspectRatio((current) => current === AspectRatio.AUTO ? (styleRes.recommendedAspectRatio as AspectRatio) : current);
        
        if (lighting === LightingStyle.AUTO) {
          const lightingValues = Object.values(LightingStyle) as string[];
          if (lightingValues.includes(styleRes.recommendedLighting)) {
            setLighting(styleRes.recommendedLighting as LightingStyle);
            newInferredLighting = null;
            setInferredLighting(null);
          } else {
            newInferredLighting = styleRes.recommendedLighting;
            setInferredLighting(styleRes.recommendedLighting);
          }
        }
        
        if (perspective === CameraPerspective.AUTO) {
          const perspectiveValues = Object.values(CameraPerspective) as string[];
          if (perspectiveValues.includes(styleRes.recommendedPerspective)) {
            setPerspective(styleRes.recommendedPerspective as CameraPerspective);
            newInferredPerspective = null;
            setInferredPerspective(null);
          } else {
            newInferredPerspective = styleRes.recommendedPerspective;
            setInferredPerspective(styleRes.recommendedPerspective);
          }
        }
      }

      if (fidelityRes) {
        setFidelityAnalysis(fidelityRes);
      }

      // Authoritatively replace Generated Prompt & Rules with the newly generated instructions for that exact percentage
      if (mode === 'ON') {
        const freshPrompt = buildCompletePrompt({
          fidelity: targetFidelity,
          styleDescription: currentStyleDesc,
          inferredLighting: newInferredLighting,
          inferredPerspective: newInferredPerspective,
          lighting,
          perspective,
          aspectRatio,
          productCount: products.length || 1,
          styleReferenceType: refType,
          fidelityAnalysis: fidelityRes,
        });
        setPrompt(freshPrompt);
      }
    } catch (err: any) {
      if (sessionId === analysisSessionRef.current) {
        console.error("Fidelity analysis error:", err);
        setError(err?.message || "Failed to analyze reference fidelity.");
      }
    } finally {
      if (sessionId === analysisSessionRef.current) {
        setIsAnalyzingFidelity(false);
        setIsAnalyzingStyle(false);
      }
    }
  };

  // When Mode switches to OFF, clear the auto-generated prompt if user hasn't typed
  useEffect(() => {
    if (mode === 'OFF') {
      setPrompt("");
    }
  }, [mode]);

  // Re-Analyze button in prompt box: Refreshes analysis using current applied fidelity
  const handleReAnalyze = () => {
    if (mode === 'OFF' || isAnalyzingFidelity) return;
    const nextSessionId = ++analysisSessionRef.current;
    setAnalysisSessionVersion(nextSessionId);
    setGeneratedImage(null);
    setFidelityAnalysis(null);
    setError(null);
    executeFidelityAnalysis(appliedFidelity, nextSessionId, productImages, styleImages);
  };

  // APPLY FIDELITY:
  // User selects desired percentage (e.g. 80% -> 70% -> 95%) and presses "Apply".
  // Commits selectedFidelity as appliedFidelity, invalidates previous analysis, creates a new
  // authoritative session, and immediately runs a fresh analysis on current product + reference at the new percentage.
  // NO PAGE REFRESH REQUIRED. Product and Reference images remain intact.
  const handleApplyFidelity = () => {
    if (isAnalyzingFidelity) return;
    if (styleImages.length === 0 && productImages.length === 0) {
      setError("Please upload a reference image or product image before applying analysis.");
      return;
    }

    const nextSessionId = ++analysisSessionRef.current;
    setAnalysisSessionVersion(nextSessionId);

    const targetFidelity = selectedFidelity;
    setAppliedFidelity(targetFidelity);
    setGeneratedImage(null);
    setError(null);
    setFidelityAnalysis(null);

    // Immediately replace prompt with initial rules for targetFidelity while deep visual intelligence analyzes
    if (mode === 'ON') {
      const interimPrompt = buildCompletePrompt({
        fidelity: targetFidelity,
        styleDescription,
        inferredLighting,
        inferredPerspective,
        lighting,
        perspective,
        aspectRatio,
        productCount: productImages.length || 1,
        styleReferenceType,
        fidelityAnalysis: null,
      });
      setPrompt(interimPrompt);
    }

    executeFidelityAnalysis(targetFidelity, nextSessionId, productImages, styleImages);
  };

  // Handle Style Image Updates - Invalidates previous reference analysis without clearing product
  // RULE: REFERENCE UPLOAD does NOT start Reference Fidelity analysis.
  const handleStyleImagesAdded = (newImages: UploadedImage[]) => {
    const nextSessionId = ++analysisSessionRef.current;
    setAnalysisSessionVersion(nextSessionId);
    
    // Invalidate previous reference analysis & fidelity analysis
    setStyleDescription("");
    setInferredLighting(null);
    setInferredPerspective(null);
    setGeneratedImage(null);
    setFidelityAnalysis(null);
    setError(null);

    const updated = [...styleImages, ...newImages];
    setStyleImages(updated);
  };

  const handleStyleImageRemoved = (id: string) => {
    const nextSessionId = ++analysisSessionRef.current;
    setAnalysisSessionVersion(nextSessionId);
    
    // Invalidate previous reference analysis & fidelity analysis
    setStyleDescription("");
    setInferredLighting(null);
    setInferredPerspective(null);
    setGeneratedImage(null);
    setFidelityAnalysis(null);
    setError(null);

    const updated = styleImages.filter(img => img.id !== id);
    setStyleImages(updated);
  };

  // Handle Product Image Updates - Invalidates previous product analysis without clearing reference
  // RULE: PRODUCT UPLOAD does NOT start Reference Fidelity analysis.
  const handleProductImagesAdded = (newImages: UploadedImage[]) => {
    const nextSessionId = ++analysisSessionRef.current;
    setAnalysisSessionVersion(nextSessionId);

    setGeneratedImage(null);
    setFidelityAnalysis(null);
    setError(null);

    const updated = [...productImages, ...newImages];
    setProductImages(updated);
  };

  const handleProductImageRemoved = (id: string) => {
    const nextSessionId = ++analysisSessionRef.current;
    setAnalysisSessionVersion(nextSessionId);

    setGeneratedImage(null);
    setFidelityAnalysis(null);
    setError(null);

    const updated = productImages.filter(img => img.id !== id);
    setProductImages(updated);
  };

  const handleGenerate = async () => {
    if (productImages.length === 0) {
      setError("Please upload at least one product image.");
      return;
    }

    const currentSessionId = analysisSessionRef.current;

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    setIsDownloadMenuOpen(false);

    try {
      const productBase64s = getCleanBase64s(productImages);
      let referenceBase64s: string[] = [];
      let finalPrompt = prompt;

      if (mode === 'OFF') {
        // SCENE PRESERVATION MODE
        
        if (styleImages.length > 0) {
            // STEP 1: Deep Analysis Phase (Existing Logic)
            setGenerationStatus("Analyzing Reference Scene & Product Details...");
            referenceBase64s = getCleanBase64s(styleImages);
            const analysisResult = await analyzeSceneStructure(referenceBase64s, productBase64s);

            // Verify session validity before proceeding
            if (currentSessionId !== analysisSessionRef.current) {
              console.log("[Session Reset] Generation cancelled due to session invalidation during analysis");
              return;
            }

            // STEP 2: Construct Prompt based on User Input Presence
            let rawInstructions = prompt.trim();

            // Detect if the prompt box currently contains a system-generated prompt from a previous run
            // and extract the user's instructions if present.
            const systemMarkers = [
                "[ SCENE PRESERVATION: MANUAL DIRECTIVE EXECUTION ]",
                "[ SCENE PRESERVATION: MANUAL INSTRUCTION EXECUTION ]", 
                "[ SCENE PRESERVATION & PRODUCT REPLACEMENT PROTOCOL ]",
                "[ DEEP STRUCTURAL & PRODUCT ANALYSIS ]",
                "[ DEEP SCENE & PRODUCT ANALYSIS ]"
            ];
            
            const isSystemPrompt = systemMarkers.some(marker => rawInstructions.includes(marker));

            if (isSystemPrompt) {
                // Try to extract user part from potential previous system prompts
                if (rawInstructions.includes("[ USER INSTRUCTIONS (BINDING) ]")) {
                    const parts = rawInstructions.split("[ USER INSTRUCTIONS (BINDING) ]");
                    if (parts[1]) rawInstructions = parts[1].trim();
                } else if (rawInstructions.includes("[ USER INSTRUCTIONS ]")) {
                    const parts = rawInstructions.split("[ USER INSTRUCTIONS ]");
                     if (parts[1]) rawInstructions = parts[1].trim();
                } else if (rawInstructions.includes("[ ADDITIONAL USER CONTEXT ]")) {
                    const parts = rawInstructions.split("[ ADDITIONAL USER CONTEXT ]");
                     if (parts[1]) rawInstructions = parts[1].trim();
                } else {
                    // It's a system prompt (likely default protocol) with no identified user section
                    rawInstructions = "";
                }
            }

            if (rawInstructions) {
                // MANUAL MODE WITH INSTRUCTIONS
                const manualModePrompt = `[ SCENE PRESERVATION: MANUAL DIRECTIVE EXECUTION ]
----------------------------------------------------------------------
CRITICAL OPERATIONAL PRIORITY: The text provided in "USER INSTRUCTIONS" is a BINDING DIRECTIVE.
You MUST execute the blending and integration according to these specific instructions, rather than performing a default replacement.

[ DEEP STRUCTURAL & PRODUCT ANALYSIS ]
${analysisResult}

[ EXECUTION PROTOCOL ]
1. ANALYZE INSTRUCTIONS: Read the User Instructions carefully. They dictate HOW the product is integrated (position, state, interaction, specific blending style).
2. PRESERVE REALISM: While following the user's directive, strictly maintain the Reference Scene's original lighting, perspective, and environmental reality.
3. ORGANIC BLENDING: The product must feel like a natural part of the scene, NOT an overlay. Match lighting, contact shadows, reflections, and depth of field perfectly.

[ USER INSTRUCTIONS (BINDING) ]
${rawInstructions}`;
                finalPrompt = manualModePrompt;
            } else {
                // DEFAULT AUTOMATIC BEHAVIOR (Strict Replacement)
                const strictScenePreservationRules = `[ SCENE PRESERVATION & PRODUCT REPLACEMENT PROTOCOL ]
----------------------------------------------------------------------
CRITICAL OPERATIONAL INSTRUCTION:
1. PRECISE REPLACEMENT: Replace the existing product (or fill the intended spot) with the uploaded PRODUCT IMAGE.
2. ORGANIC INTEGRATION: The new product must physically interact with the scene. Generate realistic contact shadows, reflections on surfaces, and match the ambient light color.
3. PHYSICAL & STRUCTURAL INTEGRITY: Strictly preserve the original camera angle, tilt, visual balance, and physical state of the scene.
4. NO "CUT-AND-PASTE": The result must look like a single photograph taken in-camera.

STRICT NEGATIVE CONSTRAINTS:
• Do not alter the surrounding background or people (unless implied by product shape change).
• No floating objects. Ensure grounding.
• Preserve the structural logic of the reference scene completely.`;

                const analysisSection = `[ DEEP STRUCTURAL & PRODUCT ANALYSIS ]\n${analysisResult}\n`;
                finalPrompt = `${analysisSection}\n${strictScenePreservationRules}`;
            }

            // Update UI to show the analysis results in the prompt box
            setPrompt(finalPrompt);

            // STEP 3: Generation Phase
            setGenerationStatus("Generative Integration in Progress...");
        } else {
             // No reference images - proceed with manual prompt logic
             if (!prompt.trim()) {
                 setError("Please provide instructions for the scene.");
                 setIsGenerating(false);
                 return;
             }
             setGenerationStatus("Processing Generation...");
             
             // Wrap manual prompt for high professionalism in product-only mode
             finalPrompt = `[ PROFESSIONAL MANUAL GENERATION ]
----------------------------------------------------------------------
• TASK: Generate a high-end product photograph featuring the uploaded product(s) as the primary subject.
• EXECUTION: Follow the user's instructions below with maximum creative fidelity and photorealism.
• QUALITY: Ensure professional studio lighting, perfect composition, and high-resolution details.
• FOCUS: Treat the product as the primary subject.

[ USER INSTRUCTIONS ]
${prompt.trim()}`;
        }

      } else {
        // ON MODE (Creative / Reference Fidelity)
        if (styleImages.length > 0) {
          referenceBase64s = getCleanBase64s(styleImages);
        }
        
        // Ensure the active prompt strictly reflects the current fidelity and session state
        finalPrompt = buildCompletePrompt({
          fidelity: appliedFidelity,
          styleDescription,
          inferredLighting,
          inferredPerspective,
          lighting,
          perspective,
          aspectRatio,
          productCount: productImages.length || 1,
          styleReferenceType,
          fidelityAnalysis,
        });
        setPrompt(finalPrompt);
        setGenerationStatus("Generating Creative Image...");
      }

      // If Auto is still selected, use defaults for the API call
      const effectiveAspectRatio = aspectRatio === AspectRatio.AUTO ? "1:1" : aspectRatio;

      // Pass the complete prompt to the generation service
      const resultImageUrl = await generateEditedImage(
        productBase64s, 
        finalPrompt, 
        effectiveAspectRatio, 
        referenceBase64s
      );
      
      // Verify session validity before writing final generated image to state
      if (currentSessionId !== analysisSessionRef.current) {
        console.log("[Session Reset] Discarding generated result from superseded session");
        return;
      }

      setGeneratedImage(resultImageUrl);
      
      // Add to history
      setHistory(prev => [
        {
          id: Date.now().toString(),
          imageUrl: resultImageUrl,
          timestamp: Date.now()
        },
        ...prev
      ]);

    } catch (err: any) {
      if (currentSessionId === analysisSessionRef.current) {
        console.error("Image generation error:", err);
        setError(err?.message || "Failed to generate image. Please try again.");
      }
    } finally {
      if (currentSessionId === analysisSessionRef.current) {
        setIsGenerating(false);
        setGenerationStatus("");
      }
    }
  };

  // Handle Download Logic
  const handleDownload = (format: 'png' | 'jpg') => {
    if (!generatedImage) return;
    
    const filename = `freebird-edit-${Date.now()}.${format}`;

    if (format === 'png') {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = filename;
      link.click();
    } else {
      const img = new Image();
      img.src = generatedImage;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF'; // Fill white for JPG transparency
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/jpeg', 0.95);
          link.download = filename;
          link.click();
        }
      };
    }
    setIsDownloadMenuOpen(false);
  };

  // Prevent scrolling when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen]);

  // Determine button disabled state logic
  const isButtonDisabled = 
    productImages.length === 0 || 
    isGenerating || 
    isAnalyzingStyle ||
    isAnalyzingFidelity;

  return (
    <>
      {/* Ambient Cursor Tracking Background Canvas */}
      <canvas className="ambient-canvas" id="ambientCanvas" aria-hidden="true"></canvas>

      <div className="page">
        {/* Header */}
        <header className="header">
          <div className="container">
            <div className="header-inner">
              <a href="#" className="logo-wrap">
                <div className="logo-mark" aria-hidden="true">
                  <img 
                    id="headerLogo"
                    src="https://i.postimg.cc/gjjLZG7t/id-header-Logo-copy.png" 
                    alt="FreeBird Logo" 
                  />
                </div>
                <div className="logo-text">
                  <span className="logo-title">FreeBirdTool</span>
                  <span className="logo-sub">AI Product Visual Studio</span>
                </div>
              </a>
              <nav className="header-nav">
                <a href="#feature1" className="header-link">Feature 1</a>
                <a href="#feature2" className="header-link">Feature 2</a>
                <a href="#feature3" className="header-link">Feature 3</a>
                <a href="#feature4" className="header-link">Feature 4</a>
                <a href="#feature5" className="header-link">Feature 5</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="hero">
          <div className="container">
            <div className="hero-shell">
              <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                Smart Product Generation
              </div>
              <h1 className="hero-title">
                Create product visuals that feel <span className="outline">stronger than the reference</span>
              </h1>
              <div className="type-row">
                <div className="typewriter">
                  <span id="typewriterText">{typewriterText}</span>
                  <span className="cursor" id="typewriterCursor"></span>
                </div>
              </div>
              <p className="hero-desc">
                Upload your product, add a style reference if needed, or let Smart Creative handle the direction automatically.
                Generate cleaner, stronger, more professional results with a premium interface built around your current workflow.
              </p>
            </div>
          </div>
        </section>

      {/* Main Tool */}
      <section className="tool-section">
        <div className="container">
          <div className="tool-layout">
            
            {/* LEFT COLUMN: Controls & Inputs */}
            <div className="left-stack">
              
              {/* Step 1: Uploads */}
              <div className="panel">
                <div className="panel-inner">
                  <div className="section-head">
                    <div className="section-num">01</div>
                    <div className="section-title">Upload Assets</div>
                  </div>
                  
                  <div className="upload-stack">
                    <ImageUpload 
                      label="Product Images (Subjects)" 
                      images={productImages}
                      onImagesAdded={handleProductImagesAdded}
                      onImageRemoved={handleProductImageRemoved}
                      placeholderText="Upload product shots"
                      subText="Add the subject image you want the tool to understand and enhance."
                    />

                    <ImageUpload 
                      label={mode === 'ON' ? 'Style References (Optional)' : 'Scene Backgrounds (Optional)'}
                      images={styleImages}
                      onImagesAdded={handleStyleImagesAdded}
                      onImageRemoved={handleStyleImageRemoved}
                      placeholderText={mode === 'ON' ? "Upload vibes" : "Upload scenes"}
                      subText={mode === 'ON' ? "Optional style references for creative direction." : "Optional backgrounds or scene inspirations for composition guidance."}
                      isSmall={true}
                    />
                    
                    {isAnalyzingStyle && mode === 'ON' && (
                      <div className="text-xs text-white animate-pulse mt-2 text-center">
                        {productImages.length > 0 && styleImages.length > 0 
                          ? "Analyzing Product & Style References..." 
                          : "Analyzing & Inferring Settings..."
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls (Mode, Reference Fidelity & Settings) */}
              <Controls 
                aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
                lighting={lighting} setLighting={setLighting}
                perspective={perspective} setPerspective={setPerspective}
                mode={mode} setMode={setMode}
                referenceFidelity={selectedFidelity}
                setReferenceFidelity={handleSelectedFidelityChange}
                onApplyFidelity={handleApplyFidelity}
                isAnalyzingFidelity={isAnalyzingFidelity}
              />

              {/* Step 4/5: Prompt */}
              <div className="panel">
                <div className="panel-inner relative">
                  <div className="section-head flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="section-num">{mode === 'ON' ? '05' : '04'}</div>
                      <div className="section-title">{mode === 'ON' ? 'Generated Prompt & Rules' : 'Manual Prompt'}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                      title={isPromptExpanded ? "تصغير خانة البرومت (Collapse)" : "تكبير خانة البرومت (Expand)"}
                    >
                      {isPromptExpanded ? (
                        <>
                          <Minimize2 className="w-4 h-4 text-gray-300" />
                          <span className="hidden sm:inline text-xs text-gray-400">تصغير</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-4 h-4 text-gray-300" />
                          <span className="hidden sm:inline text-xs text-gray-400">تكبير</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className={`textarea transition-all duration-300 ${isPromptExpanded ? 'min-h-[420px]' : 'min-h-[150px]'}`}
                    placeholder={mode === 'ON' ? "Analysis and Rules will appear here..." : "Write your custom prompt here if you want manual control over the final result..."}
                  />
                  
                  {mode === 'ON' && (
                    <button
                      onClick={handleReAnalyze}
                      disabled={isAnalyzingStyle}
                      className="absolute top-16 right-6 p-2 bg-black/80 backdrop-blur-sm border border-gray-800 rounded-lg text-gray-500 hover:text-white hover:border-white transition-all shadow-lg group"
                      title="Re-analyze images and refresh prompt"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className={`w-4 h-4 ${isAnalyzingStyle ? 'animate-spin text-white' : 'group-hover:rotate-180 transition-transform duration-500'}`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Output */}
            <div className="preview-wrap">
              <div className="preview-card">
                <div className="preview-top">
                  <div className="preview-title">Result Preview</div>
                  <div className="preview-state">
                    <span className="dot"></span>
                    {isGenerating ? 'Processing...' : isAnalyzingStyle ? 'Analyzing...' : generatedImage ? 'Complete' : 'Ready'}
                  </div>
                </div>

                <div className="preview-area">
                  {generatedImage ? (
                    <div className="relative w-full h-full flex items-center justify-center rounded-xl overflow-hidden group/image">
                       <img 
                        src={generatedImage} 
                        alt="Generated Product" 
                        className="max-w-full max-h-full object-contain shadow-2xl cursor-zoom-in transition-transform duration-300 group-hover/image:scale-[1.01]"
                        onClick={() => setIsLightboxOpen(true)}
                      />
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover/image:opacity-100 transition-opacity bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white/80 pointer-events-none border border-white/20">
                        Click to enlarge
                      </div>
                    </div>
                  ) : (
                    <div className="preview-placeholder">
                      {isGenerating ? (
                        <div className="flex flex-col items-center gap-4 animate-pulse">
                          <div className="preview-icon">
                            <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                          <div className="preview-main">{generationStatus || 'Processing...'}</div>
                        </div>
                      ) : (
                        <>
                          <div className="preview-icon">
                            <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.6">
                              <path d="M4 18l5.2-5.2a1.5 1.5 0 012.12 0L14 15.5l1.8-1.8a1.5 1.5 0 012.12 0L20 16" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M8 8.75h.01" strokeLinecap="round"/>
                              <rect x="3.5" y="4" width="17" height="16" rx="2.5"/>
                            </svg>
                          </div>
                          <div className="preview-main">Result will appear here</div>
                          <div className="preview-sub">
                            Generate strong product visuals from your uploaded subject, optional references, and smart creative analysis.
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Download Actions */}
              {generatedImage && (
                <div className="flex flex-col sm:flex-row gap-2 relative z-20">
                  <div className="relative flex-1">
                    <button
                      onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
                      className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl border border-gray-700 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 9.75v10.5m0 0L7.5 15.75M12 20.25l4.5-4.5M12 3v9" />
                      </svg>
                      Download Options
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 transition-transform ${isDownloadMenuOpen ? 'rotate-180' : ''}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    
                    {isDownloadMenuOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-xl overflow-hidden flex flex-col z-30">
                        <button 
                          onClick={() => handleDownload('png')}
                          className="p-4 text-left text-sm hover:bg-[#1a1a1a] text-gray-200 hover:text-white transition-colors border-b border-[rgba(255,255,255,0.08)] flex justify-between items-center"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#222] flex items-center justify-center text-xs font-bold text-gray-400">PNG</div>
                            <span>Download PNG 2K</span>
                          </div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider">High Res</span>
                        </button>
                        <button 
                          onClick={() => handleDownload('jpg')}
                          className="p-4 text-left text-sm hover:bg-[#1a1a1a] text-gray-200 hover:text-white transition-colors flex justify-between items-center"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#222] flex items-center justify-center text-xs font-bold text-gray-400">JPG</div>
                            <span>Download JPG 2K</span>
                          </div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider">Optimized</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="generate-bar">
                <button
                  onClick={handleGenerate}
                  disabled={isButtonDisabled}
                  className="generate-btn"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {generationStatus || 'Processing...'}
                    </>
                  ) : isAnalyzingStyle ? (
                     <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing Style...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24">
                        <path d="M13 2L4.5 13.5H11L10 22L20.5 10.5H14L13 2Z"></path>
                      </svg>
                      Generate Image
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="p-4 bg-[rgba(255,0,0,0.1)] border border-[rgba(255,0,0,0.2)] text-white rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* History Section */}
              {history.length > 0 && (
                <div className="panel mt-6">
                  <div className="panel-inner">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Generations</h3>
                      <button 
                        onClick={() => setHistory([])}
                        className="text-xs text-gray-500 hover:text-white transition-colors"
                      >
                        Clear History
                      </button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                      {history.map(item => (
                        <button
                          key={item.id}
                          onClick={() => setGeneratedImage(item.imageUrl)}
                          className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all group ${
                            generatedImage === item.imageUrl 
                              ? 'border-white ring-2 ring-white/20' 
                              : 'border-transparent hover:border-[rgba(255,255,255,0.2)]'
                          }`}
                        >
                          <img 
                            src={item.imageUrl} 
                            alt="History item" 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bottom-space"></div>
        </div>
      </section>

      {/* Contact & Footer Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-stack">
            <a href="https://link.gettap.co/mohamedmando" target="_blank" rel="noopener noreferrer" className="contact-shell">
              <div className="contact-inner">
                <div className="contact-copy">
                  <span className="contact-kicker">Get in touch</span>
                  <span className="contact-title">Contact</span>
                  <span className="contact-sub">Tap to open the direct contact link.</span>
                </div>
                <div className="contact-pill">
                  <span className="dot"></span>
                  Open Contact Link
                </div>
              </div>
            </a>

            <div className="developer-credit">
              <div className="dev-logo-wrap">
                <img 
                  id="devLogo" 
                  src="https://i.postimg.cc/gcXVMDjV/id-dev-Logo.png" 
                  alt="Developer Logo"
                  className="dev-logo"
                />
              </div>
              <span className="dev-line">Developed by Mohamed Mansour</span>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Overlay */}
      {isLightboxOpen && generatedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close Button */}
          <button 
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors bg-[#111] rounded-full p-2 hover:bg-[#222] border border-[rgba(255,255,255,0.1)] z-50"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <img 
            src={generatedImage} 
            alt="Full Resolution Result" 
            className="max-w-full max-h-full object-contain shadow-2xl rounded-sm border border-[rgba(255,255,255,0.1)]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  </>
  );
};

export default App;