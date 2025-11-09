"use client";
import React, { useState } from "react";
import "./menu.css";

export const PlacesMenu: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="menu-wrapper">
      <div className="menu-button" onClick={() => setExpanded(!expanded)}>
        <span className="places">Places</span>
        <span className={`arrow ${expanded ? "up" : ""}`}></span>
      </div>

      {expanded && (
        <div className="dropdown">
          <div className="dropdown-arrow"></div>
          <div className="contents">
            
          </div>
        </div>
      )}
    </div>
  );
};
