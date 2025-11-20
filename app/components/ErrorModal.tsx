'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, RefreshCw, Wifi, Server, Upload, HelpCircle } from 'lucide-react';
import { ErrorType } from '../types';

interface ErrorModalProps {
  isOpen: boolean;
  errorType: ErrorType;
  message: string;
  onClose: () => void;
  onRetry?: () => void;
}

const errorConfig = {
  network: {
    icon: Wifi,
    title: '네트워크 오류',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    suggestions: [
      '인터넷 연결을 확인해주세요',
      'Wi-Fi 또는 데이터 연결 상태를 점검해주세요',
      'VPN을 사용 중이라면 잠시 끄고 시도해주세요',
    ],
  },
  api: {
    icon: Server,
    title: 'API 오류',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    suggestions: [
      'OpenAI API 키가 올바른지 확인해주세요',
      'API 사용량이 한도를 초과하지 않았는지 확인해주세요',
      '잠시 후 다시 시도해주세요',
    ],
  },
  upload: {
    icon: Upload,
    title: '업로드 오류',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    suggestions: [
      '이미지 파일이 올바른 형식인지 확인해주세요 (JPG, PNG 등)',
      '파일 크기가 너무 크지 않은지 확인해주세요',
      '다른 이미지로 시도해보세요',
    ],
  },
  unknown: {
    icon: HelpCircle,
    title: '알 수 없는 오류',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    suggestions: [
      '페이지를 새로고침해주세요',
      '브라우저 캐시를 삭제하고 다시 시도해주세요',
      '문제가 계속되면 고객센터에 문의해주세요',
    ],
  },
};

export default function ErrorModal({
  isOpen,
  errorType,
  message,
  onClose,
  onRetry,
}: ErrorModalProps) {
  const config = errorConfig[errorType];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Icon */}
              <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-6`}>
                <Icon className={`w-8 h-8 ${config.color}`} />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white text-center mb-2">
                {config.title}
              </h3>

              {/* Message */}
              <p className="text-gray-300 text-center mb-6">{message}</p>

              {/* Suggestions */}
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-white">해결 방법</p>
                </div>
                <ul className="space-y-2">
                  {config.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {onRetry && (
                  <motion.button
                    onClick={() => {
                      onClose();
                      onRetry();
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-shadow"
                  >
                    <RefreshCw className="w-4 h-4" />
                    다시 시도
                  </motion.button>
                )}
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${
                    onRetry ? 'flex-none px-6' : 'flex-1'
                  } py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors`}
                >
                  닫기
                </motion.button>
              </div>

              {/* Support Link */}
              <div className="mt-4 text-center">
                <a
                  href="mailto:support@example.com"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  문제가 계속되면 고객센터에 문의하세요 →
                </a>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}