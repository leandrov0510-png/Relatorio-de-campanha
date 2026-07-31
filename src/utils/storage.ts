import { CampaignUser, AuditLog, SystemPermissions, CloudSyncState, ElectoralZone, CampaignRole } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  USERS: 'campanha_doc_users_v1',
  LOGS: 'campanha_doc_logs_v1',
  ADMIN_PASS: 'campanha_admin_pass_v1',
  PERMISSIONS: 'campanha_permissions_v1',
  SYNC: 'campanha_cloud_sync_v1',
};

// Default sample users for immediate rich preview
const SAMPLE_USERS: CampaignUser[] = [
  {
    id: 'USR-8900',
    fullName: 'Dr. Fernando Albuquerque (Admin Principal)',
    role: 'Coordenador',
    coordinatorName: 'Direção Geral da Campanha',
    deputadoEstadual: 'Bancada Majoritária',
    socialMedia: '@dr.fernando.oficial',
    pixKey: 'fernando.admin@campanha.org.br',
    whatsapp: '(11) 99100-2026',
    address: 'Alameda Santos, 1000, Cj 81, Cerqueira César - São Paulo / SP',
    electoralZone: '176',
    status: 'APROVADO',
    syncedToCloud: true,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    documents: {
      rg: {
        id: 'doc-admin-1',
        type: 'RG',
        name: 'RG_Admin_Fernando.pdf',
        fileType: 'pdf',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQK...',
        uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
      titulo: {
        id: 'doc-admin-2',
        type: 'TITULO',
        name: 'Titulo_Admin_Fernando.jpg',
        fileType: 'image',
        dataUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      }
    }
  },
  {
    id: 'USR-8901',
    fullName: 'Ana Paula Silva Vasconcelos',
    role: 'Coordenador',
    coordinatorName: 'Fernando Albuquerque',
    deputadoEstadual: 'Dep. Roberto Guimarães',
    pixKey: 'ana.vasconcelos@email.com',
    whatsapp: '(11) 98765-4321',
    address: 'Av. Paulista, 1500, Apt 42, Bela Vista - São Paulo / SP',
    electoralZone: '176',
    status: 'VERIFICADO',
    syncedToCloud: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    documents: {
      rg: {
        id: 'doc-1',
        type: 'RG',
        name: 'RG_Ana_Paula.pdf',
        fileType: 'pdf',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQK...',
        uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      titulo: {
        id: 'doc-2',
        type: 'TITULO',
        name: 'Titulo_Eleitor_Ana.jpg',
        fileType: 'image',
        dataUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      }
    }
  },
  {
    id: 'USR-8902',
    fullName: 'Carlos Eduardo Santos Motorista',
    role: 'Motorista',
    coordinatorName: 'Ana Paula Vasconcelos',
    deputadoEstadual: 'Dep. Roberto Guimarães',
    pixKey: '123.456.789-00',
    whatsapp: '(11) 97123-8899',
    address: 'Rua das Camélias, 88, Jd. Primavera - São Paulo / SP',
    electoralZone: '185',
    status: 'VERIFICADO',
    syncedToCloud: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    documents: {
      rg: {
        id: 'doc-3',
        type: 'RG',
        name: 'RG_Carlos.jpg',
        fileType: 'image',
        dataUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      titulo: {
        id: 'doc-4',
        type: 'TITULO',
        name: 'Titulo_Carlos.jpg',
        fileType: 'image',
        dataUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      cnh: {
        id: 'doc-5',
        type: 'CNH',
        name: 'CNH_Valida_Carlos.jpg',
        fileType: 'image',
        dataUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      docVeicular: {
        id: 'doc-6',
        type: 'DOC_VEICULAR',
        name: 'CRLV_2026_Veiculo.pdf',
        fileType: 'pdf',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQK...',
        uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      }
    }
  },
  {
    id: 'USR-8903',
    fullName: 'Mariana Ribeiro Liderança',
    role: 'Liderança',
    coordinatorName: 'Fernando Albuquerque',
    deputadoEstadual: 'Dep. Mariana Lima',
    pixKey: '11988887777',
    whatsapp: '(11) 98888-7777',
    address: 'Rua São Bento, 450, Centro - São Paulo / SP',
    electoralZone: '276',
    status: 'VERIFICADO',
    syncedToCloud: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    documents: {
      rg: {
        id: 'doc-7',
        type: 'RG',
        name: 'RG_Mariana.jpg',
        fileType: 'image',
        dataUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      titulo: {
        id: 'doc-8',
        type: 'TITULO',
        name: 'Titulo_Mariana.pdf',
        fileType: 'pdf',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQK...',
        uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      }
    }
  },
  {
    id: 'USR-8904',
    fullName: 'Roberto Avelar da Silva',
    role: 'Divulgador',
    coordinatorName: 'Mariana Ribeiro',
    deputadoEstadual: 'Dep. Roberto Guimarães',
    pixKey: 'roberto.avelar@pix.com',
    whatsapp: '(11) 96543-2109',
    address: 'Rua do Bosque, 120, Barra Funda - São Paulo / SP',
    electoralZone: '278',
    status: 'PENDENTE',
    syncedToCloud: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    documents: {
      rg: {
        id: 'doc-9',
        type: 'RG',
        name: 'RG_Foto_Roberto.jpg',
        fileType: 'image',
        dataUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      titulo: {
        id: 'doc-10',
        type: 'TITULO',
        name: 'Titulo_Roberto.jpg',
        fileType: 'image',
        dataUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      }
    }
  },
  {
    id: 'USR-8905',
    fullName: 'Fernanda Lima Castro',
    role: 'Divulgador',
    coordinatorName: 'Ana Paula Vasconcelos',
    deputadoEstadual: 'Dep. Mariana Lima',
    pixKey: '098.765.432-11',
    whatsapp: '(11) 95432-1098',
    address: 'Rua Augusta, 2100, Consolação - São Paulo / SP',
    electoralZone: '393',
    status: 'VERIFICADO',
    syncedToCloud: true,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    documents: {
      rg: {
        id: 'doc-11',
        type: 'RG',
        name: 'RG_Fernanda.jpg',
        fileType: 'image',
        dataUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      titulo: {
        id: 'doc-12',
        type: 'TITULO',
        name: 'Titulo_Fernanda.pdf',
        fileType: 'pdf',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQK...',
        uploadedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      }
    }
  },
  {
    id: 'USR-8906',
    fullName: 'Lucas Mendes Ferreira (Motorista)',
    role: 'Motorista',
    coordinatorName: 'Mariana Ribeiro',
    pixKey: 'lucas.mendes@pix.br',
    whatsapp: '(11) 94321-0987',
    address: 'Av. Brasil, 430, Pinheiros - São Paulo / SP',
    electoralZone: '395',
    status: 'VERIFICADO',
    syncedToCloud: true,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    documents: {
      rg: {
        id: 'doc-13',
        type: 'RG',
        name: 'RG_Lucas.jpg',
        fileType: 'image',
        dataUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      titulo: {
        id: 'doc-14',
        type: 'TITULO',
        name: 'Titulo_Lucas.jpg',
        fileType: 'image',
        dataUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      cnh: {
        id: 'doc-15',
        type: 'CNH',
        name: 'CNH_Lucas.pdf',
        fileType: 'pdf',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQK...',
        uploadedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      docVeicular: {
        id: 'doc-16',
        type: 'DOC_VEICULAR',
        name: 'CRLV_Lucas_2026.pdf',
        fileType: 'pdf',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQK...',
        uploadedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      }
    }
  }
];

const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'log-101',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    actor: 'Sistema',
    action: 'Sincronização em Nuvem',
    details: 'Base de dados inicial inicializada com sucesso',
    category: 'SISTEMA'
  },
  {
    id: 'log-102',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    actor: 'Público',
    action: 'Novo Cadastro de Motorista',
    details: 'Usuário Carlos Eduardo cadastrado com RG, Título, CNH e Doc Veicular na Zona 185',
    category: 'CADASTRO'
  },
  {
    id: 'log-103',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    actor: 'Administrador',
    action: 'Aprovação de Documentos',
    details: 'Documentos do cadastrado Ana Paula Vasconcelos validados no sistema',
    category: 'SEGURANCA'
  }
];

const DEFAULT_PERMISSIONS: SystemPermissions[] = [
  {
    roleName: 'Administrador Principal 1 (Geral)',
    canViewUsers: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canExportBackup: true,
    canManagePermissions: true,
    canViewLogs: true,
  },
  {
    roleName: 'Administrador Principal 2 (Executivo)',
    canViewUsers: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canExportBackup: true,
    canManagePermissions: true,
    canViewLogs: true,
  },
  {
    roleName: 'Coordenador de Zona Eleitoral',
    canViewUsers: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: false,
    canExportBackup: true,
    canManagePermissions: false,
    canViewLogs: true,
  },
  {
    roleName: 'Fiscal de Documentação',
    canViewUsers: true,
    canCreateUsers: false,
    canEditUsers: true,
    canDeleteUsers: false,
    canExportBackup: false,
    canManagePermissions: false,
    canViewLogs: false,
  },
  {
    roleName: 'Divulgador / Operacional',
    canViewUsers: true,
    canCreateUsers: true,
    canEditUsers: false,
    canDeleteUsers: false,
    canExportBackup: false,
    canManagePermissions: false,
    canViewLogs: false,
  }
];

let inMemoryUsersCache: CampaignUser[] | null = null;

export function getUsers(): CampaignUser[] {
  try {
    if (inMemoryUsersCache && inMemoryUsersCache.length > 0) {
      return inMemoryUsersCache;
    }
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SAMPLE_USERS));
      inMemoryUsersCache = SAMPLE_USERS;
      return SAMPLE_USERS;
    }
    const parsed: CampaignUser[] = JSON.parse(raw);
    const normalized = parsed.map(u => ({
      ...u,
      role: (u.role === 'Equipe de rua' ? 'Divulgador' : u.role) as CampaignRole
    })).sort((a, b) => {
      const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
      if (timeA !== timeB) return timeB - timeA;
      return b.id.localeCompare(a.id);
    });
    inMemoryUsersCache = normalized;
    return normalized;
  } catch (err) {
    console.error('Error reading users from storage:', err);
    return inMemoryUsersCache || SAMPLE_USERS;
  }
}

export function saveUsers(users: CampaignUser[]): void {
  inMemoryUsersCache = users;
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('campaign_data_changed'));
  } catch (err) {
    console.warn('LocalStorage quota exceeded or save error, attempting lightweight cleanup:', err);

    // Quota Recovery Attempt 1: Trim overly large image base64s in user records
    try {
      const lightweightUsers = users.map((u) => {
        if (!u.documents) return u;
        const docs = { ...u.documents };

        (Object.keys(docs) as Array<keyof typeof docs>).forEach((key) => {
          const doc = docs[key];
          if (doc && doc.dataUrl && doc.dataUrl.length > 100000) {
            // Replace large base64 dataUrl with a lightweight SVG/placeholder
            docs[key] = {
              ...doc,
              dataUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
            };
          }
        });

        return { ...u, documents: docs };
      });

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(lightweightUsers));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('campaign_data_changed'));
      console.log('Saved users successfully using lightweight document fallback.');
    } catch (fallbackErr) {
      console.error('Could not save users to LocalStorage even after cleanup. Operating in memory mode.', fallbackErr);
      window.dispatchEvent(new CustomEvent('campaign_data_changed'));
    }
  }
}

// Remove dataUrls (base64) dos documentos antes de enviar ao Supabase
// para evitar payloads gigantes que causam "context deadline exceeded"
function stripDocumentDataUrls(documents: CampaignUser['documents']): CampaignUser['documents'] {
  if (!documents) return documents;
  const stripped: typeof documents = {} as typeof documents;
  (Object.keys(documents) as Array<keyof typeof documents>).forEach((key) => {
    const doc = documents[key];
    if (doc) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { dataUrl: _omitted, ...docMeta } = doc as any;
      (stripped as any)[key] = docMeta;
    }
  });
  return stripped;
}

export async function syncUserToSupabase(user: CampaignUser): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('campaign_users').upsert({
      id: user.id,
      full_name: user.fullName,
      role: user.role,
      coordinator_name: user.coordinatorName || null,
      deputado_estadual: user.deputadoEstadual || null,
      social_media: user.socialMedia || null,
      pix_key: user.pixKey,
      whatsapp: user.whatsapp,
      address: user.address,
      electoral_zone: user.electoralZone,
      registered_by: user.registeredBy || 'Próprio',
      registration_type: user.registrationType || 'PROPRIO',
      ip_address: user.ipAddress || 'Não identificado',
      status: user.status,
      documents: stripDocumentDataUrls(user.documents) as any,
      updated_at: new Date().toISOString()
    });
    if (error) {
      console.warn('Erro ao sincronizar usuário com o Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.warn('Timeout ao sincronizar usuário com Supabase (context deadline exceeded). Operando em modo local.');
    } else {
      console.error('Falha na conexão com Supabase:', err);
    }
    return false;
  }
}

