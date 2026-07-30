import React, { useState } from 'react';
import { X, Copy, Check, Share2, Smartphone, Globe, QrCode } from 'lucide-react';

interface SharePublicLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SharePublicLinkModal: React.FC<SharePublicLinkModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Acesse o Link de Cadastramento da Campanha Eleitoral para realizar seu cadastro ou cadastrar sua equipe: ${currentUrl}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/15 text-slate-100 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-400/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Compartilhar Link Público</h3>
              <p className="text-xs text-slate-400">Livre para qualquer aparelho cadastrar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            Envie este link para coordenadores, voluntários e apoiadores. Qualquer pessoa pode abrir no celular sem precisar de senha e realizar o cadastro.
          </p>

          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Link de Acesso Direto:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full bg-slate-950 border border-white/15 text-xs text-emerald-300 px-3 py-2 rounded-xl font-mono focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                    : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/40'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="pt-1">
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg border border-emerald-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Enviar pelo WhatsApp
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 text-center">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
