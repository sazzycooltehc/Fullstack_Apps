"use client";

import React, { Component, ReactNode } from "react";
import "./page.scss";
import { incidentRouter } from "@/utils/incidentrouter";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { setResultData } from "@/utils/resultStore";

type Props = {
    router: AppRouterInstance;
};

type State = {
    incident: string;
    model: string;
    threshold: string;
    qualityScore: string;
    models: string[];
    touched: {
        incident: boolean;
        model: boolean;
        threshold: boolean;
        qualityScore: boolean;
    };
};

class IncidentData extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            incident: "",
            model: "",
            threshold: "",
            qualityScore: "",
            models: ["Model A", "Model B", "Model C"],
            touched: {
                incident: false,
                model: false,
                threshold: false,
                qualityScore: false,
            },
        };
    }

    handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        this.setState({ ...this.state, [name]: value });
    };

    handleBlur = (field: keyof State["touched"]) => {
        this.setState({
            touched: { ...this.state.touched, [field]: true },
        });
    };

    isValid = () => {
        const { incident, model, threshold, qualityScore } = this.state;
        const thresholdVal = parseFloat(threshold);
        const qualityVal = parseFloat(qualityScore);
        return (
            incident.trim().length > 0 &&
            model &&
            !isNaN(thresholdVal) &&
            thresholdVal >= 0.1 &&
            thresholdVal <= 0.9 &&
            !isNaN(qualityVal) &&
            qualityVal >= 1 &&
            qualityVal <= 10
        );
    };

    handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { incident, model, threshold, qualityScore } = this.state;

        if (!this.isValid()) return;

        try {
            const res = await fetch("http://localhost:8000/api/submit/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // if using session authentication
                body: JSON.stringify({
                    incident,
                    model,
                    threshold: parseFloat(threshold),
                    qualityScore: parseFloat(qualityScore),
                }),
            });

            const data = await res.json();

            if (res.ok) {
                document.cookie = "form_submitted=true; path=/";
                setResultData(data);
                this.props.router.push(`/result`);
            } else {
                alert(data.error || "Submission failed");
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("Network error");
        }
    };

    render(): ReactNode {
        const { incident, model, threshold, qualityScore, models, touched } = this.state;

        return (
            <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <form className="userForm p-4 border rounded-md w-full max-w-md" onSubmit={this.handleSubmit}>
                    <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">Incident Details</h2>

                    <div className="mb-4">
                        <label className="block mb-1">Incident</label>
                        <input
                            type="text"
                            name="incident"
                            value={incident}
                            onChange={this.handleChange}
                            onBlur={() => this.handleBlur("incident")}
                            className="w-full border px-3 py-2 rounded"
                        />
                        {touched.incident && !incident.trim() && <p className="text-red-500 text-sm">Incident is required</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1">Model</label>
                        <select
                            name="model"
                            value={model}
                            onChange={this.handleChange}
                            onBlur={() => this.handleBlur("model")}
                            className="w-full border px-3 py-2 rounded"
                        >
                            <option value="">Select model</option>
                            {models.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                        {touched.model && !model && <p className="text-red-500 text-sm">Please select a model</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1">Threshold (0.1 - 0.9)</label>
                        <input
                            type="number"
                            name="threshold"
                            step="0.1"
                            min="0.1"
                            max="0.9"
                            value={threshold}
                            onChange={this.handleChange}
                            onBlur={() => this.handleBlur("threshold")}
                            className="w-full border px-3 py-2 rounded"
                        />
                        {touched.threshold && (parseFloat(threshold) < 0.1 || parseFloat(threshold) > 0.9) && (
                            <p className="text-red-500 text-sm">Threshold must be between 0.1 and 0.9</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1">Quality Score (1 - 10)</label>
                        <input
                            type="number"
                            name="qualityScore"
                            min="1"
                            max="10"
                            value={qualityScore}
                            onChange={this.handleChange}
                            onBlur={() => this.handleBlur("qualityScore")}
                            className="w-full border px-3 py-2 rounded"
                        />
                        {touched.qualityScore &&
                            (parseFloat(qualityScore) < 1 || parseFloat(qualityScore) > 10) && (
                                <p className="text-red-500 text-sm">Quality score must be between 1 and 10</p>
                            )}
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-2 px-4 rounded text-white ${this.isValid() ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
                            }`}
                        disabled={!this.isValid()}
                    >
                        Submit
                    </button>
                </form>
            </main>
        );
    }
}

export default incidentRouter(IncidentData);
