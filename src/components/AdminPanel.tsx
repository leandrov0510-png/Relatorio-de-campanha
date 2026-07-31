import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  FileSpreadsheet,
  Shield,
  KeyRound,
  History,
  Vote,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  RefreshCw,
  Lock,
  Download,
  Sliders,
  LogOut,
  UserCheck,
  Check,
  Building2,
  FileText,
  Car,
  ChevronRight,
  Database,
  Upload,
  UserX,
  MessageCircle,
  Info,
  MapPin,
  Copy,
  PhoneCall
} from 'lucide-react';
import { CampaignUser, AuditLog, SystemPermissions, ElectoralZone, CampaignRole, DocumentAttachment } from '../types';
import {
  getUsers,
  fetchUsersFromSupabase,
  deleteUser,
  saveUser,
  getLogs,
  clearLogs,
  addAuditLog,
  setAdminPassword,
  getPermissions,
  savePermissions,
  getSyncState,
  saveSyncState,
} from '../utils/storage';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { exportUsersToExcel } from '../utils/excel';
import { DocumentViewerModal } from './DocumentViewerModal';

interface AdminPanelProps {
  onLogout: () => void;
  onOpenRegisterForm: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onOpenRegisterForm }) => {
  const [activeTab, setActiveTab] = useState<
    'users' | 'coordinator_search' | 'general_info' | 'search' | 'zones' | 'permissions' | 'logs' | 'backup' | 'password'
  >('users');

  const [users, setUsers] = useState<CampaignUser[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [permissions, setPermissions] = useState<SystemPermissions[]>([]);
  const [syncState, setSyncState] = useState(getSyncState());

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('TODAS');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('TODOS');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('TODOS');
  const [selectedCoordinatorFilter, setSelectedCoordinatorFilter] = useState<string>('TODOS');
  const [selectedOriginFilter, setSelectedOriginFilter] = useState<string>('TODOS');

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Helper for direct WhatsApp messaging
  const getWhatsAppUrl = (whatsapp: string, fullName: string) => {
    const digits = whatsapp.replace(/\D/g, '');
    const phone = digits.length <= 11 ? `55${digits}` : digits;
    const message = `Olá ${fullName}, entramos em contato referente ao seu cadastro na Campanha Eleitoral.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  // Viewing document modal
  const [viewingDoc, setViewingDoc] = useState<{ doc: DocumentAttachment; userName: string } | null>(null);

  // Password Change state
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Admin Notification Toast
  const [adminToastMessage, setAdminToastMessage] = useState<string | null>(null);

  // Reload data
  const refreshData = useCallback(() => {
    setUsers(getUsers());
    setLogs(getLogs());
    setPermissions(getPermissions());
    setSyncState(getSyncState());

    fetchUsersFromSupabase().then((remoteUsers) => {
      setUsers(remoteUsers);
      setSyncState(getSyncState());
    });
  }, []);

  useEffect(() => {
    refreshData();

    const handleDataChanged = () => {
      refreshData();
    };

    window.addEventListener('storage', handleDataChanged);
    window.addEventListener('campaign_data_changed', handleDataChanged);
    window.addEventListener('focus', handleDataChanged);

    let realtimeChannel: any = null;
    if (isSupabaseConfigured) {
      realtimeChannel = supabase
        .channel('admin_panel_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'campaign_users' },
          () => {
            refreshData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'audit_logs' },
          () => {
            refreshData();
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener('storage', handleDataChanged);
      window.removeEventListener('campaign_data_changed', handleDataChanged);
      window.removeEventListener('focus', handleDataChanged);
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [refreshData]);

  // Unique list of coordinators registered or referenced in the system
  const uniqueCoordinators = Array.from(
    new Set([
      ...users.filter((u) => u.role === 'Coordenador').map((u) => u.fullName.trim()),
      ...users
        .map((u) => u.coordinatorName?.trim())
        .filter((name): name is string => Boolean(name && name.length > 0)),
    ])
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  // Filtered users calculation
  const filteredUsers = users.filter((u) => {
    const matchesName =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.pixKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.whatsapp.includes(searchTerm) ||
      (u.coordinatorName && u.coordinatorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.registeredBy && u.registeredBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.ipAddress && u.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesZone = selectedZoneFilter === 'TODAS' || u.electoralZone === selectedZoneFilter;
    const matchesRole = selectedRoleFilter === 'TODOS' || u.role === selectedRoleFilter;
    const matchesStatus =
      selectedStatusFilter === 'TODOS' ||
      (selectedStatusFilter === 'APROVADO' && (u.status === 'APROVADO' || u.status === 'VERIFICADO')) ||
      (selectedStatusFilter === 'REPROVADO' && (u.status === 'REPROVADO' || u.status === 'REJEITADO')) ||
      (selectedStatusFilter === 'PENDENTE' && u.status === 'PENDENTE') ||
      u.status === selectedStatusFilter;

    const matchesCoordinator =
      selectedCoordinatorFilter === 'TODOS' ||
      (u.coordinatorName && u.coordinatorName.toLowerCase().trim() === selectedCoordinatorFilter.toLowerCase().trim()) ||
      (u.role === 'Coordenador' && u.fullName.toLowerCase().trim() === selectedCoordinatorFilter.toLowerCase().trim());

    const matchesOrigin =
      selectedOriginFilter === 'TODOS' ||
      (selectedOriginFilter === 'PROPRIO' && (u.registrationType === 'PROPRIO' || !u.registrationType || u.registeredBy === 'Próprio')) ||
      (selectedOriginFilter === 'TERCEIROS' && (u.registrationType === 'TERCEIROS' || (u.registeredBy && u.registeredBy !== 'Próprio')));

    return matchesName && matchesZone && matchesRole && matchesStatus && matchesCoordinator && matchesOrigin;
  })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
      if (timeA !== timeB) return timeB - timeA;
      return b.id.localeCompare(a.id);
    });

  // Handle User Approval
  const handleApproveUser = (user: CampaignUser) => {
    const updated = { ...user, status: 'APROVADO' as const, updatedAt: new Date().toISOString() };
    saveUser(updated);
    addAuditLog({
      actor: 'Administrador',
      action: 'Aprovação de Cadastro',
      details: `O cadastro do integrante "${user.fullName}" (${user.role}, Zona ${user.electoralZone}) foi APROVADO pelo administrador.`,
      category: 'CADASTRO',
    });
    setAdminToastMessage(`Cadastro de "${user.fullName}" APROVADO com sucesso!`);
    setTimeout(() => setAdminToastMessage(null), 5000);
    refreshData();
  };

  // Handle User Rejection
  const handleRejectUser = (user: CampaignUser) => {
    const reason = prompt(
      `Informe o motivo da REPROVAÇÃO do cadastro de "${user.fullName}" (opcional):`,
      'Documentação pendente ou inconsistente'
    );
    if (reason === null) return;

    const updated = { ...user, status: 'REPROVADO' as const, updatedAt: new Date().toISOString() };
    saveUser(updated);
    addAuditLog({
      actor: 'Administrador',
      action: 'Reprovação de Cadastro',
      details: `O cadastro do integrante "${user.fullName}" (${user.role}) foi REPROVADO pelo administrador. Motivo: ${reason}`,
      category: 'CADASTRO',
    });
    setAdminToastMessage(`Cadastro de "${user.fullName}" foi REPROVADO pelo administrador.`);
    setTimeout(() => setAdminToastMessage(null), 5000);
    refreshData();
  };

  // Handle Excel Backup
  const handleExportExcel = () => {
    exportUsersToExcel(users, logs);
    addAuditLog({
      actor: 'Administrador',
      action: 'Exportação de Backup Excel',
      details: `Planilha Excel (.xlsx) gerada contendo ${users.length} usuários e ${logs.length} logs.`,
      category: 'BACKUP',
    });
    refreshData();
  };

  // Handle Manual Cloud Sync
  const handleTriggerCloudSync = () => {
    setSyncState((prev) => ({ ...prev, syncing: true }));
    setTimeout(() => {
      const updatedUsers = users.map((u) => ({ ...u, syncedToCloud: true }));
      localStorage.setItem('campanha_doc_users_v1', JSON.stringify(updatedUsers));
      const newState = {
        isOnline: true,
        lastSyncedAt: new Date().toISOString(),
        pendingCount: 0,
        syncing: false,
      };
      saveSyncState(newState);
      setUsers(updatedUsers);
      setSyncState(newState);
      addAuditLog({
        actor: 'Administrador',
        action: 'Sincronização Manual Forçada',
        details: 'Todos os cadastros locais foram sincronizados com o servidor em nuvem.',
        category: 'SISTEMA',
      });
      refreshData();
    }, 1200);
  };

  // Handle User Status Toggle
  const handleToggleStatus = (user: CampaignUser) => {
    const nextStatus = user.status === 'VERIFICADO' ? 'PENDENTE' : 'VERIFICADO';
    const updated = { ...user, status: nextStatus as any, updatedAt: new Date().toISOString() };
    saveUser(updated);
    addAuditLog({
      actor: 'Administrador',
      action: 'Alteração de Status do Usuário',
      details: `Status de "${user.fullName}" alterado para ${nextStatus}.`,
      category: 'CADASTRO',
    });
    refreshData();
  };

  // Handle User Deletion
  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Tem certeza de que deseja excluir o cadastro de "${userName}"? Esta ação é irreversível.`)) {
      deleteUser(userId);
      refreshData();
    }
  };

  // Handle Password Change Form
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    const actualPass = localStorage.getItem('campanha_admin_pass_v1') || 'admin123';
    if (currentPassInput !== actualPass) {
      setPassMsg({ text: 'A senha atual informada está incorreta.', type: 'error' });
      return;
    }

    if (newPassInput.length < 6) {
      setPassMsg({ text: 'A nova senha deve ter pelo menos 6 caracteres.', type: 'error' });
      return;
    }

    if (newPassInput !== confirmPassInput) {
      setPassMsg({ text: 'A confirmação da nova senha não confere.', type: 'error' });
      return;
    }

    setAdminPassword(newPassInput);
    setPassMsg({ text: 'Senha alterada com sucesso!', type: 'success' });
    setCurrentPassInput('');
    setNewPassInput('');
    setConfirmPassInput('');
    refreshData();
  };

  // Electoral Zone statistics
  const ZONES: ElectoralZone[] = ['176', '185', '276', '278', '279', '393', '395'];
  const zoneCounts = ZONES.map((z) => ({
    zone: z,
    count: users.filter((u) => u.electoralZone === z).length,
    drivers: users.filter((u) => u.electoralZone === z && u.role === 'Motorista').length,
    coordinators: users.filter((u) => u.electoralZone === z && u.role === 'Coordenador').length,
  }));

  return (
    <div className="min-h-screen bg-slate-950/80 text-slate-100 flex flex-col font-sans relative">
      {/* Top Admin Navigation Header */}
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/25 border border-white/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Painel Administrativo &bull; Campanha Eleitoral
            </h1>
            <p className="text-xs text-slate-400">
              Controle de Documentos, Zonas Eleitorais e Sincronização em Nuvem
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-3">
          {/* Cloud Sync Status Badge */}
          <button
            onClick={handleTriggerCloudSync}
            disabled={syncState.syncing}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium flex items-center gap-2 text-slate-200 transition-all cursor-pointer"
            title="Clique para sincronizar com a nuvem"
          >
            <Cloud className={`w-4 h-4 ${syncState.syncing ? 'animate-spin text-blue-400' : 'text-emerald-400'}`} />
            <span>
              {syncState.syncing
                ? 'Sincronizando...'
                : syncState.pendingCount > 0
                ? `${syncState.pendingCount} pendente(s) de sync`
                : 'Sincronizado na Nuvem'}
            </span>
          </button>

          {/* Export Excel CTA */}
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 border border-emerald-400/30 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Backup em</span> Excel (.xlsx)
          </button>

          {/* New Register Button */}
          <button
            onClick={onOpenRegisterForm}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 border border-blue-400/30 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4" />
            Cadastrar Novo
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="Sair do Painel Admin"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Admin Toast Notification */}
      {adminToastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900/95 border border-emerald-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-top duration-300 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{adminToastMessage}</span>
          <button
            onClick={() => setAdminToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 ml-auto"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Sidebar Tabs + Content Panel */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Vertical Menu */}
        <aside className="w-full md:w-64 bg-slate-900/40 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/10 p-4 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
            Módulos Administrativos
          </div>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            Controle de Usuários
            <span className="ml-auto bg-black/40 px-2 py-0.5 rounded-full text-[10px] border border-white/10">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('coordinator_search')}
            className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'coordinator_search'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <UserCheck className="w-4 h-4 text-purple-400" />
            Pesquisa por Coordenador
            <span className="ml-auto bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full text-[10px] border border-purple-500/30 font-bold">
              {uniqueCoordinators.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('general_info')}
            className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'general_info'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <Info className="w-4 h-4 text-teal-400" />
            Informação Geral do Usuário
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <Search className="w-4 h-4" />
            Encontrar Usuário por Nome
          </button>

          <button
            onClick={() => setActiveTab('zones')}
            className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'zones'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <Vote className="w-4 h-4" />
            Zonas Eleitorais
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'permissions'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Permissões Avançadas
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <History className="w-4 h-4" />
            Histórico de Logs
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Backup de Segurança
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'password'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Alteração de Senha
          </button>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {/* TAB 1: CONTROLE DE USUÁRIOS */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Header & Filter Bar */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Controle de Usuários Cadastrados
                  </h2>
                  <p className="text-xs text-slate-400">
                    Gerencie metadados, verifique os anexos e monitore o status de documentação.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  {/* Refresh / Sync Cloud Button */}
                  <button
                    onClick={() => refreshData()}
                    className="py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Forçar sincronização com o banco de dados em nuvem Supabase"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sincronizar Nuvem</span>
                  </button>

                  {/* Search Bar */}
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por nome, Pix, IP..."
                      className="w-full pl-9 pr-3 py-2 bg-white/5 backdrop-blur-md border border-white/15 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-400"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>

                  {/* Filter Zone */}
                  <select
                    value={selectedZoneFilter}
                    onChange={(e) => setSelectedZoneFilter(e.target.value)}
                    className="bg-slate-900/90 border border-white/15 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="TODAS">Todas as Zonas</option>
                    {ZONES.map((z) => (
                      <option key={z} value={z}>
                        Zona {z}
                      </option>
                    ))}
                  </select>

                  {/* Filter Role */}
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="bg-slate-900/90 border border-white/15 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="TODOS">Todas as Funções</option>
                    <option value="Divulgador">Divulgador</option>
                    <option value="Coordenador">Coordenador</option>
                    <option value="Liderança">Liderança</option>
                    <option value="Motorista">Motorista</option>
                  </select>

                  {/* Filter Coordinator */}
                  <select
                    value={selectedCoordinatorFilter}
                    onChange={(e) => setSelectedCoordinatorFilter(e.target.value)}
                    className="bg-slate-900/90 border border-purple-500/30 text-purple-200 text-xs rounded-xl px-3 py-2 focus:outline-none font-medium"
                  >
                    <option value="TODOS">Todos os Coordenadores</option>
                    {uniqueCoordinators.map((c) => (
                      <option key={c} value={c}>
                        Coord: {c}
                      </option>
                    ))}
                  </select>

                  {/* Filter Origin (Próprio vs Terceiros) */}
                  <select
                    value={selectedOriginFilter}
                    onChange={(e) => setSelectedOriginFilter(e.target.value)}
                    className="bg-slate-900/90 border border-emerald-500/30 text-emerald-200 text-xs rounded-xl px-3 py-2 focus:outline-none font-semibold"
                  >
                    <option value="TODOS">Todas as Origens</option>
                    <option value="PROPRIO">Cadastros Próprios</option>
                    <option value="TERCEIROS">Por Terceiros / Indicado</option>
                  </select>

                  {/* Filter Status */}
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="bg-slate-900/90 border border-white/15 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none font-semibold"
                  >
                    <option value="TODOS">Todos os Status</option>
                    <option value="PENDENTE">Pendentes</option>
                    <option value="APROVADO">Aprovados</option>
                    <option value="REPROVADO">Reprovados</option>
                  </select>
                </div>
              </div>

              {/* Quick Status Summary Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedStatusFilter('TODOS');
                    setSelectedZoneFilter('TODAS');
                    setSelectedRoleFilter('TODOS');
                    setSelectedCoordinatorFilter('TODOS');
                    setSelectedOriginFilter('TODOS');
                    setSearchTerm('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    selectedStatusFilter === 'TODOS' && selectedOriginFilter === 'TODOS'
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
                      : 'bg-slate-900/80 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  Todos ({users.length})
                </button>

                <button
                  onClick={() => setSelectedOriginFilter('TERCEIROS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                    selectedOriginFilter === 'TERCEIROS'
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Por Terceiros ({users.filter((u) => u.registrationType === 'TERCEIROS' || (u.registeredBy && u.registeredBy !== 'Próprio')).length})
                </button>

                <button
                  onClick={() => setSelectedStatusFilter('PENDENTE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                    selectedStatusFilter === 'PENDENTE'
                      ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  Pendentes ({users.filter((u) => u.status === 'PENDENTE').length})
                </button>

                <button
                  onClick={() => setSelectedStatusFilter('APROVADO')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                    selectedStatusFilter === 'APROVADO'
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Aprovados ({users.filter((u) => u.status === 'APROVADO' || u.status === 'VERIFICADO').length})
                </button>

                {(selectedStatusFilter !== 'TODOS' ||
                  selectedZoneFilter !== 'TODAS' ||
                  selectedRoleFilter !== 'TODOS' ||
                  selectedCoordinatorFilter !== 'TODOS' ||
                  selectedOriginFilter !== 'TODOS' ||
                  searchTerm !== '') && (
                  <button
                    onClick={() => {
                      setSelectedStatusFilter('TODOS');
                      setSelectedZoneFilter('TODAS');
                      setSelectedRoleFilter('TODOS');
                      setSelectedCoordinatorFilter('TODOS');
                      setSelectedOriginFilter('TODOS');
                      setSearchTerm('');
                    }}
                    className="ml-auto px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/15 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>

              {/* Users Table */}
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-white/5 backdrop-blur-md text-slate-300 font-semibold uppercase tracking-wider border-b border-white/10">
                      <tr>
                        <th className="p-4">Integrante / Nome</th>
                        <th className="p-4">Função</th>
                        <th className="p-4">Zona Eleitoral</th>
                        <th className="p-4">Chave Pix / WhatsApp</th>
                        <th className="p-4">
                          <span>Documentos Anexados</span>
                          <span className="block text-[9px] text-teal-400 font-normal normal-case tracking-normal mt-0.5">
                            Permite visualizar fotos/imagens e pdf diretamente na tela
                          </span>
                        </th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">
                            Nenhum usuário encontrado para os filtros selecionados.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-white text-sm">{user.fullName}</div>
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">{user.address}</div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-1.5 py-0.5 rounded">{user.id}</span>
                                {user.registeredBy && user.registeredBy !== 'Próprio' ? (
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold" title="Cadastrado por Terceiro / Liderança">
                                    Cadastrado por: {user.registeredBy}
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-1.5 py-0.5 rounded font-medium" title="Próprio Cadastro">
                                    Cadastro Próprio
                                  </span>
                                )}
                                {user.ipAddress && (
                                  <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded font-mono" title="Endereço IP do Aparelho">
                                    IP: {user.ipAddress}
                                  </span>
                                )}
                                {user.coordinatorName && (
                                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-medium" title="Coordenador Responsável">
                                    Coord: {user.coordinatorName}
                                  </span>
                                )}
                                {user.deputadoEstadual && (
                                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-medium" title="Deputado Estadual">
                                    Dep: {user.deputadoEstadual}
                                  </span>
                                )}
                                {user.socialMedia && (
                                  <span className="text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/30 px-1.5 py-0.5 rounded font-medium" title="Rede Social">
                                    Rede: {user.socialMedia}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                  user.role === 'Motorista'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    : user.role === 'Coordenador'
                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                    : user.role === 'Liderança'
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                    : 'bg-white/10 text-slate-200 border-white/10'
                                }`}
                              >
                                {user.role === 'Motorista' && <Car className="w-3.5 h-3.5" />}
                                {user.role}
                              </span>
                            </td>

                            <td className="p-4">
                              <span className="inline-block bg-blue-500/10 text-blue-300 border border-blue-400/30 font-bold px-2.5 py-1 rounded-lg text-xs">
                                Zona {user.electoralZone}
                              </span>
                            </td>

                            <td className="p-4 space-y-1">
                              <div className="text-slate-200 font-mono text-[11px]">
                                <strong className="text-slate-400">Pix:</strong> {user.pixKey}
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-slate-300 font-mono text-[11px]">{user.whatsapp}</span>
                                <a
                                  href={getWhatsAppUrl(user.whatsapp, user.fullName)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-bold transition-all cursor-pointer shrink-0 shadow-sm"
                                  title="Enviar mensagem no WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3 text-emerald-400" />
                                  WhatsApp
                                </a>
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="flex flex-wrap gap-1.5">
                                {/* RG Button */}
                                {user.documents.rg ? (
                                  <button
                                    onClick={() =>
                                      setViewingDoc({ doc: user.documents.rg!, userName: user.fullName })
                                    }
                                    className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg text-[10px] font-bold hover:bg-emerald-500/30 transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                                    title="Visualizar documento RG"
                                  >
                                    <Eye className="w-3 h-3 text-emerald-400" />
                                    Visualizar RG
                                  </button>
                                ) : (
                                  <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded text-[10px]">
                                    RG Sem Doc
                                  </span>
                                )}

                                 {/* TITULO Button */}
                                {user.documents.titulo ? (
                                  <button
                                    onClick={() =>
                                      setViewingDoc({ doc: user.documents.titulo!, userName: user.fullName })
                                    }
                                    className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg text-[10px] font-bold hover:bg-emerald-500/30 transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                                    title="Visualizar documento Título de Eleitor"
                                  >
                                    <Eye className="w-3 h-3 text-emerald-400" />
                                    Visualizar Título
                                  </button>
                                ) : (
                                  <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded text-[10px]">
                                    Título Sem Doc
                                  </span>
                                )}

                                {/* CNH Button for Motorista */}
                                {user.role === 'Motorista' && (
                                  user.documents.cnh ? (
                                    <button
                                      onClick={() =>
                                        setViewingDoc({ doc: user.documents.cnh!, userName: user.fullName })
                                      }
                                      className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-lg text-[10px] font-bold hover:bg-amber-500/30 transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                                      title="Visualizar documento CNH"
                                    >
                                      <Eye className="w-3 h-3 text-amber-400" />
                                      Visualizar CNH
                                    </button>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded text-[10px] font-bold">
                                      CNH Faltando
                                    </span>
                                  )
                                )}

                                {/* Doc Veicular Button for Motorista */}
                                {user.role === 'Motorista' && (
                                  user.documents.docVeicular ? (
                                    <button
                                      onClick={() =>
                                        setViewingDoc({ doc: user.documents.docVeicular!, userName: user.fullName })
                                      }
                                      className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-lg text-[10px] font-bold hover:bg-amber-500/30 transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                                      title="Visualizar documento CRLV Veículo"
                                    >
                                      <Eye className="w-3 h-3 text-amber-400" />
                                      Visualizar CRLV
                                    </button>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded text-[10px] font-bold">
                                      CRLV Faltando
                                    </span>
                                  )
                                )}

                                {/* Comprovante de Endereço Button */}
                                {user.documents.comprovanteEndereco ? (
                                  <button
                                    onClick={() =>
                                      setViewingDoc({ doc: user.documents.comprovanteEndereco!, userName: user.fullName })
                                    }
                                    className="px-2.5 py-1 bg-teal-500/20 border border-teal-500/40 text-teal-300 rounded-lg text-[10px] font-bold hover:bg-teal-500/30 transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                                    title="Visualizar Comprovante de Endereço"
                                  >
                                    <Eye className="w-3 h-3 text-teal-400" />
                                    Visualizar Endereço
                                  </button>
                                ) : (
                                  <span className="px-2 py-0.5 bg-slate-500/10 border border-slate-500/20 text-slate-400 rounded text-[10px]">
                                    Endereço Sem Doc
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="flex flex-col gap-1.5">
                                {/* Status Badge */}
                                {(user.status === 'VERIFICADO' || user.status === 'APROVADO') && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 w-fit shadow-sm">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Aprovado
                                  </span>
                                )}
                                {(user.status === 'REJEITADO' || user.status === 'REPROVADO') && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 w-fit shadow-sm">
                                    <UserX className="w-3.5 h-3.5 text-rose-400" /> Reprovado
                                  </span>
                                )}
                                {user.status === 'PENDENTE' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 w-fit shadow-sm">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Pendente
                                  </span>
                                )}

                                {/* Quick Action Buttons */}
                                <div className="flex items-center gap-1 mt-0.5">
                                  <button
                                    onClick={() => handleApproveUser(user)}
                                    disabled={user.status === 'VERIFICADO' || user.status === 'APROVADO'}
                                    className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-500/50 text-emerald-200 border border-emerald-500/40 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                                    title="Aprovar cadastrado"
                                  >
                                    <Check className="w-3 h-3 text-emerald-400" /> Aprovar
                                  </button>

                                  <button
                                    onClick={() => handleRejectUser(user)}
                                    disabled={user.status === 'REJEITADO' || user.status === 'REPROVADO'}
                                    className="px-2 py-1 bg-rose-600/30 hover:bg-rose-500/50 text-rose-200 border border-rose-500/40 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                                    title="Reprovar cadastrado"
                                  >
                                    <UserX className="w-3 h-3 text-rose-400" /> Reprovar
                                  </button>
                                </div>
                              </div>
                            </td>

                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Quick Document Preview Action Button */}
                                { (user.documents.rg || user.documents.titulo || user.documents.cnh || user.documents.docVeicular) && (
                                  <button
                                    onClick={() => {
                                      const primaryDoc = user.documents.rg || user.documents.titulo || user.documents.cnh || user.documents.docVeicular;
                                      if (primaryDoc) setViewingDoc({ doc: primaryDoc, userName: user.fullName });
                                    }}
                                    className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-colors cursor-pointer"
                                    title="Visualizar documento do cadastrado"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                )}
                                <a
                                  href={getWhatsAppUrl(user.whatsapp, user.fullName)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
                                  title="Enviar WhatsApp para cadastrado"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                                <button
                                  onClick={() => {
                                    setSearchTerm(user.fullName);
                                    setActiveTab('general_info');
                                  }}
                                  className="p-1.5 text-teal-400 hover:text-teal-300 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg transition-colors cursor-pointer"
                                  title="Informação Geral do Usuário"
                                >
                                  <Info className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id, user.fullName)}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                  title="Excluir cadastro"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: INFORMAÇÃO GERAL DO USUÁRIO CADASTRADO */}
          {activeTab === 'general_info' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <Info className="w-6 h-6 text-teal-400" />
                      Informação Geral do Usuário Cadastrado
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Ficha cadastral completa, conferência de documentação, zona eleitoral e botão de atendimento direto via WhatsApp.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1.5 bg-teal-500/20 border border-teal-500/30 text-teal-300 rounded-xl text-xs font-bold">
                      Total: {filteredUsers.length} Integrantes
                    </span>
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por nome, Pix ou WhatsApp..."
                      className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>

                  <div>
                    <select
                      value={selectedZoneFilter}
                      onChange={(e) => setSelectedZoneFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-400 font-semibold"
                    >
                      <option value="TODAS">Todas as Zonas Eleitorais</option>
                      {ZONES.map((z) => (
                        <option key={z} value={z}>
                          Zona Eleitoral {z}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={selectedRoleFilter}
                      onChange={(e) => setSelectedRoleFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-400 font-semibold"
                    >
                      <option value="TODOS">Todas as Funções</option>
                      <option value="Divulgador">Divulgador</option>
                      <option value="Coordenador">Coordenador</option>
                      <option value="Liderança">Liderança</option>
                      <option value="Motorista">Motorista</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={selectedCoordinatorFilter}
                      onChange={(e) => setSelectedCoordinatorFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-purple-500/30 rounded-xl text-xs text-purple-200 focus:outline-none focus:border-purple-400 font-semibold"
                    >
                      <option value="TODOS">Todos os Coordenadores</option>
                      {uniqueCoordinators.map((c) => (
                        <option key={c} value={c}>
                          Coord: {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={selectedStatusFilter}
                      onChange={(e) => setSelectedStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-400 font-semibold"
                    >
                      <option value="TODOS">Todos os Status</option>
                      <option value="PENDENTE">Pendentes</option>
                      <option value="APROVADO">Aprovados</option>
                      <option value="REPROVADO">Reprovados</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dossier Grid */}
              {filteredUsers.length === 0 ? (
                <div className="bg-slate-900/40 backdrop-blur-md p-12 rounded-2xl border border-white/10 text-center space-y-3">
                  <UserX className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="text-white font-bold text-base">Nenhum integrante encontrado</h3>
                  <p className="text-xs text-slate-400">
                    Tente ajustar os filtros de busca por nome, zona eleitoral ou função.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredUsers.map((u) => (
                    <div
                      key={u.id}
                      className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-teal-500/40 p-5 rounded-2xl space-y-4 shadow-xl transition-all"
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-400">{u.id}</span>
                              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold rounded-md">
                                Zona {u.electoralZone}
                              </span>
                            </div>
                            <h3 className="font-bold text-white text-base leading-snug">{u.fullName}</h3>
                            <p className="text-xs text-teal-400 font-semibold">{u.role}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Status Badge */}
                          {(u.status === 'VERIFICADO' || u.status === 'APROVADO') && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Aprovado
                            </span>
                          )}
                          {(u.status === 'REJEITADO' || u.status === 'REPROVADO') && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                              <UserX className="w-3 h-3 text-rose-400" /> Reprovado
                            </span>
                          )}
                          {u.status === 'PENDENTE' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-amber-400" /> Pendente
                            </span>
                          )}

                          {/* Approval / Rejection buttons */}
                          <button
                            onClick={() => handleApproveUser(u)}
                            disabled={u.status === 'VERIFICADO' || u.status === 'APROVADO'}
                            className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-500/50 text-emerald-200 border border-emerald-500/40 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all disabled:opacity-40 cursor-pointer shadow-sm"
                            title="Aprovar cadastrado"
                          >
                            <Check className="w-3 h-3 text-emerald-400" /> Aprovar
                          </button>
                          <button
                            onClick={() => handleRejectUser(u)}
                            disabled={u.status === 'REJEITADO' || u.status === 'REPROVADO'}
                            className="px-2 py-1 bg-rose-600/30 hover:bg-rose-500/50 text-rose-200 border border-rose-500/40 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all disabled:opacity-40 cursor-pointer shadow-sm"
                            title="Reprovar cadastrado"
                          >
                            <UserX className="w-3 h-3 text-rose-400" /> Reprovar
                          </button>
                        </div>
                      </div>

                      {/* WhatsApp Banner */}
                      <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                            WhatsApp do Cadastrado
                          </span>
                          <span className="font-mono text-sm text-white font-bold">{u.whatsapp}</span>
                        </div>
                        <a
                          href={getWhatsAppUrl(u.whatsapp, u.fullName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl border border-emerald-400/40 shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                        >
                          <MessageCircle className="w-4 h-4" /> Enviar Mensagem no WhatsApp
                        </a>
                      </div>

                      {/* Pix Key & Address Box */}
                      <div className="space-y-2 bg-white/5 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Chave Pix</span>
                            <span className="font-mono text-slate-200 font-bold">{u.pixKey}</span>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(u.pixKey);
                              setCopiedKey(u.id);
                              setTimeout(() => setCopiedKey(null), 2000);
                            }}
                            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] rounded-lg border border-white/10 flex items-center gap-1 transition-all cursor-pointer shrink-0"
                          >
                            {copiedKey === u.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            {copiedKey === u.id ? 'Copiado!' : 'Copiar Pix'}
                          </button>
                        </div>

                        <div className="pt-2 border-t border-white/10">
                          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Endereço Completo</span>
                          <div className="flex items-start gap-1.5 mt-0.5 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                            <span>{u.address}</span>
                          </div>
                        </div>

                        {u.coordinatorName && (
                          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                            <span className="text-[10px] text-purple-400 uppercase font-semibold">Coordenador Responsável</span>
                            <span className="text-slate-200 font-bold text-xs">{u.coordinatorName}</span>
                          </div>
                        )}

                        {u.deputadoEstadual && (
                          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                            <span className="text-[10px] text-indigo-400 uppercase font-semibold">Deputado Estadual</span>
                            <span className="text-slate-200 font-bold text-xs">{u.deputadoEstadual}</span>
                          </div>
                        )}

                        {u.socialMedia && (
                          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                            <span className="text-[10px] text-pink-400 uppercase font-semibold">Rede Social</span>
                            <span className="text-slate-200 font-bold text-xs">{u.socialMedia}</span>
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 pt-1">
                          Cadastrado em: {new Date(u.createdAt).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(u.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {/* Document Attachments Status */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                            Anexos Cadastrados
                          </span>
                          <span className="text-[10px] text-teal-400 font-semibold">
                            Permite visualizar fotos/imagens e pdf diretamente na tela
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {/* RG */}
                          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                            <span className="text-slate-300 font-semibold text-[11px]">RG</span>
                            {u.documents.rg ? (
                              <button
                                onClick={() => setViewingDoc({ doc: u.documents.rg!, userName: u.fullName })}
                                className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-bold hover:bg-emerald-500/30 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3 text-emerald-400" /> Visualizar Documento
                              </button>
                            ) : (
                              <span className="text-rose-400 text-[10px]">Pendente</span>
                            )}
                          </div>

                          {/* Título */}
                          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                            <span className="text-slate-300 font-semibold text-[11px]">Título</span>
                            {u.documents.titulo ? (
                              <button
                                onClick={() => setViewingDoc({ doc: u.documents.titulo!, userName: u.fullName })}
                                className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-bold hover:bg-emerald-500/30 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3 text-emerald-400" /> Visualizar Documento
                              </button>
                            ) : (
                              <span className="text-rose-400 text-[10px]">Pendente</span>
                            )}
                          </div>

                          {/* CNH (if Motorista) */}
                          {u.role === 'Motorista' && (
                            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                              <span className="text-slate-300 font-semibold text-[11px]">CNH</span>
                              {u.documents.cnh ? (
                                <button
                                  onClick={() => setViewingDoc({ doc: u.documents.cnh!, userName: u.fullName })}
                                  className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold hover:bg-amber-500/30 transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3 text-amber-400" /> Visualizar Documento
                                </button>
                              ) : (
                                <span className="text-rose-400 text-[10px]">Pendente</span>
                              )}
                            </div>
                          )}

                          {/* CRLV (if Motorista) */}
                          {u.role === 'Motorista' && (
                            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                              <span className="text-slate-300 font-semibold text-[11px]">CRLV Veículo</span>
                              {u.documents.docVeicular ? (
                                <button
                                  onClick={() => setViewingDoc({ doc: u.documents.docVeicular!, userName: u.fullName })}
                                  className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold hover:bg-amber-500/30 transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3 text-amber-400" /> Visualizar Documento
                                </button>
                              ) : (
                                <span className="text-rose-400 text-[10px]">Pendente</span>
                              )}
                            </div>
                          )}

                          {/* Comprovante de Endereço */}
                          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                            <span className="text-slate-300 font-semibold text-[11px]">Comp. Endereço</span>
                            {u.documents.comprovanteEndereco ? (
                              <button
                                onClick={() => setViewingDoc({ doc: u.documents.comprovanteEndereco!, userName: u.fullName })}
                                className="px-2.5 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-lg text-[10px] font-bold hover:bg-teal-500/30 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3 text-teal-400" /> Visualizar Documento
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Opcional</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">Ações do Cadastro</span>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.fullName)}
                          className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Excluir Cadastro
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ENCONTRAR USUÁRIO POR NOME */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-400" />
                  Encontrar Usuário por Nome ou Chave Pix
                </h2>
                <p className="text-xs text-slate-400">
                  Pesquise rapidamente para localizar cadastros, conferir anexos e verificar zonas eleitorais.
                </p>

                <div className="relative max-w-xl">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Digite o nome completo, CPF, telefone Pix ou WhatsApp..."
                    className="w-full pl-11 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                    autoFocus
                  />
                  <Search className="w-5 h-5 text-blue-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Search Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-blue-400/40 p-5 rounded-2xl space-y-3 transition-all shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400">{u.id}</span>
                        <h3 className="font-bold text-white text-base leading-tight">{u.fullName}</h3>
                        <p className="text-xs text-blue-400 font-semibold mt-0.5">{u.role}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-400/30 text-blue-300 font-bold text-xs rounded-lg shrink-0">
                        Zona {u.electoralZone}
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 text-slate-200 bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10">
                      <div>
                        <strong className="text-slate-400">Pix:</strong> {u.pixKey}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <strong className="text-slate-400">WhatsApp:</strong> {u.whatsapp}
                        </div>
                        <a
                          href={getWhatsAppUrl(u.whatsapp, u.fullName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg border border-emerald-400/30 flex items-center gap-1 transition-all cursor-pointer shadow"
                        >
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </a>
                      </div>
                      <div className="truncate">
                        <strong className="text-slate-400">Endereço:</strong> {u.address}
                      </div>
                      {u.coordinatorName && (
                        <div>
                          <strong className="text-purple-400">Coordenador:</strong> {u.coordinatorName}
                        </div>
                      )}
                      {u.deputadoEstadual && (
                        <div>
                          <strong className="text-indigo-400">Deputado Est.:</strong> {u.deputadoEstadual}
                        </div>
                      )}
                      {u.socialMedia && (
                        <div>
                          <strong className="text-pink-400">Rede Social:</strong> {u.socialMedia}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold text-[11px] ${
                            u.status === 'VERIFICADO' || u.status === 'APROVADO'
                              ? 'text-emerald-400'
                              : u.status === 'REJEITADO' || u.status === 'REPROVADO'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          ● {u.status === 'VERIFICADO' ? 'APROVADO' : u.status === 'REJEITADO' ? 'REPROVADO' : u.status}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleApproveUser(u)}
                            disabled={u.status === 'VERIFICADO' || u.status === 'APROVADO'}
                            className="px-2 py-0.5 bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold disabled:opacity-40"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleRejectUser(u)}
                            disabled={u.status === 'REJEITADO' || u.status === 'REPROVADO'}
                            className="px-2 py-0.5 bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded text-[10px] font-bold disabled:opacity-40"
                          >
                            Reprovar
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {u.documents.rg && (
                          <button
                            onClick={() => setViewingDoc({ doc: u.documents.rg!, userName: u.fullName })}
                            className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                            title="Visualizar documento RG"
                          >
                            <Eye className="w-3 h-3 text-emerald-400" />
                            Visualizar RG
                          </button>
                        )}
                        {u.documents.titulo && (
                          <button
                            onClick={() => setViewingDoc({ doc: u.documents.titulo!, userName: u.fullName })}
                            className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                            title="Visualizar documento Título de Eleitor"
                          >
                            <Eye className="w-3 h-3 text-emerald-400" />
                            Visualizar Título
                          </button>
                        )}
                        {u.role === 'Motorista' && u.documents.cnh && (
                          <button
                            onClick={() => setViewingDoc({ doc: u.documents.cnh!, userName: u.fullName })}
                            className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                            title="Visualizar documento CNH"
                          >
                            <Eye className="w-3 h-3 text-amber-400" />
                            Visualizar CNH
                          </button>
                        )}
                        {u.role === 'Motorista' && u.documents.docVeicular && (
                          <button
                            onClick={() => setViewingDoc({ doc: u.documents.docVeicular!, userName: u.fullName })}
                            className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                            title="Visualizar documento CRLV Veículo"
                          >
                            <Eye className="w-3 h-3 text-amber-400" />
                            Visualizar CRLV
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ZONAS ELEITORAIS */}
          {activeTab === 'zones' && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Vote className="w-5 h-5 text-blue-400" />
                  Mapeamento de Zonas Eleitorais
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Distribuição quantitativa de coordenadores, lideranças, motoristas e equipes por Zona Eleitoral.
                </p>
              </div>

              {/* Cards Grid per Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {zoneCounts.map((z) => (
                  <div
                    key={z.zone}
                    className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl space-y-4 shadow-xl hover:border-blue-400/50 transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                          TRE / Seção
                        </span>
                        <h3 className="text-2xl font-black text-white">Zona {z.zone}</h3>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-lg border border-blue-400/30 shadow-inner">
                        {z.count}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/5 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
                        <span className="text-slate-400 text-[10px] block">Motoristas</span>
                        <span className="font-bold text-amber-300 text-sm">{z.drivers}</span>
                      </div>
                      <div className="bg-white/5 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
                        <span className="text-slate-400 text-[10px] block">Coordenadores</span>
                        <span className="font-bold text-purple-300 text-sm">{z.coordinators}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedZoneFilter(z.zone);
                        setActiveTab('users');
                      }}
                      className="w-full py-2.5 bg-white/5 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 text-slate-300 hover:text-white border border-white/10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      Filtrar Integrantes da Zona {z.zone}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PERMISSÕES AVANÇADAS */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-400" />
                  Matriz de Permissões Avançadas
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Configure os níveis de acesso ao sistema por perfis organizacionais.
                </p>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-white/5 backdrop-blur-md text-slate-300 font-semibold uppercase tracking-wider border-b border-white/10">
                      <tr>
                        <th className="p-4">Perfil de Acesso</th>
                        <th className="p-4 text-center">Ver Cadastros</th>
                        <th className="p-4 text-center">Criar Cadastros</th>
                        <th className="p-4 text-center">Editar Status</th>
                        <th className="p-4 text-center">Excluir Registros</th>
                        <th className="p-4 text-center">Exportar Backup Excel</th>
                        <th className="p-4 text-center">Ver Logs Auditáveis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {permissions.map((p, idx) => (
                        <tr key={p.roleName} className="hover:bg-white/5">
                          <td className="p-4 font-bold text-white">{p.roleName}</td>

                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={p.canViewUsers}
                              onChange={(e) => {
                                const next = [...permissions];
                                next[idx].canViewUsers = e.target.checked;
                                setPermissions(next);
                                savePermissions(next);
                              }}
                              className="w-4 h-4 rounded text-blue-500 focus:ring-0 bg-white/10 border-white/20"
                            />
                          </td>

                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={p.canCreateUsers}
                              onChange={(e) => {
                                const next = [...permissions];
                                next[idx].canCreateUsers = e.target.checked;
                                setPermissions(next);
                                savePermissions(next);
                              }}
                              className="w-4 h-4 rounded text-blue-500 focus:ring-0 bg-white/10 border-white/20"
                            />
                          </td>

                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={p.canEditUsers}
                              onChange={(e) => {
                                const next = [...permissions];
                                next[idx].canEditUsers = e.target.checked;
                                setPermissions(next);
                                savePermissions(next);
                              }}
                              className="w-4 h-4 rounded text-blue-500 focus:ring-0 bg-white/10 border-white/20"
                            />
                          </td>

                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={p.canDeleteUsers}
                              onChange={(e) => {
                                const next = [...permissions];
                                next[idx].canDeleteUsers = e.target.checked;
                                setPermissions(next);
                                savePermissions(next);
                              }}
                              className="w-4 h-4 rounded text-blue-500 focus:ring-0 bg-white/10 border-white/20"
                            />
                          </td>

                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={p.canExportBackup}
                              onChange={(e) => {
                                const next = [...permissions];
                                next[idx].canExportBackup = e.target.checked;
                                setPermissions(next);
                                savePermissions(next);
                              }}
                              className="w-4 h-4 rounded text-blue-500 focus:ring-0 bg-white/10 border-white/20"
                            />
                          </td>

                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={p.canViewLogs}
                              onChange={(e) => {
                                const next = [...permissions];
                                next[idx].canViewLogs = e.target.checked;
                                setPermissions(next);
                                savePermissions(next);
                              }}
                              className="w-4 h-4 rounded text-blue-500 focus:ring-0 bg-white/10 border-white/20"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HISTÓRICO DE LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-400" />
                    Histórico Auditável de Logs do Sistema
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Registro de todas as ações de cadastro, exportações, acessos e alterações.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Deseja realmente limpar todos os logs registrados?')) {
                      clearLogs();
                      refreshData();
                    }
                  }}
                  className="px-3.5 py-2 bg-white/5 hover:bg-rose-500/20 text-rose-300 border border-white/10 hover:border-rose-400/40 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Limpar Logs
                </button>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-white/5 backdrop-blur-md text-slate-300 font-semibold uppercase tracking-wider border-b border-white/10">
                      <tr>
                        <th className="p-4">Data e Hora</th>
                        <th className="p-4">Ator / Origem</th>
                        <th className="p-4">Categoria</th>
                        <th className="p-4">Ação Realizada</th>
                        <th className="p-4">Detalhes da Operação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/5">
                          <td className="p-4 font-mono text-slate-400 text-[11px]">
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </td>
                          <td className="p-4 font-bold text-white">{log.actor}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 bg-white/10 border border-white/10 text-slate-200 rounded font-mono text-[10px]">
                              {log.category}
                            </span>
                          </td>
                          <td className="p-4 text-blue-300 font-semibold">{log.action}</td>
                          <td className="p-4 text-slate-300 text-[11px]">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BACKUP DE SEGURANÇA */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                  Central de Backup de Segurança & Exportação
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Exporte todos os dados dos cadastrados e inventário de anexos em planilha Excel oficial.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Excel Export Card */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl space-y-4 shadow-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Exportação Completa em Excel (.xlsx)</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Gera uma planilha com 3 abas contendo: Cadastro dos Integrantes, Inventário de Anexos e Logs de Auditoria do Sistema.
                    </p>
                  </div>

                  <button
                    onClick={handleExportExcel}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 border border-emerald-400/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Backup Excel (.xlsx)
                  </button>
                </div>

                {/* Cloud Sync Status Card */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl space-y-4 shadow-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center font-bold">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Sincronização em Nuvem em Tempo Real</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Servidor na nuvem ativo. Última sincronização:{' '}
                      <span className="text-slate-200 font-mono">
                        {syncState.lastSyncedAt
                          ? new Date(syncState.lastSyncedAt).toLocaleTimeString('pt-BR')
                          : 'Nunca'}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={handleTriggerCloudSync}
                    disabled={syncState.syncing}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 border border-blue-400/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncState.syncing ? 'animate-spin' : ''}`} />
                    Sincronizar Agora com a Nuvem
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PESQUISAR DE DIVULGADOR, LIDERANÇA E MOTORISTA POR COORDENADOR */}
          {activeTab === 'coordinator_search' && (
            <div className="space-y-6">
              {/* Top Banner Card */}
              <div className="bg-gradient-to-r from-slate-900/90 via-purple-950/40 to-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-purple-500/30 shadow-2xl space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-purple-300 text-xs font-bold mb-2">
                      <UserCheck className="w-3.5 h-3.5" /> Gestão de Equipe por Coordenador
                    </div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      Pesquisa de Divulgador, Liderança e Motorista por Coordenador
                    </h2>
                    <p className="text-xs text-slate-300 mt-1">
                      Filtre a estrutura da campanha selecionando um Coordenador para listar todos os Divulgadores, Lideranças e Motoristas sob sua responsabilidade.
                    </p>
                  </div>

                  {/* Filter Selector in Header */}
                  <div className="w-full sm:w-80 shrink-0">
                    <label className="block text-[11px] font-bold text-purple-300 mb-1">
                      Filtrar por Coordenador Responsável:
                    </label>
                    <select
                      value={selectedCoordinatorFilter}
                      onChange={(e) => setSelectedCoordinatorFilter(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-purple-500/40 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-purple-400 shadow-lg"
                    >
                      <option value="TODOS">Todos os Coordenadores ({uniqueCoordinators.length})</option>
                      {uniqueCoordinators.map((coord) => {
                        const teamCount = users.filter(
                          (u) => u.coordinatorName?.trim().toLowerCase() === coord.trim().toLowerCase()
                        ).length;
                        return (
                          <option key={coord} value={coord}>
                            {coord} ({teamCount} integrante{teamCount !== 1 ? 's' : ''})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Quick Selection Pills for Coordinators */}
                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Atalhos por Coordenador:</span>
                  <button
                    onClick={() => setSelectedCoordinatorFilter('TODOS')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      selectedCoordinatorFilter === 'TODOS'
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Todos ({uniqueCoordinators.length})
                  </button>
                  {uniqueCoordinators.map((coord) => {
                    const count = users.filter(
                      (u) => u.coordinatorName?.trim().toLowerCase() === coord.trim().toLowerCase()
                    ).length;
                    const isSelected = selectedCoordinatorFilter.toLowerCase().trim() === coord.toLowerCase().trim();
                    return (
                      <button
                        key={coord}
                        onClick={() => setSelectedCoordinatorFilter(coord)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/20'
                            : 'bg-purple-950/40 text-purple-200 border-purple-500/30 hover:bg-purple-900/60'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5 text-purple-300" />
                        {coord}
                        <span className="bg-black/40 px-1.5 py-0.2 rounded-full text-[10px] text-purple-300 font-mono">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Display Coordinator Team Groups */}
              {uniqueCoordinators.length === 0 ? (
                <div className="p-12 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl text-center space-y-2">
                  <UserX className="w-10 h-10 text-slate-500 mx-auto" />
                  <p className="text-white font-bold text-sm">Nenhum coordenador cadastrado no sistema.</p>
                  <p className="text-slate-400 text-xs">Os integrantes que indicarem o nome de seu coordenador aparecerão nesta tela automaticamente.</p>
                </div>
              ) : (
                uniqueCoordinators
                  .filter(
                    (coord) =>
                      selectedCoordinatorFilter === 'TODOS' ||
                      selectedCoordinatorFilter.toLowerCase().trim() === coord.toLowerCase().trim()
                  )
                  .map((coordName) => {
                    const team = users.filter(
                      (u) => u.coordinatorName?.trim().toLowerCase() === coordName.trim().toLowerCase()
                    );
                    const divulgadores = team.filter((u) => u.role === 'Divulgador' || u.role === 'Equipe de rua');
                    const liderancas = team.filter((u) => u.role === 'Liderança');
                    const motoristas = team.filter((u) => u.role === 'Motorista');
                    const coordUser = users.find(
                      (u) => u.fullName.trim().toLowerCase() === coordName.trim().toLowerCase() && u.role === 'Coordenador'
                    );

                    return (
                      <div
                        key={coordName}
                        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-purple-500/40 rounded-2xl p-6 shadow-2xl space-y-6 transition-all"
                      >
                        {/* Coordinator Header Card */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg border border-purple-400/30">
                              {coordName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                                  Coordenador Responsável
                                </span>
                                {coordUser && (
                                  <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-400/30">
                                    Zona {coordUser.electoralZone}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-black text-white mt-0.5">{coordName}</h3>
                              {coordUser?.whatsapp && (
                                <p className="text-xs text-slate-300 font-mono">
                                  WhatsApp do Coordenador: {coordUser.whatsapp}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Stats Summary for this Coordinator */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="px-3 py-1.5 bg-black/40 rounded-xl border border-white/10 text-center">
                              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Equipe</span>
                              <span className="text-sm font-black text-white">{team.length}</span>
                            </div>
                            <div className="px-3 py-1.5 bg-black/40 rounded-xl border border-white/10 text-center">
                              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Divulgadores</span>
                              <span className="text-sm font-black text-teal-300">{divulgadores.length}</span>
                            </div>
                            <div className="px-3 py-1.5 bg-black/40 rounded-xl border border-white/10 text-center">
                              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Lideranças</span>
                              <span className="text-sm font-black text-blue-300">{liderancas.length}</span>
                            </div>
                            <div className="px-3 py-1.5 bg-black/40 rounded-xl border border-white/10 text-center">
                              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Motoristas</span>
                              <span className="text-sm font-black text-amber-300">{motoristas.length}</span>
                            </div>
                          </div>
                        </div>

                        {team.length === 0 ? (
                          <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center text-slate-400 text-xs">
                            Nenhum divulgador, liderança ou motorista cadastrado diretamente sob o coordenador <strong>{coordName}</strong> ainda.
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* 1. DIVULGADORES SECTION */}
                            {divulgadores.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                                  <Users className="w-4 h-4 text-teal-400" />
                                  Divulgadores Vinculados ({divulgadores.length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {divulgadores.map((member) => (
                                    <TeamMemberCard
                                      key={member.id}
                                      member={member}
                                      onApprove={handleApproveUser}
                                      onReject={handleRejectUser}
                                      onViewDoc={(doc, userName) => setViewingDoc({ doc, userName })}
                                      getWhatsAppUrl={getWhatsAppUrl}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 2. LIDERANÇAS SECTION */}
                            {liderancas.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                                  <UserCheck className="w-4 h-4 text-blue-400" />
                                  Lideranças Vinculadas ({liderancas.length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {liderancas.map((member) => (
                                    <TeamMemberCard
                                      key={member.id}
                                      member={member}
                                      onApprove={handleApproveUser}
                                      onReject={handleRejectUser}
                                      onViewDoc={(doc, userName) => setViewingDoc({ doc, userName })}
                                      getWhatsAppUrl={getWhatsAppUrl}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 3. MOTORISTAS SECTION */}
                            {motoristas.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                                  <Car className="w-4 h-4 text-amber-400" />
                                  Motoristas Vinculados ({motoristas.length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {motoristas.map((member) => (
                                    <TeamMemberCard
                                      key={member.id}
                                      member={member}
                                      onApprove={handleApproveUser}
                                      onReject={handleRejectUser}
                                      onViewDoc={(doc, userName) => setViewingDoc({ doc, userName })}
                                      getWhatsAppUrl={getWhatsAppUrl}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          )}

          {/* TAB 7: ALTERAÇÃO DE SENHA */}
          {activeTab === 'password' && (
            <div className="space-y-6 max-w-xl">
              <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-blue-400" />
                  Alteração da Senha de Administrador
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Atualize a credencial de segurança de acesso ao painel de controle da campanha.
                </p>
              </div>

              <form
                onSubmit={handleChangePassword}
                className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 space-y-4 shadow-2xl"
              >
                {passMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      passMsg.type === 'success'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {passMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span>{passMsg.text}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Senha Atual</label>
                  <input
                    type="password"
                    value={currentPassInput}
                    onChange={(e) => setCurrentPassInput(e.target.value)}
                    placeholder="Digite a senha atual"
                    className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-md border border-white/15 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nova Senha</label>
                  <input
                    type="password"
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-md border border-white/15 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={confirmPassInput}
                    onChange={(e) => setConfirmPassInput(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-md border border-white/15 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all cursor-pointer"
                >
                  Salvar Nova Senha
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <DocumentViewerModal
          isOpen={true}
          doc={viewingDoc.doc}
          userName={viewingDoc.userName}
          onClose={() => setViewingDoc(null)}
        />
      )}
    </div>
  );
};

interface TeamMemberCardProps {
  member: CampaignUser;
  onApprove: (user: CampaignUser) => void;
  onReject: (user: CampaignUser) => void;
  onViewDoc: (doc: DocumentAttachment, userName: string) => void;
  getWhatsAppUrl: (whatsapp: string, fullName: string) => string;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  onApprove,
  onReject,
  onViewDoc,
  getWhatsAppUrl,
}) => {
  const isApproved = member.status === 'APROVADO' || member.status === 'VERIFICADO';
  const isRejected = member.status === 'REPROVADO' || member.status === 'REJEITADO';

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl space-y-3 shadow-md hover:border-white/20 transition-all text-xs">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400">{member.id}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Zona {member.electoralZone}
            </span>
          </div>
          <h5 className="font-bold text-white text-sm leading-snug mt-0.5">{member.fullName}</h5>
          <span className="text-[11px] font-semibold text-purple-300 block">{member.role}</span>
        </div>

        {/* Status Badge */}
        {isApproved && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Aprovado
          </span>
        )}
        {isRejected && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0 flex items-center gap-1">
            <UserX className="w-3 h-3 text-rose-400" /> Reprovado
          </span>
        )}
        {!isApproved && !isRejected && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-400" /> Pendente
          </span>
        )}
      </div>

      {/* Pix Key & WhatsApp Contact */}
      <div className="bg-black/30 p-2.5 rounded-lg space-y-1.5 text-[11px]">
        <div>
          <span className="text-slate-400 font-semibold">Pix:</span>{' '}
          <span className="font-mono text-white font-bold">{member.pixKey}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-slate-400 font-semibold">WhatsApp:</span>{' '}
            <span className="font-mono text-white font-bold">{member.whatsapp}</span>
          </div>
          <a
            href={getWhatsAppUrl(member.whatsapp, member.fullName)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded border border-emerald-400/30 flex items-center gap-1 transition-all cursor-pointer shadow-xs shrink-0"
          >
            <MessageCircle className="w-3 h-3" /> WhatsApp
          </a>
        </div>
      </div>

      {/* Document Attachments */}
      <div className="space-y-1">
        <span className="text-[10px] text-slate-400 font-bold uppercase block">Anexos:</span>
        <div className="flex flex-wrap gap-1">
          {member.documents.rg ? (
            <button
              onClick={() => onViewDoc(member.documents.rg!, member.fullName)}
              className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Eye className="w-3 h-3 text-emerald-400" /> RG
            </button>
          ) : (
            <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded text-[9px]">RG Faltando</span>
          )}

          {member.documents.titulo ? (
            <button
              onClick={() => onViewDoc(member.documents.titulo!, member.fullName)}
              className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Eye className="w-3 h-3 text-emerald-400" /> Título
            </button>
          ) : (
            <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded text-[9px]">Título Faltando</span>
          )}

          {member.role === 'Motorista' && (
            member.documents.cnh ? (
              <button
                onClick={() => onViewDoc(member.documents.cnh!, member.fullName)}
                className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Eye className="w-3 h-3 text-amber-400" /> CNH
              </button>
            ) : (
              <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded text-[9px] font-bold">CNH Faltando</span>
            )
          )}

          {member.role === 'Motorista' && (
            member.documents.docVeicular ? (
              <button
                onClick={() => onViewDoc(member.documents.docVeicular!, member.fullName)}
                className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Eye className="w-3 h-3 text-amber-400" /> CRLV
              </button>
            ) : (
              <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded text-[9px] font-bold">CRLV Faltando</span>
            )
          )}
        </div>
      </div>

      {/* Approve / Reject Controls */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-1.5">
        <button
          onClick={() => onApprove(member)}
          disabled={isApproved}
          className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-500/50 text-emerald-200 border border-emerald-500/40 rounded text-[10px] font-bold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
        >
          <Check className="w-3 h-3 text-emerald-400" /> Aprovar
        </button>
        <button
          onClick={() => onReject(member)}
          disabled={isRejected}
          className="px-2.5 py-1 bg-rose-600/30 hover:bg-rose-500/50 text-rose-200 border border-rose-500/40 rounded text-[10px] font-bold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
        >
          <UserX className="w-3 h-3 text-rose-400" /> Reprovar
        </button>
      </div>
    </div>
  );
};
