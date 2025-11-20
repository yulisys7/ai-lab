
export type LabType = 'library' | 'fridge' | 'closet' | 'whiskey';

export interface AnalysisResult {
  id: string;
  type: LabType;
  timestamp: string;
  analysis: string;
  imageUrls: string[];
}

export interface LabInfo {
  icon: string;
  title: string;
  description: string;
  color: string;
}