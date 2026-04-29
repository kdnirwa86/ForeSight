"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check, Globe, Zap, Bell } from "lucide-react";
import Step1Inputs from "./steps/Step1Inputs";
import Step2SignalConfig from "./steps/Step2SignalConfig";
import Step3OutputConfig from "./steps/Step3OutputConfig";
import type { Step1Context } from "./steps/Step1Inputs";
import type { Step2Context } from "./steps/Step2SignalConfig";

// ─── SHARED TYPES (re-exported for Step3) ────────────────────────────────────

export interface WorkspaceSummary {
  step1: Step1Context;
  step2: Step2Context;
}

export interface SavedWorkspace {
  id:          string;
  name:        string;
  description: string;
  type:        string;
  status:      string;
  updated:     string;
  category:    string;
  subCategory: string;
  region:      string;
  country:     string;
}

// ─── EMPTY DEFAULTS ───────────────────────────────────────────────────────────

const EMPTY_STEP1: Step1Context = {
  category: "",
  subCategory: "",
  region: "Global",
  country: "",
  brands: [],
  primaryCompetitors: [],
  secondaryCompetitors: [],
};

const EMPTY_STEP2: Step2Context = {
  objectives: [],
  intentFilters: [],
  positioning: "",
  vulnerabilities: [],
  consumers: [],
  selectedSignals: [],
};

// ─── STEP METADATA ────────────────────────────────────────────────────────────

