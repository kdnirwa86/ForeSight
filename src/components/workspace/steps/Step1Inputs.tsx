"use client";

import { useState, useRef, useEffect } from "react";
import {
  Globe,
  Tag,
  ChevronDown,
  X,
  Plus,
  Users,
  DollarSign,
  Star,
  MapPin,
} from "lucide-react";

// Category → Sub-categories
const CATEGORY_SUB_CATEGORIES: Record<string, string[]> = {
  "Snacks & Food": ["Crackers & Crisp Breads", "Chocolate & Confectionery", "Savoury Snacks", "Health & Wellness Snacks", "Bakery & Biscuits"],
  "Beverages": ["Carbonated Drinks", "Juices & Nectars", "Energy Drinks", "Hot Beverages", "Dairy-Based Drinks"],
  "Dairy & Alternatives": ["Yogurt", "Cheese", "Plant-Based Milk", "Ice Cream", "Butter & Spreads"],
  "PC & Laptops": ["Touchscreen Laptops", "Gaming Laptops", "Ultrabooks", "Business Laptops", "Chromebooks", "2-in-1 Convertibles"],
  "Consumer Electronics": ["Smartphones", "Tablets", "Smart Speakers", "Wearables", "Headphones & Audio"],
  "Personal Care": ["Skincare", "Haircare", "Oral Care", "Deodorants & Fragrances"],
};

// Sub-category → Brands
const SUB_CATEGORY_BRANDS: Record<string, string[]> = {
  "Crackers & Crisp Breads": ["Pepsi", "ITC", "Nestlé", "Hershey", "Mondelez", "Britannia", "Parle", "Angie's Artisan Treats", "Lance Snacks"],
  "Chocolate & Confectionery": ["Mondelez", "Hershey", "Nestlé", "Mars", "Ferrero", "Cadbury", "Lindt", "Toblerone"],
  "Savoury Snacks": ["Pepsi (Lay's)", "ITC (Bingo)", "Pringles", "Doritos", "Kettle Brand", "Popchips"],
  "Health & Wellness Snacks": ["Kind Snacks", "RXBar", "Clif Bar", "Nature Valley", "Larabar", "Quest Nutrition", "Kashi"],
  "Bakery & Biscuits": ["Britannia", "Parle", "McVitie's", "Oreo", "Mondelez", "ITC Sunfeast"],
  "Carbonated Drinks": ["Pepsi", "Coca-Cola", "Sprite", "Fanta", "Mountain Dew", "Thums Up"],
  "Juices & Nectars": ["Tropicana", "Minute Maid", "Real", "Paper Boat", "B Natural"],
  "Energy Drinks": ["Red Bull", "Monster", "Rockstar", "Sting", "Reign"],
  "Hot Beverages": ["Nescafé", "Bru", "Tata Tea", "Lipton", "Starbucks", "Brooke Bond"],
  "Dairy-Based Drinks": ["Amul", "Nestlé Milo", "Horlicks", "Boost", "Complan"],
  "Yogurt": ["Danone", "Chobani", "Fage", "Activia", "Amul", "Mother Dairy"],
  "Cheese": ["Amul", "Kraft", "President", "Laughing Cow", "Britannia"],
  "Plant-Based Milk": ["Oatly", "Alpro", "Silk", "So Delicious", "Blue Diamond Almond Breeze"],
  "Ice Cream": ["Häagen-Dazs", "Baskin-Robbins", "Ben & Jerry's", "Amul", "Vadilal"],
  "Butter & Spreads": ["Amul", "Britannia", "Nutella", "Veeba", "Kissan"],
  "Touchscreen Laptops": ["Dell", "HP", "Lenovo", "Microsoft Surface", "ASUS", "Acer", "Samsung"],
  "Gaming Laptops": ["ASUS ROG", "MSI", "Razer", "Alienware", "Lenovo Legion", "HP Omen", "Acer Predator"],
  "Ultrabooks": ["Apple", "Dell XPS", "HP Spectre", "Lenovo ThinkPad", "Microsoft Surface", "Samsung Galaxy Book"],
  "Business Laptops": ["Lenovo ThinkPad", "HP EliteBook", "Dell Latitude", "Apple MacBook Pro", "Microsoft Surface"],
  "Chromebooks": ["Google", "ASUS", "HP", "Lenovo", "Acer", "Samsung"],
  "2-in-1 Convertibles": ["Microsoft Surface", "Dell", "HP", "Lenovo Yoga", "ASUS ZenBook Flip"],
  "Smartphones": ["Apple", "Samsung", "Google Pixel", "OnePlus", "Xiaomi", "Vivo", "OPPO"],
  "Tablets": ["Apple iPad", "Samsung Galaxy Tab", "Microsoft Surface", "Lenovo Tab", "Amazon Fire"],
  "Smart Speakers": ["Amazon Echo", "Google Nest", "Apple HomePod", "Sonos", "JBL"],
  "Wearables": ["Apple Watch", "Samsung Galaxy Watch", "Fitbit", "Garmin", "Xiaomi Mi Band"],
  "Headphones & Audio": ["Sony", "Bose", "Apple AirPods", "Sennheiser", "JBL", "Noise"],
  "Skincare": ["L'Oréal", "Neutrogena", "Pond's", "Himalaya", "Dove", "Nivea"],
  "Haircare": ["Pantene", "Head & Shoulders", "Dove", "L'Oréal", "Sunsilk", "Indulekha"],
  "Oral Care": ["Colgate", "Oral-B", "Sensodyne", "Dabur", "Himalaya", "Pepsodent"],
  "Deodorants & Fragrances": ["Axe", "Dove", "Fogg", "Nivea", "Park Avenue", "Wild Stone"],
};

