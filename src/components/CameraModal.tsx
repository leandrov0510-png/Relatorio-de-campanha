import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, Upload, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { compressImageDataUrl } from '../utils/imageCompressor';

interface CameraModalProps {
  isOpen: boolean;
  docTitle: string;
  onClose: () => void;
  onCapture: (fileData: { name: string; dataUrl: string; fileType: 'image' | 'pdf' }) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  docTitle,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [capturedFileName, setCapturedFileName] = useState<string>('');

  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !previewImage) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, previewImage]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Câmera indisponível ou permissão negada. Por favor, use a opção de "Upload da Galeria / PDF".');
      setActiveTab('upload');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPreviewImage(dataUrl);
        const now = new Date();
        const timeStr = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
        setCapturedFileName(`Foto_${docTitle.replace(/\s+/g, '_')}_${timeStr}.jpg`);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setPreviewImage(null);
    startCamera();
  };

  const handleConfirmCaptured = async () => {
    if (previewImage) {
      const compressed = await compressImageDataUrl(previewImage, 800, 800, 0.65);
      onCapture({
        name: capturedFileName || `${docTitle}_Anexo.jpg`,
        dataUrl: compressed,
        fileType: 'image',
      });
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const reader = new FileReader();

    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (result) {
        let finalDataUrl = result;
        if (!isPdf && result.startsWith('data:image/')) {
          finalDataUrl = await compressImageDataUrl(result, 800, 800, 0.65);
        }
        onCapture({
          name: file.name,
          dataUrl: finalDataUrl,
          fileType: isPdf ? 'pdf' : 'image',
        });
        onClose();
      }
    };

    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/15 flex flex-col max-h-[90vh] text-slate-100">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-md text-white px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-400" />
              Anexar {docTitle}
            </h3>
            <p className="text-xs text-slate-300">
              Fotografe o documento com boa iluminação ou selecione um arquivo.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switchers */}
        <div className="flex border-b border-white/10 bg-white/5 p-1 backdrop-blur-md">
          <button
            onClick={() => {
              setPreviewImage(null);
              setActiveTab('camera');
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-blue-600 text-white shadow-md border border-blue-400/30 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            Tirar Foto
          </button>
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('upload');
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow-md border border-blue-400/30 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            Galeria / PDF
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-y-auto flex flex-col items-center justify-center bg-slate-950/40 min-h-[280px]">
          {activeTab === 'camera' ? (
            previewImage ? (
              <div className="w-full flex flex-col items-center gap-4">
                <div className="relative w-full max-h-[320px] rounded-xl overflow-hidden border-2 border-emerald-400/50 shadow-xl bg-black">
                  <img
                    src={previewImage}
                    alt="Document Preview"
                    className="w-full h-full object-contain max-h-[320px]"
                  />
                  <span className="absolute top-2 left-2 bg-emerald-500/80 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md font-medium shadow flex items-center gap-1 border border-emerald-300/30">
                    <Check className="w-3.5 h-3.5" /> Foto Capturada
                  </span>
                </div>
                <div className="flex items-center gap-3 w-full">
                  <button
                    onClick={handleRetake}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Tirar Outra
                  </button>
                  <button
                    onClick={handleConfirmCaptured}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 border border-emerald-300/40 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Confirmar Anexo
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-4">
                {cameraError ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center text-amber-300 text-sm flex flex-col items-center gap-2 backdrop-blur-md">
                    <AlertCircle className="w-6 h-6 text-amber-400" />
                    <p>{cameraError}</p>
                  </div>
                ) : (
                  <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center shadow-inner border border-white/10">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Framing Guide Lines */}
                    <div className="absolute inset-4 border-2 border-dashed border-white/60 rounded-lg pointer-events-none flex items-center justify-center">
                      <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                        Enquadre o {docTitle} aqui
                      </span>
                    </div>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />

                {!cameraError && (
                  <button
                    onClick={takePicture}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 border border-blue-400/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    Capturar Foto Agora
                  </button>
                )}
              </div>
            )
          ) : (
            <div className="w-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-blue-400/30 rounded-2xl bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
              <div className="w-16 h-16 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full flex items-center justify-center mb-3">
                <Upload className="w-8 h-8" />
              </div>
              <h4 className="font-semibold text-white text-base mb-1">
                Selecione da Galeria ou Anexe um PDF
              </h4>
              <p className="text-xs text-slate-400 mb-5 max-w-xs">
                Formatos suportados: PNG, JPG, JPEG ou arquivo PDF (máx. 10MB).
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-sm border border-blue-400/30 transition-all cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                  Galeria / Imagem
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  Documento PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
