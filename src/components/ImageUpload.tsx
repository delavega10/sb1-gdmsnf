import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  folder: 'profiles' | 'experiences';
}

export default function ImageUpload({ onImageUploaded, currentImageUrl, folder }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Generate a unique file name
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '-').toLowerCase();
      const fileName = `${timestamp}-${randomString}-${safeFileName}`;
      const filePath = `${folder}/${fileName}`;
      
      // Create reference to the file location
      const storageRef = ref(storage, filePath);
      
      // Upload with metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      };

      // Upload file
      const snapshot = await uploadBytes(storageRef, file, metadata);
      
      // Get download URL with cache busting
      const downloadUrl = await getDownloadURL(snapshot.ref);
      const urlWithCache = `${downloadUrl}?t=${timestamp}`;
      
      onImageUploaded(urlWithCache);
      setPreviewUrl(urlWithCache);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
      setPreviewUrl(currentImageUrl);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(undefined);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg cursor-pointer"
            onClick={triggerFileInput}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg">
            <button
              type="button"
              onClick={triggerFileInput}
              className="mx-2 px-4 py-2 bg-white text-gray-700 rounded-full shadow hover:bg-gray-50 transition-colors"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="mx-2 px-4 py-2 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          className={`w-full h-48 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer ${
            uploading 
              ? 'border-indigo-300 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'
          } flex flex-col items-center justify-center`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
              <span className="text-sm text-indigo-600">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                Click or drag image to upload
              </span>
              <span className="text-xs text-gray-500 mt-1">
                Max file size: 5MB
              </span>
            </>
          )}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <X className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}