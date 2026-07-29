export type CampaignRole = 'Coordenador' | 'Liderança' | 'Motorista' | 'Divulgador' | 'Equipe de rua';

export type ElectoralZone = '176' | '185' | '276' | '278' | '279' | '393' | '395';

export interface DocumentAttachment {
  id: string;
  type: 'RG' | 'TITULO' | 'CNH' | 'DOC_VEICULAR' | 'COMPROVANTE_ENDERECO';
  name: string;
  dataUrl: string; // Base64 data URL or mock file path
  fileType: 'image' | 'pdf';
  uploadedAt: string;
}

export interface CampaignUser {
  id: string;
  fullName: string;
  role: CampaignRole;
  coordinatorName?: string;
  deputadoEstadual?: string;
  socialMedia?: string;
  pixKey: string;
  whatsapp: string;
  address: string;
  electoralZone: ElectoralZone;
  documents: {
    rg?: DocumentAttachment;
    titulo?: DocumentAttachment;
    cnh?: DocumentAttachment;
    docVeicular?: DocumentAttachment;
    comprovanteEndereco?: DocumentAttachment;
  };
  createdAt: string;
  updatedAt: string;
  status: 'PENDENTE' | 'VERIFICADO' | 'APROVADO' | 'REJEITADO' | 'REPROVADO';
  syncedToCloud: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  category: 'CADASTRO' | 'SISTEMA' | 'SEGURANCA' | 'BACKUP' | 'PERMISSAO';
}

export interface SystemPermissions {
  roleName: string;
  canViewUsers: boolean;
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canExportBackup: boolean;
  canManagePermissions: boolean;
  canViewLogs: boolean;
}

export interface CloudSyncState {
  isOnline: boolean;
  lastSyncedAt: string | null;
  pendingCount: number;
  syncing: boolean;
}
