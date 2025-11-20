'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadedImage {
  file: File;
  preview: string;
  id: string;
}

interface Props {
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ onImagesChange, maxImages = 5 }: Props) {
  const [images, setImages] = useState<UploadedImage[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.slice(0, maxImages - images.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36),
    }));

    const updated = [...images, ...newImages];
    setImages(updated);
    onImagesChange(updated);
  }, [images, maxImages, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: maxImages,
  });

  const removeImage = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    setImages(updated);
    onImagesChange(updated);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300
          ${isDragActive 
            ? 'border-cyan-400 bg-cyan-500/10 scale-105' 
            : 'border-white/30 bg-white/5 hover:bg-white/10'
          }
        `}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={{ y: isDragActive ? -10 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Upload className="w-16 h-16 mx-auto mb-4 text-white/70" />
          <p className="text-white text-xl mb-2">
            {isDragActive ? '여기에 놓으세요!' : '사진을 드래그하거나 클릭하세요'}
          </p>
          <p className="text-white/50 text-sm">
            최대 {maxImages}장까지 업로드 가능 (JPG, PNG)
          </p>
        </motion.div>
      </div>

      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <img
                  src={image.preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-40 object-cover rounded-xl"
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full
                    opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                  {index + 1}번 사진
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {images.length > 0 && (
        <div className="flex items-center justify-between text-white/70 text-sm">
          <span className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            {images.length}장 선택됨
          </span>
          <button
            onClick={() => {
              setImages([]);
              onImagesChange([]);
            }}
            className="text-red-400 hover:text-red-300"
          >
            전체 삭제
          </button>
        </div>
      )}
    </div>
  );
}
