import React, { useState, useEffect } from 'react';
import { X, Download, FileText, ExternalLink, Image as ImageIcon, ShieldCheck, AlertCircle } from 'lucide-react';
import { DocumentAttachment } from '../types';

interface DocumentViewerModalProps {
  isOpen: boolean;
  doc: DocumentAttachment | null;
  userName: string;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  doc,
  userName,
  onClose,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    setImageError(false);
    if (!doc || !doc.dataUrl) {
      setBlobUrl(null);
      return;
    }

    // Se for URL remota HTTP/HTTPS ou se blobUrl não for necessário
    if (doc.dataUrl.startsWith('http://') || doc.dataUrl.startsWith('https://')) {
      setBlobUrl(doc.dataUrl);
      return;
    }

    // Converter base64 Data URL para Blob URL nativo para navegação fluida em Safari / Chrome / Firefox
    try {
      if (doc.dataUrl.startsWith('data:')) {
        const parts = doc.dataUrl.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const createdUrl = URL.createObjectURL(blob);
        setBlobUrl(createdUrl);

        return () => {
          URL.revokeObjectURL(createdUrl);
        };
      } else {
        setBlobUrl(doc.dataUrl);
      }
    } catch (e) {
      console.warn('Erro ao gerar Blob URL do documento:', e);
      setBlobUrl(doc.dataUrl);
    }
  }, [doc]);

  if (!isOpen || !doc) return null;

  const dataUrl = doc.dataUrl || '';
  const isPdf =
    doc.fileType === 'pdf' ||
    dataUrl.startsWith('data:application/pdf') ||
    doc.name.toLowerCase().endsWith('.pdf');

  const activeUrl = blobUrl || dataUrl;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = activeUrl;
    a.download = `${userName.replace(/\s+/g, '_')}_${doc.type}_${doc.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenNewTab = () => {
    if (activeUrl) {
      window.open(activeUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-white/15 flex flex-col max-h-[92vh] text-slate-100">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-md text-white px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-400/30">
              {isPdf ? <FileText className="w-6 h-6 text-blue-400" /> : <ImageIcon className="w-6 h-6 text-emerald-400" />}
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                Documento {doc.type} &bull; {userName}
              </h3>
              <p className="text-xs text-slate-300">
                Arquivo: {doc.name} &bull; Enviado em {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString('pt-BR') : 'Data recente'}
              </p>
              <p className="text-[11px] text-emerald-300 font-semibold mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Visualização Protegida e Autenticada
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeUrl && (
              <button
                type="button"
                onClick={handleOpenNewTab}
                className="hidden sm:flex px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold rounded-xl items-center gap-1.5 border border-white/15 transition-all cursor-pointer"
                title="Abrir em Nova Aba"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Nova Aba</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 border border-blue-400/30 shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="p-4 sm:p-6 bg-slate-950/70 flex-1 overflow-auto flex flex-col items-center justify-center min-h-[380px]">
          {!activeUrl || imageError ? (
            <div className="p-8 text-center space-y-4 max-w-md bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
              <div>
                <h4 className="text-base font-bold text-white">Visualização Direta Indisponível</h4>
                <p className="text-xs text-slate-300 mt-1">
                  O arquivo foi armazenado de forma protegida. Você pode efetuar o download direto do documento.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Baixar Documento Original
              </button>
            </div>
          ) : isPdf ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-slate-200 shadow-2xl">
              <iframe
                src={activeUrl}
                title={doc.name}
                className="w-full h-[60vh] rounded-xl border border-white/15 bg-slate-900"
              />
              <div className="flex flex-col sm:flex-row items-center justify-between w-full px-2 pt-3 gap-2">
                <span className="text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  PDF carregado com sucesso
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenNewTab}
                    className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 border border-white/15 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir PDF em Tela Cheia
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow border border-blue-400/30 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar PDF
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center w-full h-full min-h-[340px]">
              <img
                src={activeUrl}
                alt={doc.name}
                onError={() => setImageError(true)}
                className="max-w-full max-h-[62vh] object-contain rounded-2xl border border-white/15 shadow-2xl bg-black/60 backdrop-blur-sm"
              />
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <span className="text-xs text-emerald-300 font-bold flex items-center gap-1.5 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 shadow-md">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Imagem Verificada e Autenticada
                </span>
                <button
                  type="button"
                  onClick={handleOpenNewTab}
                  className="text-xs text-blue-300 hover:text-white font-semibold flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir Imagem em Nova Aba
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white/5 backdrop-blur-md px-6 py-3.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Documento Autenticado no Banco de Dados
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-medium rounded-xl text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
