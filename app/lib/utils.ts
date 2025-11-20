
import { AnalysisResult } from '../types';

// 이미지를 Base64로 변환
export async function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// 이미지 압축
export async function compressImage(file: File, maxSize: number = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 최대 크기에 맞게 조정
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

// 히스토리 저장
export function saveToHistory(result: AnalysisResult): void {
  if (typeof window === 'undefined') return;
  
  try {
    const history = loadHistory();
    const newHistory = [result, ...history].slice(0, 20); // 최대 20개 저장
    localStorage.setItem('ai-lab-history', JSON.stringify(newHistory));
  } catch (error) {
    console.error('히스토리 저장 실패:', error);
  }
}

// 히스토리 불러오기
export function loadHistory(): AnalysisResult[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('ai-lab-history');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('히스토리 불러오기 실패:', error);
    return [];
  }
}

// 히스토리 삭제
export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('ai-lab-history');
  } catch (error) {
    console.error('히스토리 삭제 실패:', error);
  }
}