export async function fetchUsersFromSupabase(): Promise<CampaignUser[]> {
  if (!isSupabaseConfigured) return getUsers();
  try {
    const { data, error } = await supabase
      .from('campaign_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erro ao carregar usuários do Supabase:', error.message);
      return getUsers();
    }

    if (data && Array.isArray(data)) {
      const localUsers = getUsers();
      const localMap = new Map<string, CampaignUser>();
      localUsers.forEach(u => localMap.set(u.id, u));

      const remoteUsers: CampaignUser[] = data.map((row: any) => {
        const localUser = localMap.get(row.id);
        const docs = row.documents || {};

        if (localUser?.documents) {
          (Object.keys(localUser.documents) as Array<keyof typeof localUser.documents>).forEach(k => {
            if (localUser.documents[k]?.dataUrl && !docs[k]?.dataUrl) {
              docs[k] = { ...docs[k], dataUrl: localUser.documents[k]?.dataUrl };
            }
          });
        }

        return {
          id: row.id,
          fullName: row.full_name || '',
          role: (row.role === 'Equipe de rua' ? 'Divulgador' : row.role) as CampaignRole,
          coordinatorName: row.coordinator_name || undefined,
          deputadoEstadual: row.deputado_estadual || undefined,
          socialMedia: row.social_media || undefined,
          pixKey: row.pix_key || '',
          whatsapp: row.whatsapp || '',
          address: row.address || '',
          electoralZone: (row.electoral_zone || '176') as ElectoralZone,
          registeredBy: row.registered_by || 'Próprio',
          registrationType: (row.registration_type || 'PROPRIO') as 'PROPRIO' | 'TERCEIROS',
          ipAddress: row.ip_address || 'Não registrado',
          status: (row.status || 'PENDENTE') as any,
          syncedToCloud: true,
          createdAt: row.created_at || new Date().toISOString(),
          updatedAt: row.updated_at || new Date().toISOString(),
          documents: docs
        };
      });

      // Ordenação estática e determinística por data de criação decrescente
      remoteUsers.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
        if (timeA !== timeB) return timeB - timeA;
        return b.id.localeCompare(a.id);
      });

      inMemoryUsersCache = remoteUsers;
      try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(remoteUsers));
      } catch (e) {
        console.warn('Erro ao salvar em localStorage:', e);
      }
      return remoteUsers;
    }
  } catch (err) {
    console.error('Falha ao consultar cadastros no Supabase:', err);
  }
  return getUsers();
}

