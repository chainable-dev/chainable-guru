"use client";

import React, { useState, useRef, type ClipboardEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { FileIcon, XIcon } from 'lucide-react';
import { useWalletState } from '@/hooks/useWalletState';

interface MultiModalInputProps {
  onSubmit?: (text: string, files: File[]) => void;
  placeholder?: string;
  maxFiles?: number;
  acceptedFileTypes?: string[];
}

interface UploadStatus {
  progress: number;
  status: 'validating' | 'preparing' | 'uploading' | 'processing' | 'complete' | 'idle';
}

export function MultiModalInput({
  onSubmit,
  placeholder = "Type a message or paste/upload files...",
  maxFiles = 5,
  acceptedFileTypes = ['image/*', 'application/pdf']
}: MultiModalInputProps) {
  const { isConnected } = useWalletState();
  const [text, setText] = useState('');
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    progress: 0,
    status: 'idle'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProgress = (status: UploadStatus['status'], progress: number) => {
    setUploadStatus({ status, progress });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement> | { target: { files: File[] } }) => {
    if (!isConnected) {
      console.error('Please connect your wallet first');
      return;
    }

    const files = Array.from(event.target.files || []);
    
    // Step 1: Validation (20%)
    updateProgress('validating', 20);
    const validFiles = files.filter(file => 
      acceptedFileTypes.some(type => {
        const [category, ext] = type.split('/');
        return ext === '*' ? file.type.startsWith(category) : file.type === type;
      })
    );

    // Check max files limit
    const totalFiles = stagedFiles.length + validFiles.length;
    if (totalFiles > maxFiles) {
      console.error(`Maximum ${maxFiles} files allowed`);
      updateProgress('idle', 0);
      return;
    }

    // Step 2: Preparing files (40%)
    updateProgress('preparing', 40);
    setStagedFiles(prev => [...prev, ...validFiles]);

    // Step 3: Upload simulation (40-90%)
    updateProgress('uploading', 40);
    
    try {
      await new Promise<void>((resolve) => {
        let progress = 40;
        const interval = setInterval(() => {
          progress += 10;
          updateProgress('uploading', progress);
          
          if (progress >= 90) {
            clearInterval(interval);
            resolve();
          }
        }, 200);
      });

      // Step 4: Processing (90-100%)
      updateProgress('processing', 90);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Complete
      updateProgress('complete', 100);
      setTimeout(() => {
        updateProgress('idle', 0);
      }, 1000);

    } catch (error) {
      console.error('Upload failed:', error);
      updateProgress('idle', 0);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    if (!isConnected) {
      console.error('Please connect your wallet first');
      return;
    }

    const items = e.clipboardData?.items;
    if (!items) return;
    
    const files = Array.from(items)
      .filter(item => item.kind === 'file')
      .map(item => item.getAsFile())
      .filter((file): file is File => file !== null);
      
    if (files.length > 0) {
      handleFileChange({ target: { files } });
    }
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      console.error('Please connect your wallet first');
      return;
    }

    if (onSubmit) {
      await onSubmit(text, stagedFiles);
    }
    setText('');
    setStagedFiles([]);
    setUploadStatus({ progress: 0, status: 'idle' });
  };

  const removeFile = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusText = () => {
    switch (uploadStatus.status) {
      case 'validating': return 'Validating files...';
      case 'preparing': return 'Preparing upload...';
      case 'uploading': return 'Uploading files...';
      case 'processing': return 'Processing...';
      case 'complete': return 'Upload complete!';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={handlePaste}
          placeholder={isConnected ? placeholder : "Please connect your wallet first"}
          disabled={!isConnected}
          className="min-h-[100px] resize-none"
        />
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptedFileTypes.join(',')}
          multiple
          disabled={!isConnected}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={!isConnected}
          className="absolute bottom-2 right-2 p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          📎
        </button>
      </div>

      {/* File Previews */}
      {stagedFiles.length > 0 && (
        <div className="space-y-4">
          {/* Progress indicator */}
          {uploadStatus.status !== 'idle' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{getStatusText()}</span>
                <span>{uploadStatus.progress}%</span>
              </div>
              <Progress 
                value={uploadStatus.progress} 
                className="w-full h-2"
              />
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {stagedFiles.map((file, index) => (
              <div 
                key={index} 
                className="relative group aspect-square border rounded-lg overflow-hidden bg-gray-50"
              >
                {file.type.startsWith('image/') ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      fill
                      className="object-cover"
                      onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <FileIcon className="w-8 h-8 text-gray-400" />
                    <p className="mt-2 text-xs text-gray-500 truncate max-w-full">
                      {file.name}
                    </p>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <p className="text-xs text-white truncate">{file.name}</p>
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Status overlay */}
                {uploadStatus.status !== 'idle' && uploadStatus.status !== 'complete' && (
                  <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
                    <span className="text-white text-sm mb-2">
                      {getStatusText()}
                    </span>
                    <Progress 
                      value={uploadStatus.progress} 
                      className="w-3/4 h-2"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!text && stagedFiles.length === 0 || uploadStatus.status !== 'idle'}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
} 