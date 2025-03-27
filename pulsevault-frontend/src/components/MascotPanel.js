import React from "react";
import "./MascotPanel.css";

import chillbeat from "../assets/chillbeat.webp";
import mascot1 from "../assets/mascot_1.png";
import mascot2 from "../assets/mascot_2.png";
import mascot3 from "../assets/mascot_3.png";
import mascot4 from "../assets/mascot_4.png";
import mascot5 from "../assets/mascot_5.png";
import mascot6 from "../assets/mascot_6.png";

const mascots = [mascot1, mascot2, mascot3, mascot4, mascot5, mascot6];

function MascotPanel() {
  return (
    <div className="mascot-floating-panel">
      {/* Main mascot (centered) */}
      <img src={chillbeat} alt="Main Mascot" className="main-mascot" />

      {/* Scattered mini mascots */}
      {mascots.map((src, i) => (
        <img key={i} src={src} alt={`Mascot ${i + 1}`} className={`mini-mascot mini-${i + 1}`} />
      ))}

      <p className="mascot-subtext">Your heartbeat, protected by experts.</p>
    </div>
  );
}

export default MascotPanel;
