import React, { useState, useEffect } from 'react';
import { CampaignUser, CloudSyncState } from './types';
import { getUsers, fetchUsersFromSupabase, getSyncState, registerDeletedUserId } from './utils/storage';
import { supabase, isSupabaseConfigured } from './utils/supabaseClient';
import { Navbar } from './components/Navbar';
import { PublicHero } from './components/PublicHero';
import { RegistrationFormModal } from './components/RegistrationFormModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { SharePublicLinkModal } from './components/SharePublicLinkModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { DocumentAttachment } from './types';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const [users, setUsers] = useState<CampaignUser[]>([]);
  const [syncState, setSyncState] = useState<CloudSyncState>(getSyncState());

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Document Viewer Modal State (Abocado via Hiperlink do Excel)
  const [viewerDoc, setViewerDoc] = useState<DocumentAttachment | null>(null);
  const [viewerUserName, setViewerUserName] = useState<string>('');

  const reloadData = () => {
    setUsers(getUsers());
    setSyncState(getSyncState());

    fetchUsersFromSupabase().then((remoteUsers) => {
      setUsers(remoteUsers);
      setSyncState(getSyncState());
    });
  };

  useEffect(() => {
    reloadData();

    // Checar se a página foi aberta por um Hiperlink de documento vindo da planilha Excel
    const urlParams = new URLSearchParams(window.location.search);
    const targetUserId = urlParams.get('userId');
    const targetDocType = urlParams.get('doc');

    if (targetUserId && targetDocType) {
      fetchUsersFromSupabase().then((allUsers) => {
        const user = allUsers.find((u) => u.id === targetUserId);
        if (user && user.documents) {
          const docMap: Record<string, DocumentAttachment | undefined> = {
            RG: user.documents.rg,
            TITULO: user.documents.titulo,
            CNH: user.documents.cnh,
            DOC_VEICULAR: user.documents.docVeicular,
            COMPROVANTE_ENDERECO: user.documents.comprovanteEndereco,
          };
          const doc = docMap[targetDocType];
          if (doc) {
            setViewerDoc(doc);
            setViewerUserName(user.fullName);
          }
        }
      });
    }

    const handleDataChanged = () => {
      reloadData();
    };

    window.addEventListener('storage', handleDataChanged);
    window.addEventListener('campaign_data_changed', handleDataChanged);
    window.addEventListener('focus', handleDataChanged);
    window.addEventListener('online', handleDataChanged);

    // Polling de backup a cada 10s para garantir sincronização mesmo se a conexão IP mudar ou o WebSocket cair
    const backupInterval = setInterval(() => {
      reloadData();
    }, 10000);

    let realtimeChannel: any = null;
    if (isSupabaseConfigured) {
      realtimeChannel = supabase
        .channel('app_global_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'campaign_users' },
          (payload: any) => {
            if (payload.eventType === 'DELETE' && payload.old?.id) {
              registerDeletedUserId(payload.old.id);
            }
            reloadData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'audit_logs' },
          () => {
            reloadData();
          }
        )
        .on(
          'broadcast',
          { event: 'update' },
          () => {
            reloadData();
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener('storage', handleDataChanged);
      window.removeEventListener('campaign_data_changed', handleDataChanged);
      window.removeEventListener('focus', handleDataChanged);
      window.removeEventListener('online', handleDataChanged);
      clearInterval(backupInterval);
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, []);

  const handleRegistrationSuccess = (newUser: CampaignUser) => {
    reloadData();
    setToastMessage(`Cadastro de ${newUser.fullName} (${newUser.role}) concluído e sincronizado com sucesso!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col relative overflow-x-hidden selection:bg-blue-500 selection:text-white">
      {/* Ambient Frosted Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[130px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-[130px]" />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900/90 backdrop-blur-xl text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in slide-in-from-top duration-300 max-w-md">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div className="text-xs font-semibold">{toastMessage}</div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors ml-auto cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main App Navigation Header */}
      {currentView === 'public' && (
        <div className="relative z-10">
          <Navbar
            isAdminLoggedIn={isAdminLoggedIn}
            syncState={syncState}
            onOpenRegister={() => setIsRegisterModalOpen(true)}
            onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
            onOpenAdminPanel={() => setCurrentView('admin')}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />
        </div>
      )}

      {/* Main View Router */}
      <div className="relative z-10 flex-1 flex flex-col">
        {currentView === 'public' ? (
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
            <PublicHero
              users={users}
              onOpenRegister={() => setIsRegisterModalOpen(true)}
              onOpenAdminLogin={() => {
                if (isAdminLoggedIn) {
                  setCurrentView('admin');
                } else {
                  setIsAdminLoginModalOpen(true);
                }
              }}
            />
          </main>
        ) : (
          <AdminPanel
            onLogout={() => {
              setIsAdminLoggedIn(false);
              setCurrentView('public');
            }}
            onOpenRegisterForm={() => setIsRegisterModalOpen(true)}
          />
        )}
      </div>

      {/* Footer in Public View */}
      {currentView === 'public' && (
        <footer className="relative z-10 bg-slate-900/40 backdrop-blur-xl border-t border-white/10 mt-auto py-8 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-medium text-slate-300">
              Sistema de Gerenciamento de Documentos de Campanha Eleitoral &copy; {new Date().getFullYear()}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-slate-400 text-xs">
              <span>Zonas: 176, 185, 276, 278, 393, 395</span>
              <span>|</span>
              <span>Sincronização em Nuvem</span>
              <span>|</span>
              <button
                onClick={() => setIsAdminLoginModalOpen(true)}
                className="text-slate-400 hover:text-slate-200 underline font-medium transition-colors cursor-pointer"
              >
                Área do Administrador (Acesso Restrito)
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Registration Form Modal */}
      <RegistrationFormModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={handleRegistrationSuccess}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          setCurrentView('admin');
        }}
      />

      {/* Share Link Modal */}
      <SharePublicLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Document Viewer Modal (Disparado quando acessado por Hiperlink do Excel) */}
      <DocumentViewerModal
        isOpen={Boolean(viewerDoc)}
        doc={viewerDoc}
        userName={viewerUserName}
        onClose={() => {
          setViewerDoc(null);
          setViewerUserName('');
          // Limpa os parâmetros de URL para visualização limpa
          if (window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }}
      />
    </div>
  );
}
