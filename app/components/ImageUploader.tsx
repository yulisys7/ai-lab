'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newImages = [...images, ...acceptedFiles].slice(0, maxImages);
      onImagesChange(newImages);
    },
    [images, maxImages, onImagesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: maxImages,
    multiple: true,
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-white bg-white/10'
            : 'border-white/30 hover:border-white/50 hover:bg-white/5'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-white/60" />
        {isDragActive ? (
          <p className="text-white text-lg">이미지를 여기에 놓으세요...</p>
        ) : (
          <div>
            <p className="text-white text-lg mb-2">
              이미지를 드래그하거나 클릭해서 업로드
            </p>
            <p className="text-white/60 text-sm">
              최대 {maxImages}개까지 업로드 가능
            </p>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group rounded-xl overflow-hidden border border-white/20"
            >
              <img
                src={URL.createObjectURL(image)}
                alt={`업로드 ${index + 1}`}
                className="w-full h-40 object-cover"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 backdrop-blur-sm">
                {image.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="text-center text-white/60 text-sm">
          {images.length}/{maxImages} 이미지 업로드됨
        </div>
      )}
    </div>
  );
}
