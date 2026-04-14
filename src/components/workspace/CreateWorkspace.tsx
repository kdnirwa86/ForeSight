"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check, Globe, Tag, Target, Zap, Bell } from "lucide-react";
import Step1Inputs from "./steps/Step1Inputs";
import Step2SignalConfig from "./steps/Step2SignalConfig";
import Step3OutputConfig from "./steps/Step3OutputConfig";

const steps = [
  { id: 1, label: "Inputs", icon: Globe, description: "Workspace scope & brand setup" },
  { id: 2, label: "Signal Configuration", icon: Zap, description: "Define what to detect" },
  { id: 3, label: "Output & Alert Configuration", icon: Bell, description: "Set up alerts & dashboard" },
];

export default function CreateWorkspace() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
    else router.push("/workspace/3");
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Create New Workspace</h1>
            <p className="text-xs text-gray-400 mt-0.5">Configure your competitive intelligence workspace</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="btn-secondary flex items-center gap-2">
              <ChevronLeft size={16} />
              {currentStep === 1 ? "Cancel" : "Back"}
            </button>
            <button onClick={handleNext} className="btn-primary flex items-center gap-2">
              {currentStep === 3 ? "Create Workspace" : "Next"}
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
            const isActive = currentStep === step.id;
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
                    <div
                      className={`text-xs font-bold uppercase tracking-wide ${
                        isActive ? "text-blue-600" : isCompleted ? "text-blue-600" : "text-gray-400"
                      }`}
                    >
                      Step {step.id}
                    </div>
                    <div className={`text-sm font-semibold ${isActive ? "text-gray-900" : "text-gray-400"}`}>
                      {step.label}
                    </div>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-200"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="px-8 py-6 max-w-5xl">
        {currentStep === 1 && <Step1Inputs />}
        {currentStep === 2 && <Step2SignalConfig />}
        {currentStep === 3 && <Step3OutputConfig />}
      </div>
    </div>
  );
}
