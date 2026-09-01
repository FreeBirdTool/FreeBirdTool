import React from 'react';

interface ReferenceFidelityProps {
  fidelity: number;
  setFidelity: (val: number) => void;
  onApply: () => void;
  isAnalyzing: boolean;
  sectionNumber?: string;
}

export const ReferenceFidelity: React.FC<ReferenceFidelityProps> = ({
  fidelity,
  setFidelity,
  onApply,
  isAnalyzing,
  sectionNumber = "03"
}) => {
  return (
    <div className="panel" id="referenceFidelityPanel">
      <div className="panel-inner">
        <div className="section-head flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="section-num">{sectionNumber}</span>
            <h3 className="section-title">Reference Fidelity</h3>
          </div>
          <div 
            id="fidelityValueDisplay"
            className="text-xs font-bold text-white px-2.5 py-1 rounded-full bg-white/10 border border-white/15 tracking-tight select-none"
          >
            {fidelity}%
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="relative py-1">
              <input
                id="referenceFidelitySlider"
                type="range"
                min="0"
                max="100"
                step="1"
                value={fidelity}
                onChange={(e) => setFidelity(Number(e.target.value))}
                className="fidelity-slider"
                style={{
                  background: `linear-gradient(to right, #ffffff 0%, #ffffff ${fidelity}%, rgba(255, 255, 255, 0.12) ${fidelity}%, rgba(255, 255, 255, 0.12) 100%)`
                }}
                aria-label="Reference Fidelity Percentage"
              />
            </div>
            
            {/* Minimal three anchor points: 0% / 50% / 100% */}
            <div className="flex justify-between items-center text-xs text-white/50 px-1 font-medium select-none">
              <button
                id="fidelityAnchor0"
                type="button"
                onClick={() => setFidelity(0)}
                className={`hover:text-white transition-colors cursor-pointer py-0.5 ${fidelity === 0 ? 'text-white font-bold' : ''}`}
              >
                0%
              </button>
              <button
                id="fidelityAnchor50"
                type="button"
                onClick={() => setFidelity(50)}
                className={`hover:text-white transition-colors cursor-pointer py-0.5 ${fidelity === 50 ? 'text-white font-bold' : ''}`}
              >
                50%
              </button>
              <button
                id="fidelityAnchor100"
                type="button"
                onClick={() => setFidelity(100)}
                className={`hover:text-white transition-colors cursor-pointer py-0.5 ${fidelity === 100 ? 'text-white font-bold' : ''}`}
              >
                100%
              </button>
            </div>
          </div>

          {/* Simple Apply Button */}
          <button
            id="applyFidelityButton"
            type="button"
            onClick={onApply}
            disabled={isAnalyzing}
            className="fidelity-apply-btn"
          >
            {isAnalyzing ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              "Apply"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
