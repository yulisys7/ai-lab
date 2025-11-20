'use client';

import { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ResultCard from './components/ResultCard';
import { LabType, AnalysisResult } from './types';
import { saveToHistory, loadHistory } from './lib/utils';

const labs = {
  library: {
    icon: '📚',
    title: '그 남자의 서재',
    description: '책장을 분석하여 당신의 지적 취향을 파악합니다',
    color: 'from-amber-500 to-orange-600',
  },
  fridge: {
    icon: '🧊',
    title: '그 남자의 냉장고',
    description: '냉장고 속 식재료로 당신의 라이프스타일을 분석합니다',
    color: 'from-blue-500 to-cyan-600',
  },
  closet: {
    icon: '👔',
    title: '그 남자의 옷장',
    description: '옷장을 통해 당신의 패션 감각과 성향을 파악합니다',
    color: 'from-purple-500 to-pink-600',
  },
  whiskey: {
    icon: '🥃',
    title: '그 남자의 위스키',
    description: '위스키 컬렉션으로 당신의 취향과 품격을 분석합니다',
    color: 'from-yellow-600 to-amber-700',
  },
};

export default function Home() {
  const [selectedLab, setSelectedLab] = useState<LabType | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // 히스토리 불러오기
  useState(() => {
    setHistory(loadHistory());
  });

  const handleAnalyze = async () => {
    if (!selectedLab || images.length === 0) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('labType', selectedLab);
      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('분석 중 오류가 발생했습니다');
      }

      const data = await response.json();
      const newResult: AnalysisResult = {
        id: Date.now().toString(),
        type: selectedLab,
        timestamp: new Date().toISOString(),
        analysis: data.analysis,
        imageUrls: images.map((img) => URL.createObjectURL(img)),
      };

      setResult(newResult);
      saveToHistory(newResult);
      setHistory(loadHistory());
    } catch (error) {
      console.error('분석 오류:', error);
      alert('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const resetLab = () => {
    setSelectedLab(null);
    setImages([]);
    setResult(null);
  };

  if (showHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <span>📊</span>
              분석 히스토리
            </h1>
            <button
              onClick={() => setShowHistory(false)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300"
            >
              돌아가기
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-white/60 text-lg">아직 분석 기록이 없습니다</p>
              </div>
            ) : (
              history.map((item) => (
                <ResultCard
                  key={item.id}
                  result={item}
                  labInfo={labs[item.type] || labs['library']}
                />
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (selectedLab) {
    const labInfo = labs[selectedLab];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={resetLab}
            className="mb-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 flex items-center gap-2"
          >
            <span>←</span>
            실험실 선택으로 돌아가기
          </button>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{labInfo.icon}</div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {labInfo.title}
              </h1>
              <p className="text-white/80 text-lg">{labInfo.description}</p>
            </div>

            {!result ? (
              <div className="space-y-8">
                <ImageUploader
                  images={images}
                  onImagesChange={setImages}
                  maxImages={5}
                />

                <button
                  onClick={handleAnalyze}
                  disabled={images.length === 0 || loading}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                    images.length === 0 || loading
                      ? 'bg-gray-500 cursor-not-allowed'
                      : `bg-gradient-to-r ${labInfo.color} hover:scale-105 shadow-lg`
                  } text-white`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="animate-spin">⚗️</span>
                      분석 중...
                    </span>
                  ) : (
                    `분석 시작 (${images.length}/5)`
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>🔬</span>
                    분석 결과
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-white/90 whitespace-pre-line leading-relaxed">
                      {result.analysis}
                    </p>
                  </div>
                </div>

                <button
                  onClick={resetLab}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-lg"
                >
                  새로운 분석 시작
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 flex items-center justify-center gap-4">
            <span>🧪</span>
            AI 실험실
          </h1>
          <p className="text-white/80 text-xl">
            당신의 일상을 AI가 분석합니다
          </p>
          <button
            onClick={() => setShowHistory(true)}
            className="mt-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300"
          >
            📊 히스토리 보기
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(Object.entries(labs) as [LabType, typeof labs[LabType]][]).map(([key, lab]) => (
            <button
              key={key}
              onClick={() => setSelectedLab(key)}
              className="group relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${lab.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`}></div>
              
              <div className="relative">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {lab.icon}
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  {lab.title}
                </h2>
                <p className="text-white/70">
                  {lab.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}