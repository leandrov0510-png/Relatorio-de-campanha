import React from 'react';
import { X, Download, FileText, ExternalLink, Image as ImageIcon, ShieldCheck } from 'lucide-react';
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
  if (!isOpen || !doc) return null;

  const isPdf = doc.fileType === 'pdf' || doc.dataUrl.startsWith('data:application/pdf');

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = doc.dataUrl;
    a.download = `${userName.replace(/\s+/g, '_')}_${doc.type}_${doc.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-white/15 flex flex-col max-h-[90vh] text-slate-100">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-md text-white px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-400/30">
              {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                Documento {doc.type} &bull; {userName}
              </h3>
              <p className="text-xs text-slate-300">
                Arquivo: {doc.name} &bull; Enviado em {new Date(doc.uploadedAt).toLocaleString('pt-BR')}
              </p>
              <p className="text-[11px] text-teal-300 font-semibold mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                Permite visualizar fotos/imagens e pdf diretamente na tela
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-blue-400/30 shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Baixar Arquivo
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="p-4 sm:p-6 bg-slate-950/60 flex-1 overflow-auto flex flex-col items-center justify-center min-h-[350px]">
          {isPdf ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-slate-200 shadow-2xl">
              <iframe
                src={doc.dataUrl}
                title={doc.name}
                className="w-full h-[55vh] rounded-xl border border-white/15 bg-white/10"
              />
              <div className="flex flex-col sm:flex-row items-center justify-between w-full px-2 pt-3 gap-2">
                <span className="text-teal-300 font-bold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  Permite visualizar fotos/imagens e pdf diretamente na tela
                </span>
                <button
                  onClick={handleDownload}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow border border-blue-400/30 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar Documento PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center w-full h-full min-h-[320px]">
              <img
                src={doc.dataUrl}
                alt={doc.name}
                className="max-w-full max-h-[60vh] object-contain rounded-xl border border-white/15 shadow-2xl bg-black/60 backdrop-blur-sm"
              />
              <span className="mt-3 text-xs text-teal-300 font-bold flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-teal-500/30">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Permite visualizar fotos/imagens e pdf diretamente na tela
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white/5 backdrop-blur-md px-6 py-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Documento Autenticado e Criptografado no Banco de Dados
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
