'use client';

import { motion } from 'framer-motion';
import { X, Copy, Share2, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { AnalysisResult } from '../types';
import { useState } from 'react';

interface ResultDisplayProps {
  result: AnalysisResult;
  onClose: () => void;
}

export default function ResultDisplay({ result, onClose }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI 실험실 분석 결과',
          text: result.analysis,
        });
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      handleCopy();
    }
  };

  const handleFeedback = (type: 'good' | 'bad') => {
    setFeedback(type);
    console.log(`피드백: ${type}`, result.id);
    // 여기에 실제 피드백 전송 로직 추가 가능
  };

  // 키워드 하이라이트 처리
  const highlightKeywords = (text: string) => {
    const keywords = ['취향', '관심사', '성격', '스타일', '라이프스타일', '선호', '경향'];
    let highlightedText = text;

    keywords.forEach((keyword) => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        '<span class="text-purple-400 font-semibold">$1</span>'
      );
    });

    return highlightedText;
  };

  // 분석 결과를 섹션으로 나누기 (간단한 방법)
  const sections = result.analysis.split('\n\n').filter((section) => section.trim());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="relative p-6 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <h2 className="text-2xl font-bold text-white mb-2">분석 결과</h2>
          <p className="text-sm text-gray-400">
            {new Date(result.timestamp).toLocaleString('ko-KR')}
          </p>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {/* Images Grid */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-6">
            {result.images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="aspect-square rounded-lg overflow-hidden"
              >
                <img
                  src={image}
                  alt={`분석 이미지 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>

          {/* Analysis Result */}
          <div className="bg-white/5 rounded-2xl p-6 space-y-4">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="text-gray-200 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: highlightKeywords(section),
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 bg-black/20">
          <div className="flex items-center justify-between gap-4">
            {/* Feedback */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">도움이 되었나요?</span>
              <button
                onClick={() => handleFeedback('good')}
                className={`p-2 rounded-lg transition-colors ${
                  feedback === 'good'
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-gray-400'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFeedback('bad')}
                className={`p-2 rounded-lg transition-colors ${
                  feedback === 'bad'
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-gray-400'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={handleCopy}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="text-sm">복사됨!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">복사</span>
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 text-white flex items-center gap-2 transition-shadow"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">공유</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}