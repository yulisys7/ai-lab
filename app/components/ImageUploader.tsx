'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
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
              resolve(''); // 빈 문자열 반환
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

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          isDragActive
            ? 'border-purple-400 bg-purple-400/10'
            : images.length >= maxImages
            ? 'border-gray-600 bg-gray-800/50 cursor-not-allowed'
            : 'border-gray-600 hover:border-purple-400 bg-white/5 hover:bg-white/10'
        }`}
      >
        <input {...getInputProps()} />
        <Upload
          className={`w-12 h-12 mx-auto mb-4 ${
            images.length >= maxImages ? 'text-gray-600' : 'text-purple-400'
          }`}
        />
        {images.length >= maxImages ? (
          <p className="text-gray-400">최대 {maxImages}장까지 업로드 가능합니다</p>
        ) : isDragActive ? (
          <p className="text-white">이미지를 여기에 놓으세요</p>
        ) : (
          <div>
            <p className="text-white mb-2">이미지를 드래그하거나 클릭해서 업로드</p>
            <p className="text-sm text-gray-400">
              최대 {maxImages}장 ({images.length}/{maxImages})
            </p>
          </div>
        )}
      </div>

      {/* Image Preview */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4"
          >
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-lg overflow-hidden group"
              >
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}