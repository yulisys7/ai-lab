'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      console.log('📁 파일 드롭:', acceptedFiles.length, '개');
      
      const newImages = await Promise.all(
        acceptedFiles.slice(0, maxImages - images.length).map(async (file) => {
          console.log('🖼️ 파일 변환 중:', file.name, file.size, 'bytes');
          
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              console.log('✅ 변환 완료:', result.substring(0, 50) + '...');
              resolve(result);
            };
            reader.onerror = (error) => {
              console.error('❌ 파일 읽기 실패:', error);
              resolve('');
            };
            reader.readAsDataURL(file);
          });
        })
      );

      const validImages = newImages.filter(img => img !== '');
      console.log('✅ 유효한 이미지:', validImages.length, '개');
      
      onImagesChange([...images, ...validImages]);
    },
    [images, maxImages, onImagesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: maxImages - images.length,
    disabled: images.length >= maxImages,
  });

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const canUpload = images.length < maxImages;

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center 
          transition-all duration-300 cursor-pointer overflow-hidden
          ${isDragActive
            ? 'border-purple-400 bg-purple-400/10 scale-[1.02]'
            : images.length >= maxImages
            ? 'border-gray-700 bg-gray-800/30 cursor-not-allowed'
            : 'border-gray-600/50 hover:border-purple-400/50 bg-white/5 hover:bg-white/10'
          }
        `}
        style={{
          transform: canUpload && isDragActive ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        <input {...getInputProps()} />
        
        {/* Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
        
        {/* Content */}
        <div className="relative z-10">
          <div
            style={{
              transform: isDragActive ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.3s ease',
            }}
          >
            <div className={`
              w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center
              bg-gradient-to-br transition-all duration-300
              ${images.length >= maxImages 
                ? 'from-gray-600 to-gray-700' 
                : 'from-purple-500 to-blue-500'
              }
            `}>
              {images.length >= maxImages ? (
                <Check className="w-10 h-10 text-white" />
              ) : (
                <Upload className="w-10 h-10 text-white" />
              )}
            </div>
          </div>

          {images.length >= maxImages ? (
            <div>
              <p className="text-lg font-semibold text-white mb-2">
                최대 업로드 완료
              </p>
              <p className="text-sm text-gray-400">
                {maxImages}장의 이미지가 준비되었습니다
              </p>
            </div>
          ) : isDragActive ? (
            <div>
              <p className="text-lg font-semibold text-white mb-2">
                여기에 이미지를 놓으세요
              </p>
              <p className="text-sm text-purple-300">
                파일을 드롭하면 자동으로 업로드됩니다
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-semibold text-white mb-2">
                이미지를 드래그하거나 클릭해서 업로드
              </p>
              <p className="text-sm text-gray-400 mb-4">
                JPG, PNG, WebP 등 이미지 파일 지원
              </p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                  <span className="text-purple-300 font-semibold">{images.length}</span>
                  <span className="text-gray-400"> / {maxImages}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Grid */}
      <AnimatePresence mode="popLayout">
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4"
          >
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                transition={{ type: 'spring', bounce: 0.4 }}
                className="relative aspect-square rounded-xl overflow-hidden group"
              >
                {/* Image */}
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-white text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                      <ImageIcon className="w-3 h-3" />
                      {index + 1}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Border Gradient */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-400/50 rounded-xl transition-all duration-300" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}