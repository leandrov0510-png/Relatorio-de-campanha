import React from 'react';
import { Shield, Upload, Lock, Cloud, CloudOff, Share2 } from 'lucide-react';
import { CloudSyncState } from '../types';

interface NavbarProps {
  isAdminLoggedIn: boolean;
  syncState: CloudSyncState;
  onOpenRegister: () => void;
  onOpenAdminLogin: () => void;
  onOpenAdminPanel: () => void;
  onOpenShareModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdminLoggedIn,
  syncState,
  onOpenRegister,
  onOpenAdminLogin,
  onOpenAdminPanel,
  onOpenShareModal,
}) => {
  return (
    <header className="bg-slate-900/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-500/25 border border-white/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              Campanha Doc <span className="text-blue-400 font-extrabold">| Nuvem Eleitoral</span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Organização por Categoria, Zona Eleitoral e Backup Excel
            </p>
          </div>
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-2.5">
          {/* Sync Badge - Sempre Online */}
          <div
            className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border-emerald-500/30 text-emerald-300 backdrop-blur-md rounded-full text-xs font-semibold border shadow-xs"
            title="Sincronização em Nuvem Conectada e Ativa"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nuvem Conectada</span>
          </div>

          {/* Share Link Button */}
          {onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-emerald-300 font-semibold text-xs sm:text-sm rounded-xl border border-emerald-500/30 flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer"
              title="Compartilhar Link Público do Celular"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>
          )}

          {/* Primary CTA button "Cadastramento" */}
          <button
            onClick={onOpenRegister}
            className="py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/25 border border-emerald-400/30 flex items-center gap-2 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Cadastramento</span>
          </button>

          {/* Admin Area button */}
          {isAdminLoggedIn ? (
            <button
              onClick={onOpenAdminPanel}
              className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 flex items-center gap-2 backdrop-blur-md shadow-md transition-all cursor-pointer"
            >
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Painel Admin</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="py-2.5 px-3.5 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/15 backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4 text-slate-300" />
              <span>Login Administrativo</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
