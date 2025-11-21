'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Microscope, BookOpen, Refrigerator, Shirt, Wine, Sparkles } from 'lucide-react';
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
    color: 'from-amber-400 via-orange-500 to-red-500',
    bgGradient: 'from-amber-500/20 to-orange-600/20',
    description: '책장으로 알아보는 당신의 내면',
    emoji: '📚',
  },
  {
    id: 'fridge' as LabType,
    name: '그 남자의 냉장고',
    icon: Refrigerator,
    color: 'from-cyan-400 via-blue-500 to-indigo-500',
    bgGradient: 'from-cyan-500/20 to-blue-600/20',
    description: '냉장고로 보는 라이프스타일',
    emoji: '🥗',
  },
  {
    id: 'closet' as LabType,
    name: '그 남자의 옷장',
    icon: Shirt,
    color: 'from-pink-400 via-purple-500 to-indigo-500',
    bgGradient: 'from-pink-500/20 to-purple-600/20',
    description: '옷장으로 파악하는 패션 감각',
    emoji: '👔',
  },
  {
    id: 'whisky' as LabType,
    name: '그 남자의 위스키',
    icon: Wine,
    color: 'from-yellow-400 via-amber-500 to-orange-600',
    bgGradient: 'from-yellow-500/20 to-amber-600/20',
    description: '위스키 컬렉션으로 보는 취향',
    emoji: '🥃',
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
      console.log('📸 업로드된 이미지:', {
        count: uploadedImages.length,
        sizes: uploadedImages.map(img => img.length),
        firstImageStart: uploadedImages[0]?.substring(0, 30)
      });

      const requestData = {
        images: uploadedImages,
        labType: selectedLab,
      };
      
      console.log('📦 요청 데이터 준비:', {
        labType: requestData.labType,
        imageCount: requestData.images.length
      });

      setLoadingStep(2);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/5 bg-black/20 backdrop-blur-2xl">
        <div className="container mx-auto px-4 py-8">
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Microscope className="w-10 h-10 text-purple-400" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-purple-400 blur-xl opacity-50"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  AI 실험실
                </h1>
                <p className="text-sm text-purple-300/80 mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  사진으로 분석하는 당신의 이야기
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-white/60">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              실시간 분석 가능
            </div>
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* Lab Selection */}
        <section className="mb-12">
          <motion.h2 
            className="text-3xl font-bold text-white mb-6 flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
            실험실 선택
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {labs.map((lab, index) => {
              const Icon = lab.icon;
              const isSelected = selectedLab === lab.id;
              return (
                <motion.button
                  key={lab.id}
                  onClick={() => setSelectedLab(lab.id)}
                  className={`relative group`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Card Background with Glassmorphism */}
                  <div className={`
                    relative p-6 rounded-3xl overflow-hidden
                    backdrop-blur-xl border transition-all duration-300
                    ${isSelected 
                      ? 'bg-white/20 border-white/40 shadow-2xl shadow-purple-500/20' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }
                  `}>
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${lab.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon Container */}
                      <div className={`
                        w-16 h-16 rounded-2xl bg-gradient-to-br ${lab.color} 
                        flex items-center justify-center mb-4
                        shadow-lg group-hover:shadow-2xl transition-shadow
                      `}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      {/* Text */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{lab.emoji}</span>
                        <h3 className="text-lg font-bold text-white">{lab.name}</h3>
                      </div>
                      <p className="text-sm text-gray-300/80">{lab.description}</p>
                    </div>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <motion.div
                        layoutId="selected-lab"
                        className="absolute inset-0 border-2 border-white/60 rounded-3xl"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Image Upload Section */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="relative">
            {/* Gradient Border */}
            <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${selectedLabData.color} opacity-50 blur-xl`} />
            
            {/* Main Card */}
            <div className="relative bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-white/10 overflow-hidden">
              {/* Header Accent */}
              <div className={`h-2 bg-gradient-to-r ${selectedLabData.color}`} />
              
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedLabData.emoji}</span>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedLabData.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60 bg-white/5 px-4 py-2 rounded-full">
                    <Sparkles className="w-4 h-4" />
                    GPT-4 Vision
                  </div>
                </div>

                <ImageUploader
                  images={uploadedImages}
                  onImagesChange={setUploadedImages}
                  maxImages={5}
                />

                <motion.button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || uploadedImages.length === 0}
                  className={`w-full mt-8 py-5 rounded-2xl font-bold text-white text-lg
                    transition-all duration-300 relative overflow-hidden group
                    ${isAnalyzing || uploadedImages.length === 0
                      ? 'bg-gray-700 cursor-not-allowed'
                      : `bg-gradient-to-r ${selectedLabData.color} hover:shadow-2xl hover:shadow-purple-500/30`
                    }`}
                  whileHover={!isAnalyzing && uploadedImages.length > 0 ? { scale: 1.02 } : {}}
                  whileTap={!isAnalyzing && uploadedImages.length > 0 ? { scale: 0.98 } : {}}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isAnalyzing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                        AI가 분석 중입니다...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        분석 시작
                      </>
                    )}
                  </span>
                  {!isAnalyzing && uploadedImages.length > 0 && (
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>

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
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
              분석 히스토리
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => (
                <ResultCard
                  key={result.id}
                  result={result}
                  onClick={() => setCurrentResult(result)}
                />
              ))}
            </div>
          </motion.section>
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