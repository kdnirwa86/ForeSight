"use client";

import { useState } from "react";
import {
  Globe,
  Tag,
  ChevronDown,
  X,
  Plus,
  Users,
  DollarSign,
  Star,
} from "lucide-react";

const SUB_CATEGORY_BRANDS: Record<string, string[]> = {
  "Crackers & Crisp Breads": ["Pepsi", "ITC", "Nestlé", "Hershey", "Mondelez", "Britannia", "Parle", "Angie's Artisan Treats", "Lance Snacks"],
  "Chocolate & Confectionery": ["Mondelez", "Hershey", "Nestlé", "Mars", "Ferrero", "Cadbury", "Lindt", "Toblerone"],
  "Beverages": ["Pepsi", "Coca-Cola", "Red Bull", "Monster", "Tropicana", "Nestlé", "Nescafé", "Lipton"],
  "Health & Wellness Snacks": ["Kind Snacks", "RXBar", "Clif Bar", "Nature Valley", "Larabar", "Quest Nutrition", "Kashi"],
  "Dairy & Alternatives": ["Danone", "Nestlé", "Oatly", "Alpro", "Chobani", "Fage", "Activia"],
  "Savoury Snacks": ["Pepsi (Lay's)", "ITC (Bingo)", "Pringles", "Doritos", "Kettle Brand", "Popchips"],
};

const CATEGORIES = Object.keys(SUB_CATEGORY_BRANDS);
const GEOGRAPHIES = ["Global", "India", "North America", "Europe", "Asia Pacific", "South Asia", "Latin America", "Middle East & Africa"];
const TIME_PERIODS = ["Last 3 months", "Last 6 months", "Last 12 months", "Last 24 months", "Custom range"];
const PROJECT_TYPES = ["Competitive Intelligence", "Ideation", "Strategy", "Market Research", "Innovation Tracking"];
const PRICE_TIERS = ["Premium", "Medium", "Low"];

