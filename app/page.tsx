'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, History, Trash2 } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import ResultCard from './components/ResultCard';
import { compressImage, saveToHistory, getHistory, clearHistory } from './lib/utils';

type LabType = 'bookshelf' | 'fridge' | 'closet' | 'whiskey' | null;

interface UploadedImage {
  file: File;
  preview: string;
  id: string;
}

export default function Home() {
  const [selectedLab, setSelectedLab] = useState<LabType>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const labs = {
    bookshelf: {
      icon: '📚',
      title: '서재 스캐너',
      desc: '책장을 찍으면 당신의 지적 성향을 분석해드려요',
      color: 'from-blue-500 to-cyan-500',
      gradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'
    },
    fridge: {
      icon: '🧊',
      title: '냉장고 셰프',
      desc: '냉장고를 찍으면 맞춤 레시피를 추천해드려요',
      color: 'from-green-500 to-emerald-500',
      gradient: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'
    },
    closet: {
      icon: '👔',
      title: '옷장 스타일리스트',
      desc: '옷장을 찍으면 오늘의 코디를 제안해드려요',
      color: 'from-purple-500 to-pink-500',
      gradient: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
    },
    whiskey: {
      icon: '🥃',
      title: '위스키 소믈리에',
      desc: '위스키/와인을 찍으면 전문가 분석과 페어링을 추천해드려요',
      color: 'from-amber-600 to-orange-500',
      gradient: 'bg-gradient-to-br from-amber-600/20 to-orange-500/20'
    }
  };

  const loadHistory = () => {
    setHistory(getHistory());
    setShowHistory(true);
  };

  const analyzeImages = async () => {
    if (images.length === 0 || !selectedLab) return;

    setAnalyzing(true);
    setResult(null);

    try {
      // 이미지 압축
      const compressedImages = await Promise.all(
        images.map((img) => compressImage(img.file))
      );

      // 여러 이미지를 순차적으로 분석
      const analyses: string[] = [];

      for (let i = 0; i < compressedImages.length; i++) {
        const formData = new FormData();
        formData.append('image', compressedImages[i]);
        formData.append('type', selectedLab);
        formData.append('imageIndex', String(i + 1));
        formData.append('totalImages', String(compressedImages.length));

        const response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        analyses.push(data.analysis);
      }

      // 종합 분석 요청
      if (compressedImages.length > 1) {
        const summaryData = new FormData();
        summaryData.append('type', selectedLab);
        summaryData.append('mode', 'summary');
        summaryData.append('analyses', JSON.stringify(analyses));

        const summaryResponse = await fetch('/api/analyze', {
          method: 'POST',
          body: summaryData,
        });

        const summaryResult = await summaryResponse.json();
        analyses.push('\n\n📌 종합 분석:\n' + summaryResult.analysis);
      }

      const finalResult = {
        id: Date.now().toString(),
        type: selectedLab,
        analysis: analyses.join('\n\n---\n\n'),
        images: images.map((img) => img.preview),
        createdAt: new Date(),
      };

      setResult(finalResult);
      saveToHistory(finalResult);
    } catch (error) {
      console.error('분석 실패:', error);
      alert('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedLab(null);
    setImages([]);
    setResult(null);
  };

  // 히스토리 화면
  if (showHistory) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setShowHistory(false)}
              className="flex items-center gap-2 text-white hover:text-gray-300"
            >
              <ArrowLeft className="w-5 h-5" />
              돌아가기
            </button>
            <button
              onClick={() => {
                if (confirm('모든 히스토리를 삭제할까요?')) {
                  clearHistory();
                  setHistory([]);
                }
              }}
              className="flex items-center gap-2 text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-5 h-5" />
              전체 삭제
            </button>
          </div>

          <h1 className="text-4xl font-bold text-white mb-8">📜 분석 히스토리</h1>

          {history.length === 0 ? (
            <div className="text-center text-white/50 py-20">
              <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>아직 분석 기록이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-6">
              {history.map((item) => (
                <ResultCard
                  key={item.id}
                  result={item}
                  labInfo={labs[item.type as LabType]!}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  // 메인 화면
  if (!selectedLab) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 relative overflow-hidden">
        {/* 배경 애니메이션 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full"
              animate={{
                x: [Math.random() * 1200, Math.random() * 1200],
                y: [Math.random() * 800, Math.random() * 800],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16 pt-12"
          >
            <motion.h1
              className="text-7xl font-bold text-white mb-6"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🧪 AI 실험실
            </motion.h1>
            <p className="text-2xl text-gray-300 mb-4">
              일상을 스캔하면, AI가 답합니다
            </p>
            <p className="text-white/60">
              사진 여러 장을 한 번에 분석할 수 있어요
            </p>
          </motion.div>

          {/* 실험실 카드들 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {Object.entries(labs).map(([key, lab], index) => (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedLab(key as LabType)}
                className={`
                  bg-gradient-to-br ${lab.color} p-10 rounded-3xl shadow-2xl
                  text-white relative overflow-hidden group
                `}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                <div className="relative z-10">
                  <motion.div
                    className="text-7xl mb-6"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {lab.icon}
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-3">{lab.title}</h2>
                  <p className="text-sm opacity-90 leading-relaxed">{lab.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* 히스토리 버튼 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <button
              onClick={loadHistory}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20
                rounded-full text-white transition-colors backdrop-blur-sm"
            >
              <History className="w-5 h-5" />
              분석 히스토리 보기
            </button>
          </motion.div>

          {/* 푸터 */}
          <div className="text-center mt-16 text-gray-400 text-sm space-y-2">
            <p>💡 재미로 만든 실험 프로젝트입니다</p>
            <p className="text-xs">Powered by GPT-4 Vision API</p>
          </div>
        </div>
      </main>
    );
  }

  const currentLab = labs[selectedLab];

  // 실험실 화면
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={reset}
          className="mb-6 text-white hover:text-gray-300 flex items-center gap-2 text-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          돌아가기
        </motion.button>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`bg-gradient-to-br ${currentLab.color} p-10 rounded-3xl shadow-2xl mb-8`}
        >
          <div className="flex items-center gap-6">
            <div className="text-8xl">{currentLab.icon}</div>
            <div>
              <h1 className="text-5xl font-bold text-white mb-3">{currentLab.title}</h1>
              <p className="text-white/90 text-lg">{currentLab.desc}</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <ImageUploader
                  onImagesChange={setImages}
                  maxImages={5}
                />

                {images.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={analyzeImages}
                    disabled={analyzing}
                    className="w-full mt-8 bg-gradient-to-r from-cyan-500 to-blue-500 
                      text-white py-5 rounded-2xl font-bold text-xl
                      hover:from-cyan-400 hover:to-blue-400 transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center justify-center gap-3 shadow-lg"
                  >
                    {analyzing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                        />
                        분석 중... ({images.length}장)
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        AI 분석 시작하기
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ResultCard
                result={result}
                labInfo={currentLab}
                onShare={() => alert('공유 기능은 곧 추가됩니다!')}
                onDownload={() => alert('다운로드 기능은 곧 추가됩니다!')}
              />

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={reset}
                className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white py-4 
                  rounded-2xl font-bold text-lg transition-colors backdrop-blur-sm"
              >
                🔄 다시 시작하기
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
