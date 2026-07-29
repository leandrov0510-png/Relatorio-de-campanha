import React from 'react';
import {
  Upload,
  Cloud,
  Lock,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { CampaignUser } from '../types';

interface PublicHeroProps {
  users: CampaignUser[];
  onOpenRegister: () => void;
  onOpenAdminLogin: () => void;
}

export const PublicHero: React.FC<PublicHeroProps> = ({
  users,
  onOpenRegister,
  onOpenAdminLogin,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-12 space-y-8">
      {/* Main Public Options Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/15 text-white p-8 sm:p-12 lg:p-16 shadow-2xl text-center">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-inner">
            <Cloud className="w-4 h-4 text-emerald-400" /> Sistema de Cadastramento e Gestão Eleitoral
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Portal da <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-300">Campanha Eleitoral</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            Selecione uma das opções abaixo para realizar o seu cadastramento de equipe ou para acessar o painel de administração e aprovação.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Cadastramento Button */}
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto py-4 px-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-emerald-500/30 border border-emerald-300/40 flex items-center justify-center gap-3 transition-transform active:scale-98 cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              Cadastramento
            </button>

            {/* Login Administrativo Button */}
            <button
              onClick={onOpenAdminLogin}
              className="w-full sm:w-auto py-4 px-8 bg-white/10 hover:bg-white/20 text-white font-bold text-base rounded-2xl border border-white/20 backdrop-blur-md flex items-center justify-center gap-3 transition-all shadow-md cursor-pointer"
            >
              <Lock className="w-5 h-5 text-blue-400" />
              Login Administrativo
            </button>
          </div>

          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 text-left">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Segurança Total</h4>
                <p className="text-[11px] text-slate-300">Dados protegidos e encriptados</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <UserCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Aprovação Admin</h4>
                <p className="text-[11px] text-slate-300">Fichamento validado no painel</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Múltiplas Zonas</h4>
                <p className="text-[11px] text-slate-300">Organização por zona eleitoral</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

