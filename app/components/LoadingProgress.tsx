'use client';

import { motion } from 'framer-motion';
import { Loader2, Image, Brain, Sparkles } from 'lucide-react';

interface LoadingProgressProps {
  currentStep: number;
  labName: string;
}

const steps = [
  {
    id: 1,
    icon: Image,
    title: '이미지 분석 중',
    description: '업로드된 사진을 처리하고 있습니다',
  },
  {
    id: 2,
    icon: Brain,
    title: 'AI 분석 진행 중',
    description: '인공지능이 패턴을 분석하고 있습니다',
  },
  {
    id: 3,
    icon: Sparkles,
    title: '결과 생성 중',
    description: '분석 결과를 정리하고 있습니다',
  },
];

export default function LoadingProgress({ currentStep, labName }: LoadingProgressProps) {
  const progress = (currentStep / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
          >
            <Loader2 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-2">{labName} 분석 중</h3>
          <p className="text-gray-400">잠시만 기다려주세요...</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>진행률</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: step.id * 0.1 }}
                className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                  isActive
                    ? 'bg-purple-500/20 ring-2 ring-purple-500/50'
                    : isCompleted
                    ? 'bg-green-500/10'
                    : 'bg-white/5'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isActive
                      ? 'bg-purple-500'
                      : isCompleted
                      ? 'bg-green-500'
                      : 'bg-white/10'
                  }`}
                >
                  {isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </motion.div>
                  ) : (
                    <Icon className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h4
                    className={`font-semibold mb-1 ${
                      isActive || isCompleted ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p
                    className={`text-sm ${
                      isActive ? 'text-purple-300' : 'text-gray-500'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Estimated Time */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            예상 소요 시간: <span className="text-purple-400 font-semibold">약 10-20초</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}