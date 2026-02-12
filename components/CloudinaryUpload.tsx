import React, { useState, useEffect, useCallback } from 'react';
import Button from './ui/Button';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

interface CloudinaryUploadProps {
  onSuccess: (url: string) => void;
  initialValue?: string;
}

const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({ onSuccess, initialValue }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialValue || null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 30;
    const checkCloudinary = () => {
      // @ts-ignore
      if (window.cloudinary && window.cloudinary.createUploadWidget) {
        setIsScriptLoaded(true);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkCloudinary, 300);
      } else {
        setError("Operational initialization failure.");
      }
    };
    checkCloudinary();
  }, []);

  const openWidget = useCallback(() => {
    if (!isScriptLoaded) return;
    setError(null);
    // @ts-ignore
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'depwccsmw',
        uploadPreset: 'evenza', 
        multiple: false,
        maxFiles: 1,
        resourceType: 'image',
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#10B981",
            tabIcon: "#10B981",
            textDark: "#064E3B",
            textLight: "#FFFFFF",
            link: "#10B981",
            action: "#10B981",
            inactiveTabIcon: "#065F46",
            error: "#F43F5E",
            inProgress: "#10B981",
            complete: "#22C55E",
            sourceBg: "#F9FAFB"
          },
          frame: {
            borderWidth: "2px",
            borderColor: "#10B981",
          }
        }
      },
      (err: any, result: any) => {
        if (err) { setError("Upload sequence error."); setIsUploading(false); return; }
        if (result.event === "upload-added") setIsUploading(true);
        if (result.event === "success") {
          const url = result.info.secure_url;
          setPreviewUrl(url);
          onSuccess(url);
          setIsUploading(false);
        }
      }
    );
    widget.open();
  }, [isScriptLoaded, onSuccess]);

  return (
    <div className="w-full space-y-4">
      <label className="text-[10px] font-black text-brand-sub dark:text-slate-400 uppercase tracking-[0.3em]">
        Visual Identity Banner
      </label>
      <div 
        onClick={openWidget}
        className={`relative aspect-[21/9] rounded-[5px] border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center overflow-hidden ${
          previewUrl ? 'border-primary bg-white dark:bg-[#0F172A]' : 'border-primary dark:border-slate-800 bg-white dark:bg-slate-900/30 hover:border-primary-hover'
        }`}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} className="w-full h-full object-cover" alt="Operational Banner" />
            <div className="absolute inset-0 bg-brand-text/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <Button variant="secondary" className="border-white text-white">Modify Visual Narrative</Button>
            </div>
          </>
        ) : (
          <div className="text-center p-10">
            <div className="mb-6 text-primary">
              {isUploading ? <Loader2 size={56} className="animate-spin mx-auto" /> : <ImageIcon size={56} className="mx-auto" />}
            </div>
            <p className="font-black text-brand-text dark:text-slate-400 text-lg mb-2 uppercase tracking-tight">
              {isUploading ? "Uploading Data..." : "Upload Structural Banner"}
            </p>
            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-brand-sub">Protocol: 21:9 or 16:9 Aspect Ratio</p>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest">{error}</p>}
    </div>
  );
};

export default CloudinaryUpload;