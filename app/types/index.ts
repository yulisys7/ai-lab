export type LabType = 'bookshelf' | 'fridge' | 'closet' | 'whiskey';

export interface Lab {
  id: LabType;
  icon: string;
  title: string;
  desc: string;
  color: string;
  gradient: string;
}

export interface AnalysisResult {
  id: string;
  type: LabType;
  analysis: string;
  images: string[];
  createdAt: Date;
  score?: number;
}

export interface UploadedImage {
  file: File;
  preview: string;
  id: string;
}
