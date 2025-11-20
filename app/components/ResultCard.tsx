'use client';

import { motion } from 'framer-motion';
import { Download, Share2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Props {
  result: {
    analysis: string;
    images: string[];
    createdAt: Date;
  };
  labInfo: {
    icon: string;
    title: string;
    color: string;
  };
  onShare?: () => void;
  onDownload?: () => void;
}

export default function ResultCard({ result, labInfo, onShare, onDownload }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`text-5xl bg-gradient-to-br ${labInfo.color} p-4 rounded-2xl`}>
            {labInfo.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{labInfo.title}</h2>
            <p className="text-white/60 text-sm flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4" />
              {format(new Date(result.createdAt), 'PPP p', { locale: ko })}
            </p>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex gap-2">
          <button
            onClick={onShare}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition"
            title="공유하기"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={onDownload}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition"
            title="다운로드"
          >
            <Download className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* 업로드된 이미지들 미리보기 */}
      {result.images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-6">
          {result.images.slice(0, 3).map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`분석 이미지 ${i + 1}`}
              className="w-full h-24 object-cover rounded-lg"
            />
          ))}
          {result.images.length > 3 && (
            <div className="w-full h-24 bg-white/5 rounded-lg flex items-center justify-center text-white/70">
              +{result.images.length - 3}
            </div>
          )}
        </div>
      )}

      {/* 분석 결과 */}
      <div className="bg-black/30 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          분석 결과
        </h3>
        <div className="text-white/90 whitespace-pre-wrap leading-relaxed space-y-3">
          {result.analysis.split('\n').map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