// Region → Countries
const REGION_COUNTRIES: Record<string, string[]> = {
  "Global": [],
  "North America": ["United States", "Canada", "Mexico"],
  "Europe": ["United Kingdom", "Germany", "France", "Italy", "Spain", "Netherlands", "Sweden", "Switzerland", "Poland", "Belgium"],
  "Asia Pacific": ["China", "Japan", "South Korea", "Australia", "Indonesia", "Thailand", "Vietnam", "Malaysia", "Singapore", "Philippines"],
  "South Asia": ["India", "Pakistan", "Bangladesh", "Sri Lanka", "Nepal", "Myanmar"],
  "Latin America": ["Brazil", "Mexico", "Argentina", "Colombia", "Chile", "Peru", "Ecuador"],
  "Middle East & Africa": ["UAE", "Saudi Arabia", "South Africa", "Nigeria", "Egypt", "Kenya", "Qatar", "Kuwait"],
  "India": ["All India", "Maharashtra", "Karnataka", "Delhi NCR", "Tamil Nadu", "Telangana", "Gujarat", "West Bengal"],
};

const REGIONS = Object.keys(REGION_COUNTRIES);
const TIME_PERIODS = ["Last 3 months", "Last 6 months", "Last 12 months", "Last 24 months", "Custom range"];
const PROJECT_TYPES = ["Competitive Intelligence", "Ideation", "Strategy", "Market Research", "Innovation Tracking"];
const PRICE_TIERS = ["Premium", "Medium", "Low"];

export interface Step1Context {
  category: string;
  subCategory: string;
  region: string;
  country: string;
  brands: string[];
  primaryCompetitors: string[];
  secondaryCompetitors: string[];
}

interface Step1Props {
  onDataChange?: (data: Step1Context) => void;
  initialData?:  Step1Context;
}

