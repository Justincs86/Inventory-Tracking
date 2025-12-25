
import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, Trash2 } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string | null) => void;
  label?: string;
  compact?: boolean;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, label = "Capture Proof Photo", compact = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setIsActive(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL('image/jpeg', 0.8);
      setCaptured(data);
      onCapture(data);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
  };

  const reset = () => {
    setCaptured(null);
    onCapture(null);
    startCamera();
  };

  // Even smaller heights for compact mode
  const previewClass = compact ? "h-28 sm:h-32" : "aspect-video min-h-[200px]";

  return (
    <div className="space-y-1.5">
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      
      {!isActive && !captured && (
        <button 
          type="button"
          onClick={startCamera}
          className={`w-full ${compact ? 'h-16' : 'h-32'} border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-400 transition-all bg-slate-50`}
        >
          <Camera className={`${compact ? 'w-4 h-4' : 'w-8 h-8'} mb-1`} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Open Camera</span>
        </button>
      )}

      {isActive && !captured && (
        <div className={`relative rounded-xl overflow-hidden bg-black group ${previewClass}`}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1.5 left-0 right-0 flex justify-center space-x-2">
            <button 
              type="button"
              onClick={capturePhoto}
              className="bg-white text-blue-600 p-2 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={stopCamera}
              className="bg-red-500 text-white p-2 rounded-full shadow-xl hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
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
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