const steps = [
  { id: 1, label: "Inputs",                      icon: Globe,  description: "Workspace scope & brand setup" },
  { id: 2, label: "Signal Configuration",         icon: Zap,    description: "Define what to detect" },
  { id: 3, label: "Output & Alert Configuration", icon: Bell,   description: "Set up alerts & dashboard" },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

interface Props {
  editId?: string;
}

export default function CreateWorkspace({ editId }: Props) {
  const isEditing = !!editId;
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Context, setStep1Context] = useState<Step1Context>(EMPTY_STEP1);
  const [step2Context, setStep2Context] = useState<Step2Context>(EMPTY_STEP2);
  const [initialStep1, setInitialStep1] = useState<Step1Context>(EMPTY_STEP1);
  const [initialStep2, setInitialStep2] = useState<Step2Context>(EMPTY_STEP2);
  // Delay rendering steps until we've loaded saved config (for edit mode)
  const [ready, setReady] = useState(!isEditing);
  const router = useRouter();

  // Load saved config when editing
  useEffect(() => {
    if (!editId) return;
    try {
      const raw = localStorage.getItem(`foresight_ws_config_${editId}`);
      if (raw) {
        const cfg = JSON.parse(raw);
        const s1: Step1Context = {
          category:             cfg.category ?? "",
          subCategory:          cfg.subCategory ?? "",
          region:               cfg.region ?? "Global",
          country:              cfg.country ?? "",
          brands:               cfg.brands ?? [],
          primaryCompetitors:   cfg.primaryCompetitors ?? cfg.competitors?.slice(0, 5) ?? [],
          secondaryCompetitors: cfg.secondaryCompetitors ?? cfg.competitors?.slice(5) ?? [],
        };
        const s2: Step2Context = {
          objectives:      [],
          intentFilters:   cfg.intentFilters ?? [],
          positioning:     cfg.positioning ?? "",
          vulnerabilities: cfg.vulnerabilities ?? [],
          consumers:       cfg.consumers ?? [],
          selectedSignals: cfg.selectedSignals ?? [],
        };
        setInitialStep1(s1);
        setInitialStep2(s2);
        setStep1Context(s1);
        setStep2Context(s2);
      }
    } catch (_) { /* ignore */ }
    setReady(true);
  }, [editId]);

  const handleStep1Change = useCallback((data: Step1Context) => {
    setStep1Context(data);
  }, []);

  const handleStep2Change = useCallback((data: Step2Context) => {
    setStep2Context(data);
  }, []);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        const config = {
          category:             step1Context.category,
          subCategory:          step1Context.subCategory,
          region:               step1Context.region,
          country:              step1Context.country,
          competitors:          [...step1Context.primaryCompetitors, ...step1Context.secondaryCompetitors, ...step1Context.brands].slice(0, 10),
          primaryCompetitors:   step1Context.primaryCompetitors,
          secondaryCompetitors: step1Context.secondaryCompetitors,
          brands:               step1Context.brands,
          intentFilters:        step2Context.intentFilters,
          positioning:          step2Context.positioning,
          vulnerabilities:      step2Context.vulnerabilities,
          consumers:            step2Context.consumers,
          selectedSignals:      step2Context.selectedSignals,
        };

        const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const name = step1Context.subCategory
          ? `${step1Context.subCategory} — Competitive Intelligence`
          : step1Context.category
          ? `${step1Context.category} — Competitive Intelligence`
          : "Competitive Intelligence Workspace";

        if (isEditing && editId) {
          // Update existing workspace
          localStorage.setItem(`foresight_ws_config_${editId}`, JSON.stringify(config));

          const listRaw = localStorage.getItem("foresight_workspaces");
          const list: SavedWorkspace[] = listRaw ? JSON.parse(listRaw) : [];
          const updated = list.map(ws =>
            ws.id === editId
              ? { ...ws, name, category: step1Context.category, subCategory: step1Context.subCategory, region: step1Context.region, country: step1Context.country, updated: today }
              : ws
          );
          localStorage.setItem("foresight_workspaces", JSON.stringify(updated));
          router.push(`/workspace/${editId}`);
        } else {
          // Create new workspace
          const listRaw = localStorage.getItem("foresight_workspaces");
          const existingList: SavedWorkspace[] = listRaw ? JSON.parse(listRaw) : [];
          const maxId = existingList.reduce((m, ws) => Math.max(m, Number(ws.id)), 9);
          const newId = String(maxId + 1);

          const geo = [step1Context.region, step1Context.country].filter(Boolean).join(", ") || "Global";
          const description = step1Context.category
            ? `${step1Context.category}${step1Context.subCategory ? " · " + step1Context.subCategory : ""} · ${geo} competitive intelligence workspace.`
            : "Competitive intelligence workspace.";

          const newEntry: SavedWorkspace = {
            id: newId, name, description,
            type: "Competitive", status: "ACTIVE", updated: today,
            category: step1Context.category, subCategory: step1Context.subCategory,
            region: step1Context.region, country: step1Context.country,
          };

          localStorage.setItem("foresight_workspaces", JSON.stringify([newEntry, ...existingList]));
          localStorage.setItem(`foresight_ws_config_${newId}`, JSON.stringify(config));
          router.push(`/workspace/${newId}`);
        }
      } catch (_) {
        router.push("/");
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else router.push(isEditing && editId ? `/workspace/${editId}` : "/");
  };

  const summaryData: WorkspaceSummary = { step1: step1Context, step2: step2Context };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {isEditing ? "Edit Workspace" : "Create New Workspace"}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEditing
                ? "Update your competitive intelligence workspace configuration"
                : "Configure your competitive intelligence workspace"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="btn-secondary flex items-center gap-2">
              <ChevronLeft size={16} />
              {currentStep === 1 ? (isEditing ? "Cancel" : "Cancel") : "Back"}
            </button>
            <button onClick={handleNext} className="btn-primary flex items-center gap-2">
              {currentStep === 3
                ? (isEditing ? "Update Workspace" : "Create Workspace")
                : "Next"}
              {currentStep < 3 && <ChevronRight size={16} />}
              {currentStep === 3 && <Check size={16} />}
            </button>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex items-center mt-5 max-w-2xl">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isCompleted = currentStep > step.id;
            const isActive    = currentStep === step.id;
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 ${
                      isCompleted
                        ? "bg-blue-600 border-blue-600 text-white"
                        : isActive
                        ? "bg-blue-50 border-blue-600 text-blue-600"
                        : "bg-white border-gray-200 text-gray-400"
                    }`}
                  >
                    {isCompleted ? <Check size={16} /> : <StepIcon size={16} />}
                  </div>
                  <div>
                    <div className={`text-xs font-bold uppercase tracking-wide ${isActive ? "text-blue-600" : isCompleted ? "text-blue-600" : "text-gray-400"}`}>
                      Step {step.id}
                    </div>
                    <div className={`text-sm font-semibold ${isActive ? "text-gray-900" : "text-gray-400"}`}>
                      {step.label}
                    </div>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content — only render after config is loaded */}
      <div className="px-8 py-6 max-w-5xl">
        {ready && currentStep === 1 && (
          <Step1Inputs initialData={initialStep1} onDataChange={handleStep1Change} />
        )}
        {ready && currentStep === 2 && (
          <Step2SignalConfig contextData={step1Context} initialData={initialStep2} onDataChange={handleStep2Change} />
        )}
        {ready && currentStep === 3 && (
          <Step3OutputConfig summaryData={summaryData} />
        )}
        {!ready && (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