export default function Step1Inputs() {
  const [workspaceName, setWorkspaceName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("Competitive Intelligence");
  const [objective, setObjective] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [geography, setGeography] = useState("Global");
  const [timePeriod, setTimePeriod] = useState("Last 12 months");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [focusInput, setFocusInput] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceTiers, setSelectedPriceTiers] = useState<string[]>([]);
  const [primaryCompetitors, setPrimaryCompetitors] = useState<string[]>([]);
  const [secondaryCompetitors, setSecondaryCompetitors] = useState<string[]>([]);
  const [primaryInput, setPrimaryInput] = useState("");
  const [secondaryInput, setSecondaryInput] = useState("");
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  const availableBrands = category ? SUB_CATEGORY_BRANDS[category] || [] : [];

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const togglePriceTier = (tier: string) => {
    setSelectedPriceTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  };

  const addFocusArea = () => {
    if (focusInput.trim() && !focusAreas.includes(focusInput.trim())) {
      setFocusAreas([...focusAreas, focusInput.trim()]);
      setFocusInput("");
    }
  };

  const addCompetitor = (type: "primary" | "secondary") => {
    if (type === "primary" && primaryInput.trim()) {
      setPrimaryCompetitors([...primaryCompetitors, primaryInput.trim()]);
      setPrimaryInput("");
    } else if (type === "secondary" && secondaryInput.trim()) {
      setSecondaryCompetitors([...secondaryCompetitors, secondaryInput.trim()]);
      setSecondaryInput("");
    }
  };

  return (
    <div>
      {/* Basic Information */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <Globe size={15} className="text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Basic Information</h2>
        </div>

        <div className="mb-4">
          <label className="label">
            Workspace Name <span className="text-red-500">*</span>
          </label>
          <input
            className="input-field"
            placeholder="e.g., Q1 2026 Competitor Analysis"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="label">Description</label>
          <textarea
            className="input-field resize-none h-20"
            placeholder="Describe the purpose and goals of this workspace..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Project Type</label>
            <div className="relative">
              <select
                className="input-field appearance-none pr-8"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="label">Objective</label>
            <input
              className="input-field"
              placeholder="e.g., Identify market gaps"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Scope Definition */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Globe size={15} className="text-emerald-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Scope Definition</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Category</label>
            <div className="relative">
              <select
                className="input-field appearance-none pr-8"
                value={category}
                onChange={(e) => { setCategory(e.target.value); setSubCategory(""); setSelectedBrands([]); }}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="label">Sub-Category</label>
            <input
              className="input-field"
              placeholder="e.g., SaaS, Enterprise Software"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">
              <Globe size={11} className="inline mr-1" />
              Geography
            </label>
            <div className="relative">
              <select
                className="input-field appearance-none pr-8"
                value={geography}
                onChange={(e) => setGeography(e.target.value)}
              >
                {GEOGRAPHIES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="label">Time Period</label>
            <div className="relative">
              <select
                className="input-field appearance-none pr-8"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
              >
                {TIME_PERIODS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Innovation Focus Areas */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
            <Tag size={15} className="text-purple-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Innovation Focus Areas</h2>
        </div>
        <div className="flex gap-2 mb-2">
          <input
            className="input-field flex-1"
            placeholder="e.g., AI/ML, Sustainability, Digital Transformation"
            value={focusInput}
            onChange={(e) => setFocusInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFocusArea()}
          />
          <button onClick={addFocusArea} className="btn-primary px-3">
            <Plus size={16} />
          </button>
        </div>
        {focusAreas.length === 0 && (
          <p className="text-xs text-gray-400 mt-1">No focus areas added yet</p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {focusAreas.map((fa) => (
            <span
              key={fa}
              className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5"
            >
              {fa}
              <button onClick={() => setFocusAreas(focusAreas.filter((f) => f !== fa))}>
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Brands of Interest */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <Star size={15} className="text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Brands of Interest</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Select one or more brands. Brands shown are based on the selected category.
          {!category && (
            <span className="ml-1 text-amber-600 font-semibold">Select a category above to see brand suggestions.</span>
          )}
        </p>

        {/* Selected brands */}
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedBrands.map((brand) => (
            <span
              key={brand}
              className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5"
            >
              {brand}
              <button onClick={() => toggleBrand(brand)}>
                <X size={11} />
              </button>
            </span>
          ))}
        </div>

        {/* Dropdown */}
        <div className="relative">
          <button
            onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
            className="input-field text-left flex items-center justify-between"
            disabled={!category}
          >
            <span className={!category || selectedBrands.length === 0 ? "text-gray-400" : "text-gray-900"}>
              {selectedBrands.length > 0
                ? `${selectedBrands.length} brand(s) selected`
                : category
                ? "Click to select brands..."
                : "Select a category first"}
            </span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          {brandDropdownOpen && availableBrands.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {availableBrands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex items-center justify-between"
                >
                  {brand}
                  {selectedBrands.includes(brand) && (
                    <span className="text-blue-600 font-bold text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Price Tier */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <DollarSign size={15} className="text-amber-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Price Tier</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3">Select one or more price tiers to track</p>
        <div className="flex gap-3">
          {PRICE_TIERS.map((tier) => {
            const colors: Record<string, string> = {
              Premium: "border-purple-300 bg-purple-50 text-purple-700",
              Medium: "border-blue-300 bg-blue-50 text-blue-700",
              Low: "border-green-300 bg-green-50 text-green-700",
            };
            const selected = selectedPriceTiers.includes(tier);
            return (
              <button
                key={tier}
                onClick={() => togglePriceTier(tier)}
                className={`px-5 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${
                  selected
                    ? colors[tier]
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
              >
                {tier}
              </button>
            );
          })}
        </div>
      </div>

      {/* Key Competitors */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
            <Users size={15} className="text-red-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Key Competitors</h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Primary Competitors */}
          <div>
            <label className="label mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
              Primary List
            </label>
            <p className="text-xs text-gray-400 mb-2">Closest, highest-priority competitors</p>
            <div className="flex gap-2 mb-2">
              <input
                className="input-field flex-1"
                placeholder="Add competitor..."
                value={primaryInput}
                onChange={(e) => setPrimaryInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCompetitor("primary")}
              />
              <button onClick={() => addCompetitor("primary")} className="btn-primary px-3">
                <Plus size={15} />
              </button>
            </div>
            <div className="space-y-1.5">
              {primaryCompetitors.map((c, i) => (
                <div
                  key={c}
                  className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{c}</span>
                  </div>
                  <button
                    onClick={() => setPrimaryCompetitors(primaryCompetitors.filter((x) => x !== c))}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              {primaryCompetitors.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">No primary competitors added</p>
              )}
            </div>
          </div>

          {/* Secondary Competitors */}
          <div>
            <label className="label mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
              Secondary List
            </label>
            <p className="text-xs text-gray-400 mb-2">Broader competitive landscape to monitor</p>
            <div className="flex gap-2 mb-2">
              <input
                className="input-field flex-1"
                placeholder="Add competitor..."
                value={secondaryInput}
                onChange={(e) => setSecondaryInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCompetitor("secondary")}
              />
              <button onClick={() => addCompetitor("secondary")} className="btn-primary px-3">
                <Plus size={15} />
              </button>
            </div>
            <div className="space-y-1.5">
              {secondaryCompetitors.map((c, i) => (
                <div
                  key={c}
                  className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-400 text-white text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{c}</span>
                  </div>
                  <button
                    onClick={() => setSecondaryCompetitors(secondaryCompetitors.filter((x) => x !== c))}
                    className="text-gray-400 hover:text-orange-500"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              {secondaryCompetitors.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">No secondary competitors added</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
