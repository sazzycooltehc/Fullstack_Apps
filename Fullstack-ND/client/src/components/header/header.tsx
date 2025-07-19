"use client";

import { Component, ReactNode } from "react";
import "./header.scss";

class Header extends Component {
    render(): ReactNode {
        return (
            <header className="Header w-full bg-gray-100 text-gray-800 py-4 px-6 shadow-sm">
                <h1 className="text-lg font-medium text-center">
                    Incident Quality Data Analyzer
                </h1>
            </header>

        );
    }
}

export default Header;