export default function Step1Inputs({ onDataChange, initialData }: Step1Props) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("Competitive Intelligence");
  const [objective, setObjective] = useState("");

  // Category & Sub-category
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [subCategory, setSubCategory] = useState(initialData?.subCategory ?? "");
  const [customSubCategories, setCustomSubCategories] = useState<Record<string, string[]>>({});
  const [addingSubCategory, setAddingSubCategory] = useState(false);
  const [newSubCategoryInput, setNewSubCategoryInput] = useState("");

  // Geography
  const [region, setRegion] = useState(initialData?.region ?? "Global");
  const [country, setCountry] = useState(initialData?.country ?? "");

  const [timePeriod, setTimePeriod] = useState("Last 12 months");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [focusInput, setFocusInput] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialData?.brands ?? []);
  const [selectedPriceTiers, setSelectedPriceTiers] = useState<string[]>([]);
  const [primaryCompetitors, setPrimaryCompetitors] = useState<string[]>(initialData?.primaryCompetitors ?? []);
  const [secondaryCompetitors, setSecondaryCompetitors] = useState<string[]>(initialData?.secondaryCompetitors ?? []);
  const [primaryInput, setPrimaryInput] = useState("");
  const [secondaryInput, setSecondaryInput] = useState("");
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  // Emit context whenever key scope fields change
  useEffect(() => {
    onDataChange?.({ category, subCategory, region, country, brands: selectedBrands, primaryCompetitors, secondaryCompetitors });
  }, [category, subCategory, region, country, selectedBrands, primaryCompetitors, secondaryCompetitors, onDataChange]);

  // Close brand dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(e.target as Node)) {
        setBrandDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // All categories (built-in + custom)
  const allCategories = [...Object.keys(CATEGORY_SUB_CATEGORIES), ...customCategories];

  // Sub-categories for selected category
  const builtInSubs = category ? (CATEGORY_SUB_CATEGORIES[category] || []) : [];
  const customSubs = category ? (customSubCategories[category] || []) : [];
  const allSubCategories = [...builtInSubs, ...customSubs];

  // Available brands driven by selected sub-category
  const availableBrands = subCategory ? (SUB_CATEGORY_BRANDS[subCategory] || []) : [];

  // Countries for selected region
  const availableCountries = REGION_COUNTRIES[region] || [];

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setSubCategory("");
    setSelectedBrands([]);
  };

  const handleSubCategoryChange = (val: string) => {
    setSubCategory(val);
    setSelectedBrands([]);
  };

  const confirmNewCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (trimmed && !allCategories.includes(trimmed)) {
      setCustomCategories((prev) => [...prev, trimmed]);
      handleCategoryChange(trimmed);
    }
    setNewCategoryInput("");
    setAddingCategory(false);
  };

  const confirmNewSubCategory = () => {
    const trimmed = newSubCategoryInput.trim();
    if (trimmed && !allSubCategories.includes(trimmed) && category) {
      setCustomSubCategories((prev) => ({
        ...prev,
        [category]: [...(prev[category] || []), trimmed],
      }));
      handleSubCategoryChange(trimmed);
    }
    setNewSubCategoryInput("");
    setAddingSubCategory(false);
  };

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

        {/* Category */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Category</label>
            {addingCategory ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  className="input-field flex-1"
                  placeholder="New category name..."
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmNewCategory();
                    if (e.key === "Escape") { setAddingCategory(false); setNewCategoryInput(""); }
                  }}
                />
                <button onClick={confirmNewCategory} className="btn-primary px-3">
                  <Plus size={15} />
                </button>
                <button
                  onClick={() => { setAddingCategory(false); setNewCategoryInput(""); }}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <select
                  className="input-field appearance-none pr-8"
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === "__add_new__") {
                      setAddingCategory(true);
                    } else {
                      handleCategoryChange(e.target.value);
                    }
                  }}
                >
                  <option value="">Select category</option>
                  {allCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__add_new__">+ Add new category</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Sub-Category */}
          <div>
            <label className="label">Sub-Category</label>
            {addingSubCategory ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  className="input-field flex-1"
                  placeholder="New sub-category name..."
                  value={newSubCategoryInput}
                  onChange={(e) => setNewSubCategoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmNewSubCategory();
                    if (e.key === "Escape") { setAddingSubCategory(false); setNewSubCategoryInput(""); }
                  }}
                />
                <button onClick={confirmNewSubCategory} className="btn-primary px-3">
                  <Plus size={15} />
                </button>
                <button
                  onClick={() => { setAddingSubCategory(false); setNewSubCategoryInput(""); }}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <select
                  className="input-field appearance-none pr-8"
                  value={subCategory}
                  disabled={!category}
                  onChange={(e) => {
                    if (e.target.value === "__add_new__") {
                      setAddingSubCategory(true);
                    } else {
                      handleSubCategoryChange(e.target.value);
                    }
                  }}
                >
                  <option value="">{category ? "Select sub-category" : "Select a category first"}</option>
                  {allSubCategories.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  {category && <option value="__add_new__">+ Add new sub-category</option>}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        {/* Market: Region + Country */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">
              <Globe size={11} className="inline mr-1" />
              Region
            </label>
            <div className="relative">
              <select
                className="input-field appearance-none pr-8"
                value={region}
                onChange={(e) => { setRegion(e.target.value); setCountry(""); }}
              >
                {REGIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="label">
              <MapPin size={11} className="inline mr-1" />
              Country
            </label>
            <div className="relative">
              <select
                className="input-field appearance-none pr-8"
                value={country}
                disabled={availableCountries.length === 0}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">
                  {availableCountries.length === 0 ? "N/A for Global" : "Select country (optional)"}
                </option>
                {availableCountries.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Time Period */}
        <div className="grid grid-cols-2 gap-4">
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
          Select one or more brands. Brands are automatically populated based on the selected sub-category.
          {!subCategory && (
            <span className="ml-1 text-amber-600 font-semibold">
              {!category ? "Select a category and sub-category above." : "Select a sub-category above to see brand suggestions."}
            </span>
          )}
          {subCategory && availableBrands.length === 0 && (
            <span className="ml-1 text-gray-400 italic">No preset brands for this sub-category.</span>
          )}
        </p>

        {/* Selected brands */}
        {selectedBrands.length > 0 && (
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
        )}

        {/* Dropdown */}
        <div className="relative" ref={brandDropdownRef}>
          <button
            onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
            className="input-field text-left flex items-center justify-between w-full"
            disabled={!subCategory || availableBrands.length === 0}
          >
            <span className={!subCategory || selectedBrands.length === 0 ? "text-gray-400" : "text-gray-900"}>
              {selectedBrands.length > 0
                ? `${selectedBrands.length} brand(s) selected`
                : subCategory && availableBrands.length > 0
                ? "Click to select brands..."
                : !subCategory
                ? "Select a sub-category first"
                : "No brands available for this sub-category"}
            </span>
            <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
          </button>
          {brandDropdownOpen && availableBrands.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {availableBrands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex items-center justify-between"
                >
                  <span>{brand}</span>
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
