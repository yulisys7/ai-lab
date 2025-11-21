'use client';

import { motion } from 'framer-motion';
import { BookOpen, Refrigerator, Shirt, Wine, Clock, Eye } from 'lucide-react';
import { AnalysisResult } from '../types';

interface ResultCardProps {
  result: AnalysisResult;
  onClick: () => void;
}

type LabType = 'bookshelf' | 'fridge' | 'closet' | 'whisky';

const labConfig: Record<LabType, {
  icon: string;
  name: string;
  color: string;
  bgGradient: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = {
  bookshelf: {
    icon: '📚',
    name: '그 남자의 서재',
    color: 'from-amber-400 via-orange-500 to-red-500',
    bgGradient: 'from-amber-500/20 to-orange-600/20',
    Icon: BookOpen,
  },
  fridge: {
    icon: '🥗',
    name: '그 남자의 냉장고',
    color: 'from-cyan-400 via-blue-500 to-indigo-500',
    bgGradient: 'from-cyan-500/20 to-blue-600/20',
    Icon: Refrigerator,
  },
  closet: {
    icon: '👔',
    name: '그 남자의 옷장',
    color: 'from-pink-400 via-purple-500 to-indigo-500',
    bgGradient: 'from-pink-500/20 to-purple-600/20',
    Icon: Shirt,
  },
  whisky: {
    icon: '🥃',
    name: '그 남자의 위스키',
    color: 'from-yellow-400 via-amber-500 to-orange-600',
    bgGradient: 'from-yellow-500/20 to-amber-600/20',
    Icon: Wine,
  },
};

export default function ResultCard({ result, onClick }: ResultCardProps) {
  const labInfo = labConfig[result.labType as LabType];
  const IconComponent = labInfo.Icon;

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  return (
    <motion.button
      onClick={onClick}
      className="relative w-full text-left group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Gradient Glow */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${labInfo.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />

      {/* Card Container */}
      <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
        {/* Top Accent */}
        <div className={`h-1 bg-gradient-to-r ${labInfo.color}`} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${labInfo.color} flex items-center justify-center shadow-lg`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>{labInfo.icon}</span>
                  {labInfo.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {formatDate(result.timestamp)}
                </div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <Eye className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Images Preview */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {result.images.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg overflow-hidden bg-white/5 relative"
              >
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 3 && result.images.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      +{result.images.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Analysis Preview */}
          <div className="bg-white/5 rounded-xl p-3 mb-3">
            <p className="text-sm text-gray-300 line-clamp-3">
              {result.analysis}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-400">분석 완료</span>
            </div>
            <div className="text-xs text-purple-400 font-semibold group-hover:text-purple-300 transition-colors">
              자세히 보기 →
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}