export function saveUser(newUser: CampaignUser): void {
  const users = getUsers();
  const existingIdx = users.findIndex(u => u.id === newUser.id);
  if (existingIdx >= 0) {
    users[existingIdx] = newUser;
  } else {
    users.unshift(newUser);
  }
  saveUsers(users);
  
  if (isSupabaseConfigured) {
    syncUserToSupabase(newUser).then(success => {
      if (success) {
        newUser.syncedToCloud = true;
        saveUsers(getUsers());
      }
    });
  }

  const registeredByText = newUser.registrationType === 'TERCEIROS' 
    ? `cadastrado por "${newUser.registeredBy || 'Terceiro'}"` 
    : 'cadastro próprio';

  addAuditLog({
    actor: newUser.registeredBy && newUser.registeredBy !== 'Próprio' ? newUser.registeredBy : 'Formulário Público',
    action: 'Novo Cadastro Efetuado',
    details: `Novo cadastro efetuado para "${newUser.fullName}" (${newUser.role}, Zona ${newUser.electoralZone}, ${registeredByText}). IP: ${newUser.ipAddress || 'N/I'}.`,
    category: 'CADASTRO'
  });
}

export function deleteUser(userId: string): void {
  let users = getUsers();
  const target = users.find(u => u.id === userId);
  users = users.filter(u => u.id !== userId);
  saveUsers(users);

  if (isSupabaseConfigured) {
    Promise.resolve(supabase.from('campaign_users').delete().eq('id', userId))
      .then(({ error }) => {
        if (error) console.warn('Erro ao deletar usuário no Supabase:', error.message);
      })
      .catch((err: any) => {
        if (err?.name === 'AbortError') {
          console.warn('Timeout ao deletar usuário no Supabase (context deadline exceeded). Operando em modo local.');
        } else {
          console.error('Falha ao deletar no Supabase:', err);
        }
      });
  }

  if (target) {
    addAuditLog({
      actor: 'Administrador',
      action: 'Exclusão de Cadastro',
      details: `O registro do usuário "${target.fullName}" (ID: ${target.id}) foi excluído.`,
      category: 'SEGURANCA'
    });
  }
}

