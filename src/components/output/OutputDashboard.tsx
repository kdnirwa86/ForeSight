"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Download,
  Send,
  CheckCircle,
  Clock,
  Radar,
  Zap,
  BarChart2,
  Target,
} from "lucide-react";
import CompetitorsRadar from "./tabs/CompetitorsRadar";
import EventIntelligence from "./tabs/EventIntelligence";
import ImpactAnalysis from "./tabs/ImpactAnalysis";
import ResponseAction from "./tabs/ResponseAction";

const TABS = [
  { id: "radar", label: "Competitors Radar", icon: Radar },
  { id: "events", label: "Event Intelligence", icon: Zap },
  { id: "impact", label: "Impact Analysis", icon: BarChart2 },
  { id: "response", label: "Response Action", icon: Target },
];

const STATUS_OPTIONS = ["Analyst Reviewed", "Pending Review", "In Progress"];

interface Props {
  workspaceId: string;
}

export default function OutputDashboard({ workspaceId }: Props) {
  const [activeTab, setActiveTab] = useState("radar");
  const [status, setStatus] = useState("Analyst Reviewed");
  const [statusOpen, setStatusOpen] = useState(false);

  const workspaceName =
    workspaceId === "3"
      ? "Q1 2026 Crackers & Crisp Breads Innovation Analysis"
      : workspaceId === "1"
      ? "Laptop Trends 2"
      : workspaceId === "2"
      ? "Laptop Trends"
      : "Competitive Intelligence Workspace";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-gray-900 max-w-xl truncate">
                  {workspaceName}
                </h1>
                <span className="badge-active">Active</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Competitive Intelligence · India · Last 12 months
              </p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Status dropdown */}
            <div className="relative">
              <button
                onClick={() => setStatusOpen(!statusOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                  status === "Analyst Reviewed"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : status === "Pending Review"
                    ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                }`}
              >
                {status === "Analyst Reviewed" ? (
                  <CheckCircle size={13} />
                ) : (
                  <Clock size={13} />
                )}
                Status: {status}
              </button>
              {statusOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setStatus(opt);
                        setStatusOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-xs font-medium hover:bg-gray-50 transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              <Send size={13} />
              Publish
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              <Download size={13} />
              Export
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 mt-4 border-b border-gray-100 -mb-4 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {activeTab === "radar" && <CompetitorsRadar />}
        {activeTab === "events" && <EventIntelligence />}
        {activeTab === "impact" && <ImpactAnalysis />}
        {activeTab === "response" && <ResponseAction />}
      </div>
    </div>
  );
}
