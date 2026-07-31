import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, X, ArrowRight, Loader2 } from 'lucide-react';
import { fetchAdminPasswordFromSupabase } from '../utils/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validação estrita: busca a nova senha sincronizada na nuvem Supabase
      const currentPass = await fetchAdminPasswordFromSupabase();

      if (password.trim() === currentPass) {
        setError(null);
        setPassword('');
        setIsLoading(false);
        onLoginSuccess();
        onClose();
      } else {
        setIsLoading(false);
        setError('Senha incorreta. Apenas a nova senha alterada no sistema é aceita.');
      }
    } catch (err) {
      console.error('Erro ao verificar senha:', err);
      setIsLoading(false);
      setError('Erro ao validar credenciais. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/15 text-slate-100">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-md text-white p-6 relative border-b border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-2xl flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Login Administrativo</h3>
          <p className="text-xs text-slate-300 mt-1">
            Acesso reservado aos coordenadores e auditores de documentação da campanha.
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-slate-950/40">
          {error && (
            <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs p-3 rounded-xl flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Senha de Acesso do Administrador
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Digite a senha de administrador"
                className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/15 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-all font-mono"
                autoFocus
                disabled={isLoading}
                required
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 rounded-xl border border-white/15 bg-white/5 text-slate-300 font-medium text-sm hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 border border-blue-400/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Acessar Painel
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