export function getLogs(): AuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_LOGS;
  }
}

export function addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
  try {
    const logs = getLogs();
    const newEntry: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(0, 300))); // keep up to 300 logs
    
    if (isSupabaseConfigured) {
      Promise.resolve(supabase.from('audit_logs').insert({
        id: newEntry.id,
        action: newEntry.action,
        details: newEntry.details,
        user_name: newEntry.actor,
        timestamp: newEntry.timestamp
      }))
        .then(({ error }) => {
          if (error) console.warn('Erro ao salvar log no Supabase:', error.message);
        })
        .catch((err: any) => {
          if (err?.name === 'AbortError') {
            console.warn('Timeout ao salvar log no Supabase (context deadline exceeded). Log salvo localmente.');
          } else {
            console.error('Falha ao salvar log no Supabase:', err);
          }
        });
    }

    window.dispatchEvent(new CustomEvent('campaign_data_changed'));
  } catch (err) {
    console.error('Error adding audit log:', err);
  }
}

export function clearLogs(): void {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
  addAuditLog({
    actor: 'Administrador',
    action: 'Limpeza de Histórico',
    details: 'O histórico de logs do sistema foi resetado.',
    category: 'SISTEMA'
  });
}

export function getAdminPassword(): string {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_PASS) || 'admin123';
}

