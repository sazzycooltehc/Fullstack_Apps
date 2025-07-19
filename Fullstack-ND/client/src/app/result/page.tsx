"use client";

import { Component, ReactNode } from "react";
import "./page.scss";

class IncidentResults extends Component {
  render(): ReactNode {
    return (
      <div className="result-container">
        <div className="result-box">Form Submitted Successfully!</div>
      </div>
    );
  }
}

export default IncidentResults;
