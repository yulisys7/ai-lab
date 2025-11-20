'use client';

import { motion } from 'framer-motion';
import { Calendar, Image } from 'lucide-react';
import { AnalysisResult, LabInfo } from '../types';

interface ResultCardProps {
  result: AnalysisResult;
  labInfo: LabInfo;
}

export default function ResultCard({ result, labInfo }: ResultCardProps) {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`text-3xl p-2 bg-gradient-to-r ${labInfo.color} rounded-xl`}>
          {labInfo.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">{labInfo.title}</h3>
          <div className="flex items-center gap-2 text-white/60 text-sm mt-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(result.timestamp)}</span>
          </div>
        </div>
      </div>

      {result.imageUrls && result.imageUrls.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {result.imageUrls.slice(0, 3).map((url, idx) => (
            <div
              key={idx}
              className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-white/20"
            >
              <img
                src={url}
                alt={`분석 이미지 ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {result.imageUrls.length > 3 && (
            <div className="w-20 h-20 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/20">
              <span className="text-white/60 text-sm">
                +{result.imageUrls.length - 3}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <p className="text-white/90 text-sm line-clamp-4 leading-relaxed">
          {result.analysis}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-4 text-white/50 text-xs">
        <Image className="w-4 h-4" />
        <span>{result.imageUrls?.length || 0}개 이미지 분석</span>
      </div>
    </motion.div>
  );
}