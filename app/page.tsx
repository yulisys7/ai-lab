'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Microscope, BookOpen, Refrigerator, Shirt, Wine } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import ResultCard from './components/ResultCard';
import LoadingProgress from './components/LoadingProgress';
import ErrorModal from './components/ErrorModal';
import ResultDisplay from './components/ResultDisplay';
import { AnalysisResult, ErrorType } from './types';

type LabType = 'bookshelf' | 'fridge' | 'closet' | 'whisky';

const labs = [
  {
    id: 'bookshelf' as LabType,
    name: '그 남자의 서재',
    icon: BookOpen,
    color: 'from-amber-500 to-orange-600',
    description: '책장으로 알아보는 당신의 내면',
  },
  {
    id: 'fridge' as LabType,
    name: '그 남자의 냉장고',
    icon: Refrigerator,
    color: 'from-blue-500 to-cyan-600',
    description: '냉장고로 보는 라이프스타일',
  },
  {
    id: 'closet' as LabType,
    name: '그 남자의 옷장',
    icon: Shirt,
    color: 'from-purple-500 to-pink-600',
    description: '옷장으로 파악하는 패션 감각',
  },
  {
    id: 'whisky' as LabType,
    name: '그 남자의 위스키',
    icon: Wine,
    color: 'from-yellow-600 to-amber-700',
    description: '위스키 컬렉션으로 보는 취향',
  },
];

export default function Home() {
  const [selectedLab, setSelectedLab] = useState<LabType>('bookshelf');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<{ type: ErrorType; message: string } | null>(null);

  const handleAnalyze = async () => {
    if (uploadedImages.length === 0) {
      setError({ type: 'upload', message: '이미지를 먼저 업로드해주세요.' });
      return;
    }

    setIsAnalyzing(true);
    setLoadingStep(1);
    setError(null);

    try {
      // 1단계: 이미지 검증
      console.log('📸 업로드된 이미지:', {
        count: uploadedImages.length,
        sizes: uploadedImages.map(img => img.length),
        firstImageStart: uploadedImages[0]?.substring(0, 30)
      });

      // 2단계: 요청 데이터 준비
      const requestData = {
        images: uploadedImages,
        labType: selectedLab,
      };
      
      console.log('📦 요청 데이터 준비:', {
        labType: requestData.labType,
        imageCount: requestData.images.length
      });

      setLoadingStep(2);

      // 3단계: API 호출
      console.log('🚀 API 호출 시작...');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('📡 응답 상태:', response.status, response.statusText);

      setLoadingStep(3);

      // 4단계: 응답 처리
      const contentType = response.headers.get('content-type');
      console.log('📄 응답 Content-Type:', contentType);

      if (!contentType?.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ JSON이 아닌 응답:', textResponse.substring(0, 200));
        throw new Error('서버에서 올바른 응답을 받지 못했습니다.');
      }

      const data = await response.json();
      console.log('✅ 응답 데이터:', data);

      if (!response.ok) {
        throw new Error(data.error || '분석 중 오류가 발생했습니다.');
      }

      // 5단계: 결과 저장
      const newResult: AnalysisResult = {
        id: Date.now().toString(),
        labType: selectedLab,
        images: uploadedImages,
        analysis: data.analysis,
        timestamp: data.timestamp || new Date().toISOString(),
      };

      setResults((prev) => [newResult, ...prev]);
      setCurrentResult(newResult);
      setUploadedImages([]);

      console.log('✅ 분석 완료!');

    } catch (error: any) {
      console.error('❌ 클라이언트 에러:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setError({ type: 'network', message: '네트워크 연결을 확인해주세요.' });
      } else if (error.message.includes('API')) {
        setError({ type: 'api', message: error.message });
      } else {
        setError({ type: 'unknown', message: error.message });
      }
    } finally {
      setIsAnalyzing(false);
      setLoadingStep(1);
    }
  };

  const selectedLabData = labs.find((lab) => lab.id === selectedLab)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Microscope className="w-8 h-8 text-purple-400" />
              <motion.div
                className="absolute inset-0 bg-purple-400 blur-xl opacity-50"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">AI 실험실</h1>
              <p className="text-sm text-purple-300">사진으로 분석하는 당신의 이야기</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Lab Selection */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">실험실 선택</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {labs.map((lab) => {
              const Icon = lab.icon;
              const isSelected = selectedLab === lab.id;
              return (
                <motion.button
                  key={lab.id}
                  onClick={() => setSelectedLab(lab.id)}
                  className={`relative p-6 rounded-2xl transition-all ${
                    isSelected
                      ? 'bg-white/20 ring-2 ring-white/50'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${lab.color} flex items-center justify-center mb-3`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{lab.name}</h3>
                  <p className="text-sm text-gray-400">{lab.description}</p>
                  {isSelected && (
                    <motion.div
                      layoutId="selected-lab"
                      className="absolute inset-0 border-2 border-white/50 rounded-2xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Image Upload */}
        <section className="mb-8">
          <div
            className={`rounded-3xl bg-gradient-to-br ${selectedLabData.color} p-1`}
          >
            <div className="bg-slate-900 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                {selectedLabData.name} 분석
              </h2>
              <ImageUploader
                images={uploadedImages}
                onImagesChange={setUploadedImages}
                maxImages={5}
              />
              <motion.button
                onClick={handleAnalyze}
                disabled={isAnalyzing || uploadedImages.length === 0}
                className={`w-full mt-6 py-4 rounded-xl font-semibold text-white transition-all ${
                  isAnalyzing || uploadedImages.length === 0
                    ? 'bg-gray-600 cursor-not-allowed'
                    : `bg-gradient-to-r ${selectedLabData.color} hover:shadow-lg hover:shadow-purple-500/50`
                }`}
                whileHover={
                  !isAnalyzing && uploadedImages.length > 0 ? { scale: 1.02 } : {}
                }
                whileTap={
                  !isAnalyzing && uploadedImages.length > 0 ? { scale: 0.98 } : {}
                }
              >
                {isAnalyzing ? 'AI가 분석 중입니다...' : '분석 시작'}
              </motion.button>
            </div>
          </div>
        </section>

        {/* Loading Progress */}
        <AnimatePresence>
          {isAnalyzing && (
            <LoadingProgress currentStep={loadingStep} labName={selectedLabData.name} />
          )}
        </AnimatePresence>

        {/* Current Result */}
        <AnimatePresence>
          {currentResult && !isAnalyzing && (
            <ResultDisplay
              result={currentResult}
              onClose={() => setCurrentResult(null)}
            />
          )}
        </AnimatePresence>

        {/* History */}
        {results.length > 0 && !currentResult && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">분석 히스토리</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result) => (
                <ResultCard
                  key={result.id}
                  result={result}
                  onClick={() => setCurrentResult(result)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Error Modal */}
      <ErrorModal
        isOpen={!!error}
        errorType={error?.type || 'unknown'}
        message={error?.message || ''}
        onClose={() => setError(null)}
        onRetry={() => {
          setError(null);
          handleAnalyze();
        }}
      />
    </div>
  );
}