export function setAdminPassword(newPassword: string): void {
  localStorage.setItem(STORAGE_KEYS.ADMIN_PASS, newPassword);
  addAuditLog({
    actor: 'Administrador',
    action: 'Alteração de Senha',
    details: 'A senha de acesso administrativo foi alterada com sucesso.',
    category: 'SEGURANCA'
  });
}

export function getPermissions(): SystemPermissions[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(DEFAULT_PERMISSIONS));
      return DEFAULT_PERMISSIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return DEFAULT_PERMISSIONS;
  }
}

export function savePermissions(permissions: SystemPermissions[]): void {
  localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissions));
  addAuditLog({
    actor: 'Administrador',
    action: 'Matriz de Permissões Atualizada',
    details: 'Níveis de permissão e privilégios do sistema foram modificados.',
    category: 'PERMISSAO'
  });
}

export function getSyncState(): CloudSyncState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC);
    const users = getUsers();
    const unsynced = users.filter(u => !u.syncedToCloud).length;

    if (!raw) {
      return {
        isOnline: true,
        lastSyncedAt: new Date().toISOString(),
        pendingCount: unsynced,
        syncing: false
      };
    }
    const state = JSON.parse(raw);
    return {
      ...state,
      isOnline: true,
      pendingCount: unsynced
    };
  } catch (err) {
    return {
      isOnline: true,
      lastSyncedAt: new Date().toISOString(),
      pendingCount: 0,
      syncing: false
    };
  }
}

export function saveSyncState(state: CloudSyncState): void {
  localStorage.setItem(STORAGE_KEYS.SYNC, JSON.stringify(state));
}

