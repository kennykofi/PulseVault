import React from "react";
import "./MascotPanel.css";

import chillbeat from "../assets/cold-hearted.png";




function MascotPanel() {
  return (
    <div className="mascot-floating-panel">
      {/* Main mascot (centered) */}
      <img src={chillbeat} alt="Main Mascot" className="main-mascot" />
      

      

      <p className="mascot-subtext">Your heartbeat, protected by experts.</p>
    </div>
  );
}

export default MascotPanel;

