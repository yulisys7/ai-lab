export interface AnalysisResult {
  id: string;
  labType: string;
  images: string[];
  analysis: string;
  timestamp: string;
}

export type ErrorType = 'network' | 'api' | 'upload' | 'unknown';