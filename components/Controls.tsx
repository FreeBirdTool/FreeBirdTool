import React from 'react';
import { AspectRatio, LightingStyle, CameraPerspective } from '../types';
import { ReferenceFidelity } from './ReferenceFidelity';

interface ControlsProps {
  aspectRatio: AspectRatio;
  setAspectRatio: (val: AspectRatio) => void;
  lighting: LightingStyle;
  setLighting: (val: LightingStyle) => void;
  perspective: CameraPerspective;
  setPerspective: (val: CameraPerspective) => void;
  mode: 'ON' | 'OFF';
  setMode: (mode: 'ON' | 'OFF') => void;
  referenceFidelity?: number;
  setReferenceFidelity?: (val: number) => void;
  onApplyFidelity?: () => void;
  isAnalyzingFidelity?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  aspectRatio,
  setAspectRatio,
  lighting,
  setLighting,
  perspective,
  setPerspective,
  mode,
  setMode,
  referenceFidelity = 100,
  setReferenceFidelity,
  onApplyFidelity,
  isAnalyzingFidelity = false
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Panel 02: Mode */}
      <div className="panel" id="modePanel">
        <div className="panel-inner">
          <div className="section-head">
            <span className="section-num">02</span>
            <h3 className="section-title">Mode</h3>
          </div>
          
          <div className="mode-switch">
            <button 
              id="modeSmartCreativeBtn"
              className={`mode-btn ${mode === 'ON' ? 'active' : ''}`}
              onClick={() => setMode('ON')}
            >
              <div className="mode-title">Smart Creative</div>
              <div className="mode-desc">AI enhances and reimagines the scene</div>
            </button>
            <button 
              id="modeScenePreserveBtn"
              className={`mode-btn ${mode === 'OFF' ? 'active' : ''}`}
              onClick={() => setMode('OFF')}
            >
              <div className="mode-title">Scene Preserve</div>
              <div className="mode-desc">Strictly maintains original composition</div>
            </button>
          </div>
        </div>
      </div>

      {/* Panel 03: Reference Fidelity (Only in Smart Creative / Mode ON) */}
      {setReferenceFidelity && onApplyFidelity && (
        <ReferenceFidelity 
          fidelity={referenceFidelity}
          setFidelity={setReferenceFidelity}
          onApply={onApplyFidelity}
          isAnalyzing={isAnalyzingFidelity}
          sectionNumber="03"
        />
      )}

      {/* Panel 04: Settings */}
      <div className="panel" id="settingsPanel">
        <div className="panel-inner">
          <div className="section-head">
            <span className="section-num">04</span>
            <h3 className="section-title">Settings</h3>
          </div>
          
          <div className="controls-grid">
            <div className="control-group">
              <label className="control-label">Aspect Ratio</label>
              <div className="select-wrap">
                <select 
                  id="aspectRatioSelect"
                  className="custom-select"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                >
                  {Object.values(AspectRatio).map((ratio) => (
                    <option key={ratio} value={ratio}>{ratio}</option>
                  ))}
                </select>
                <div className="select-arrow">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">Lighting</label>
              <div className="select-wrap">
                <select 
                  id="lightingSelect"
                  className="custom-select"
                  value={lighting}
                  onChange={(e) => setLighting(e.target.value as LightingStyle)}
                >
                  {Object.values(LightingStyle).map((style) => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
                <div className="select-arrow">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">Perspective</label>
              <div className="select-wrap">
                <select 
                  id="perspectiveSelect"
                  className="custom-select"
                  value={perspective}
                  onChange={(e) => setPerspective(e.target.value as CameraPerspective)}
                >
                  {Object.values(CameraPerspective).map((cam) => (
                    <option key={cam} value={cam}>{cam}</option>
                  ))}
                </select>
                <div className="select-arrow">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
