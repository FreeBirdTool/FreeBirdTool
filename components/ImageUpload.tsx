import React, { useRef, useState } from 'react';
import { UploadedImage } from '../types';

interface ImageUploadProps {
  label: string;
  images: UploadedImage[];
  onImagesAdded: (newImages: UploadedImage[]) => void;
  onImageRemoved: (id: string) => void;
  heightClass?: string;
  placeholderText?: string;
  subText?: string;
  isSmall?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  label, 
  images, 
  onImagesAdded, 
  onImageRemoved,
  heightClass = "h-48",
  placeholderText = "Click or drop images here",
  subText = "",
  isSmall = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      processFiles(Array.from(event.target.files));
    }
    // Reset input value so same files can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = (files: File[]) => {
    const newImages: UploadedImage[] = [];
    let processedCount = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push({
          id: Math.random().toString(36).substr(2, 9),
          base64: reader.result as string,
          file: file
        });
        processedCount++;
        
        if (processedCount === files.length) {
          onImagesAdded(newImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter((file: any) => 
      file.type.startsWith('image/')
    ) as File[];
    
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="upload-block">
      {label && (
        <div className="upload-top flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="upload-label">{label}</div>
            <div className="upload-count">{images.length} item{images.length !== 1 && 's'}</div>
          </div>
        </div>
      )}
      
      {/* Drop Zone */}
      <div 
        className={`dropzone ${isSmall ? 'small' : ''} ${isDragging ? 'border-white bg-[rgba(255,255,255,0.05)]' : ''} ${images.length > 0 ? '!p-4 !min-h-[100px]' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={(e) => {
          // Prevent triggering file input when clicking remove button
          if ((e.target as HTMLElement).closest('button')) return;
          fileInputRef.current?.click();
        }}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange} 
          accept="image/*" 
          multiple
          className="hidden" 
        />

        {images.length === 0 ? (
          <div className="drop-content">
            <div className="drop-icon">
              {isSmall ? (
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.7">
                  <path d="M4 18l5-5 3.2 3.2L16 12l4 6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 8.5h.01" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="3.5" y="4" width="17" height="16" rx="2.5"/>
                </svg>
              ) : (
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.7">
                  <path d="M12 16V4" strokeLinecap="round"/>
                  <path d="M7.5 8.5L12 4l4.5 4.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 18.5C4 19.328 4.672 20 5.5 20h13c.828 0 1.5-.672 1.5-1.5" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <div className="drop-main">{placeholderText}</div>
            {subText && <div className="drop-sub">{subText}</div>}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 w-full relative z-10">
             {images.map((img) => (
               <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group border border-[rgba(255,255,255,0.08)] bg-black">
                 <img 
                   src={img.base64} 
                   alt="Upload" 
                   className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                 />
                 <button
                   onClick={() => onImageRemoved(img.id)}
                   className="absolute top-1 right-1 bg-black/80 hover:bg-white hover:text-black text-white rounded-full p-1 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
                   title="Remove image"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                     <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                   </svg>
                 </button>
               </div>
             ))}
             {/* Add More Button */}
             <div className="aspect-square rounded-lg border border-dashed border-[rgba(255,255,255,0.14)] flex items-center justify-center hover:bg-[rgba(255,255,255,0.04)] transition-colors text-[rgba(255,255,255,0.38)] hover:text-white">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
               </svg>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};