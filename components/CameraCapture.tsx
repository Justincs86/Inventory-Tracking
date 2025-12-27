
import React, { useState } from 'react';
import { Camera as CameraIcon, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface CameraCaptureProps {
  onCapture: (base64: string | null) => void;
  label?: string;
  compact?: boolean;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, label = "Capture Proof Photo", compact = false }) => {
  const [captured, setCaptured] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const takePhoto = async () => {
    try {
      setError(null);
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera, // ABSOLUTE ENFORCEMENT: Only allow live camera capture
        promptLabelHeader: "Live Proof Capture",
        promptLabelPhoto: "Take a Photo Now",
        promptLabelCancel: "Cancel"
      });

      if (image.base64String) {
        const base64Data = `data:image/jpeg;base64,${image.base64String}`;
        setCaptured(base64Data);
        onCapture(base64Data);
      }
    } catch (err: any) {
      if (err.message !== "User cancelled photos app") {
        console.error("Camera error:", err);
        setError("Could not access camera. Please check permissions.");
      }
    }
  };

  const reset = () => {
    setCaptured(null);
    onCapture(null);
    takePhoto();
  };

  const previewClass = compact ? "h-28 sm:h-32" : "aspect-video min-h-[200px]";

  return (
    <div className="space-y-1.5">
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>

      {!captured && (
        <button
          type="button"
          onClick={takePhoto}
          className={`w-full ${compact ? 'h-16' : 'h-32'} border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-400 transition-all bg-slate-50 relative overflow-hidden`}
        >
          {error ? (
            <div className="text-red-500 flex flex-col items-center p-4">
              <AlertCircle className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-bold uppercase text-center">{error}</span>
            </div>
          ) : (
            <>
              <CameraIcon className={`${compact ? 'w-4 h-4' : 'w-8 h-8'} mb-1`} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Open Camera</span>
            </>
          )}
        </button>
      )}

      {captured && (
        <div className={`relative rounded-xl overflow-hidden shadow-sm border-2 border-green-500 animate-in zoom-in-95 ${previewClass}`}>
          <img src={captured} alt="Captured proof" className="w-full h-full object-cover" />
          <div className="absolute top-1 right-1 flex space-x-1">
            <button
              type="button"
              onClick={reset}
              className="bg-white/90 text-slate-800 p-1 rounded-lg hover:bg-white transition-colors shadow-sm"
              title="Retake"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          <div className="absolute bottom-1 left-1 bg-green-500 text-white px-1 py-0.5 rounded text-[7px] font-bold flex items-center">
            <Check className="w-2 h-2 mr-1" /> PHOTO CAPTURED
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
