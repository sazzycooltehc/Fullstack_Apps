"use client";

import { Component, ReactNode, useLayoutEffect } from "react";
import "./page.scss";
import { isAuthenticated } from "@/utils/auth";
import { redirect } from "next/navigation";

class IncidentResults extends Component {
  render(): ReactNode {
    // useLayoutEffect(() => {
    //   const isAuth = isAuthenticated;
    //   if(!isAuth){
    //     redirect("/")
    //   }
    // }, [])
    return (
      <div className="result-container">
        <div className="result-box">Form Submitted Successfully!</div>
      </div>
    );
  }
}

export default IncidentResults;
