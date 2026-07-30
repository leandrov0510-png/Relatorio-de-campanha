import React from 'react';
import {
  Upload,
  Cloud,
  Lock,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Users,
  Smartphone,
  Globe,
  UserPlus
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
  const pendingCount = users.filter((u) => u.status === 'PENDENTE').length;

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-10 space-y-6">
      {/* Main Public Options Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/15 text-white p-6 sm:p-12 lg:p-14 shadow-2xl text-center">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-inner flex-wrap justify-center">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Acesso Celular & Computador</span>
            <span>&bull;</span>
            <span className="text-blue-300">{users.length} Cadastros Registrados</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Portal da <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-300">Campanha Eleitoral</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl mx-auto">
            Qualquer integrante, voluntário ou liderança pode realizar o seu próprio cadastro ou cadastrar outros membros da equipe diretamente de qualquer aparelho celular.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg mx-auto">
            {/* Cadastrar a mim mesmo / Cadastrar terceiros */}
            <button
              onClick={onOpenRegister}
              className="w-full py-4 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 border border-emerald-300/40 flex items-center justify-center gap-2.5 transition-transform active:scale-98 cursor-pointer"
            >
              <UserPlus className="w-5 h-5" />
              <span>Realizar Cadastramento</span>
            </button>

            {/* Login Administrativo Button */}
            <button
              onClick={onOpenAdminLogin}
              className="w-full py-4 px-5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/20 backdrop-blur-md flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <Lock className="w-5 h-5 text-blue-400" />
              <span>Painel Administrativo</span>
            </button>
          </div>

          {/* Feature Badges */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/10 text-left">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <Users className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Cadastre Outras Pessoas</h4>
                <p className="text-[11px] text-slate-300">Lideranças podem registrar equipes inteiras</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <Globe className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Rastreamento por IP</h4>
                <p className="text-[11px] text-slate-300">Gravação do IP do dispositivo de origem</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <UserCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Atualização em Tempo Real</h4>
                <p className="text-[11px] text-slate-300">Admin recebe todos os cadastros instantaneamente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

