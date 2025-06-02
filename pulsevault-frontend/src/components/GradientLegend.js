import React from "react";
import "./GradientLegend.css";

function GradientLegend({ currentBPM }) {
  const getLevel = (bpm) => {
    if (bpm < 60) return "Low";
    if (bpm <= 100) return "Average";
    return "High";
  };

  // Clamp and scale BPM to % between 50-150 bpm range
  const indicatorPosition = Math.min(Math.max((currentBPM - 50) / 100 * 100, 0), 100);

  const level = getLevel(currentBPM || 0);

  return (
    <div className="legend-container">
      <div className="legend-bar">
        <div className="gradient"></div>

        {currentBPM && (
          <div
            className="legend-indicator"
            style={{ left: `${indicatorPosition}%` }}
          >
            <div className="tooltip">
              <span className="tooltip-text">{level}</span>
            </div>
            <div className="ring-dot"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GradientLegend;
