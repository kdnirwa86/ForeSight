export interface StoredConfig {
  category:         string;
  subCategory:      string;
  region:           string;
  country:          string;
  competitors:      string[];
  intentFilters:    string[];
  positioning?:     string;
  vulnerabilities?: string[];
  consumers?:       string[];
  selectedSignals?: string[];
}
