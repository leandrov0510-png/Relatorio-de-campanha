import { CampaignUser, AuditLog, SystemPermissions, CloudSyncState, ElectoralZone, CampaignRole, DocumentAttachment } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  USERS: 'campanha_doc_users_v1',
  LOGS: 'campanha_doc_logs_v1',
  ADMIN_PASS: 'campanha_admin_pass_v1',
  PERMISSIONS: 'campanha_permissions_v1',
  SYNC: 'campanha_cloud_sync_v1',
  DELETED_USER_IDS: 'campanha_deleted_user_ids_v1',
};

export function getDeletedUserIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_USER_IDS);
    if (!raw) return new Set<string>();
    const parsed: string[] = JSON.parse(raw);
    return new Set(parsed);
  } catch {
    return new Set<string>();
  }
}

export function registerDeletedUserId(userId: string): void {
  try {
    const set = getDeletedUserIds();
    set.add(userId);
    localStorage.setItem(STORAGE_KEYS.DELETED_USER_IDS, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.error('Error saving deleted user ID:', err);
  }
}

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
    electoralZone: '394',
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
    const deletedIds = getDeletedUserIds();
    if (inMemoryUsersCache && inMemoryUsersCache.length > 0) {
      return inMemoryUsersCache.filter(u => !deletedIds.has(u.id));
    }
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      const initial = SAMPLE_USERS.filter(u => !deletedIds.has(u.id));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initial));
      inMemoryUsersCache = initial;
      return initial;
    }
    const parsed: CampaignUser[] = JSON.parse(raw);
    const normalized = parsed
      .filter(u => !deletedIds.has(u.id))
      .map(u => ({
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
    const deletedIds = getDeletedUserIds();
    return (inMemoryUsersCache || SAMPLE_USERS).filter(u => !deletedIds.has(u.id));
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

// Converte dataUrl base64 em Blob para upload no Supabase Storage
function base64ToBlob(base64DataUrl: string): { blob: Blob; contentType: string } | null {
  try {
    const parts = base64DataUrl.split(',');
    if (parts.length < 2) return null;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const contentType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return { blob: new Blob([u8arr], { type: contentType }), contentType };
  } catch (e) {
    console.warn('Erro ao converter base64 para Blob:', e);
    return null;
  }
}

// Upload individual de arquivo de documento para o Supabase Storage Bucket ('documents')
export async function uploadDocumentFileToSupabaseStorage(
  userId: string,
  docKey: string,
  doc: DocumentAttachment
): Promise<DocumentAttachment> {
  if (!isSupabaseConfigured || !doc || !doc.dataUrl) return doc;

  // Se já for uma URL pública HTTP/HTTPS, não faz upload novamente
  if (doc.dataUrl.startsWith('http://') || doc.dataUrl.startsWith('https://')) {
    return doc;
  }

  // Se for base64 dataUrl
  if (doc.dataUrl.startsWith('data:')) {
    const converted = base64ToBlob(doc.dataUrl);
    if (!converted) return doc;

    const fileExt = doc.fileType === 'pdf' ? 'pdf' : 'jpg';
    const cleanFileName = (doc.name || `${docKey}.${fileExt}`)
      .replace(/[^a-zA-Z0-9_.-]/g, '_');
    const filePath = `${userId}/${docKey}_${cleanFileName}`;

    try {
      const { error: uploadErr } = await supabase.storage
        .from('documents')
        .upload(filePath, converted.blob, {
          contentType: converted.contentType,
          upsert: true,
        });

      if (uploadErr) {
        console.warn(`[Supabase Storage] Erro ao enviar documento ${docKey}:`, uploadErr.message);
        return doc;
      }

      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      if (publicUrlData && publicUrlData.publicUrl) {
        console.log(`[Supabase Storage] Documento ${docKey} salvo na nuvem com sucesso:`, publicUrlData.publicUrl);
        return {
          ...doc,
          dataUrl: publicUrlData.publicUrl,
        };
      }
    } catch (err) {
      console.warn(`[Supabase Storage] Exceção ao enviar documento ${docKey}:`, err);
    }
  }

  return doc;
}

export async function processAndUploadUserDocuments(user: CampaignUser): Promise<CampaignUser['documents']> {
  if (!user.documents) return user.documents;
  const docs = { ...user.documents };
  const keys = Object.keys(docs) as Array<keyof typeof docs>;

  for (const key of keys) {
    const doc = docs[key];
    if (doc && doc.dataUrl) {
      const updatedDoc = await uploadDocumentFileToSupabaseStorage(user.id, key, doc);
      docs[key] = updatedDoc;
    }
  }
  return docs;
}

export async function syncUserToSupabase(user: CampaignUser): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    // 1. Fazer upload dos documentos em base64 para o Supabase Storage Bucket ('documents')
    const uploadedDocs = await processAndUploadUserDocuments(user);
    user.documents = uploadedDocs;

    // 2. Prepara objeto de documentos para a tabela SQL com URLs HTTP públicas curtas
    const docsForDb: Record<string, any> = {};
    if (uploadedDocs) {
      (Object.keys(uploadedDocs) as Array<keyof typeof uploadedDocs>).forEach((k) => {
        const d = uploadedDocs[k];
        if (d) {
          const isBase64 = d.dataUrl && d.dataUrl.startsWith('data:');
          docsForDb[k] = {
            ...d,
            dataUrl: isBase64 ? undefined : d.dataUrl
          };
        }
      });
    }

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
      documents: docsForDb as any,
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

      // Inclui cadastros locais que ainda não estejam na nuvem ou não sejam dados estáticos
      const sampleIds = new Set(SAMPLE_USERS.map(s => s.id));
      localUsers.forEach(u => {
        if (!remoteUsers.some(r => r.id === u.id) && (!sampleIds.has(u.id) || remoteUsers.length === 0)) {
          remoteUsers.push(u);
          if (isSupabaseConfigured && !u.syncedToCloud) {
            syncUserToSupabase(u).then((success) => {
              if (success) u.syncedToCloud = true;
            });
          }
        }
      });

      // Filtrar permanentemente qualquer usuário presente na lista de exclusão
      const deletedIds = getDeletedUserIds();
      const finalCleanUsers = remoteUsers.filter(r => !deletedIds.has(r.id));

      // Ordenação estática e determinística por data de criação decrescente
      finalCleanUsers.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
        if (timeA !== timeB) return timeB - timeA;
        return b.id.localeCompare(a.id);
      });

      inMemoryUsersCache = finalCleanUsers;
      try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(finalCleanUsers));
      } catch (e) {
        console.warn('Erro ao salvar em localStorage:', e);
      }
      return finalCleanUsers;
    }
  } catch (err) {
    console.error('Falha ao consultar cadastros no Supabase:', err);
  }
  return getUsers();
}

export function broadcastDataChangeSignal(): void {
  if (isSupabaseConfigured) {
    try {
      const channel = supabase.channel('realtime_admin_broadcast');
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'update',
            payload: { timestamp: Date.now() },
          }).then(() => {
            supabase.removeChannel(channel);
          });
        }
      });
    } catch (e) {
      console.warn('Broadcast error:', e);
    }
  }
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

  broadcastDataChangeSignal();
}

export function deleteUser(userId: string): void {
  // 1. Registra o ID no registro permanente de exclusões
  registerDeletedUserId(userId);

  // 2. Limpa do cache em memória
  if (inMemoryUsersCache) {
    inMemoryUsersCache = inMemoryUsersCache.filter(u => u.id !== userId);
  }

  // 3. Remove do localStorage
  let currentUsers = getUsers().filter(u => u.id !== userId);
  saveUsers(currentUsers);

  // 4. Exclui permanentemente do banco do Supabase
  if (isSupabaseConfigured) {
    Promise.resolve(supabase.from('campaign_users').delete().eq('id', userId))
      .then(({ error }) => {
        if (error) console.warn('Erro ao deletar usuário permanentemente no Supabase:', error.message);
        else console.log(`Usuário ${userId} excluído permanentemente da nuvem Supabase.`);
      })
      .catch((err: any) => {
        if (err?.name === 'AbortError') {
          console.warn('Timeout ao deletar no Supabase (context deadline exceeded). Exclusão registrada localmente.');
        } else {
          console.error('Falha ao deletar no Supabase:', err);
        }
      });
  }

  addAuditLog({
    actor: 'Administrador',
    action: 'Exclusão Permanente de Cadastro',
    details: `O registro do usuário (ID: ${userId}) foi excluído permanentemente do sistema.`,
    category: 'SEGURANCA'
  });

  broadcastDataChangeSignal();
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('campaign_data_changed'));
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

export async function fetchAdminPasswordFromSupabase(): Promise<string> {
  const localPass = getAdminPassword();
  if (!isSupabaseConfigured) return localPass;

  try {
    const { data, error } = await (supabase as any)
      .from('system_settings')
      .select('value')
      .eq('key', 'admin_password')
      .single();

    if (!error && data && data.value) {
      const cloudPass = data.value;
      localStorage.setItem(STORAGE_KEYS.ADMIN_PASS, cloudPass);
      return cloudPass;
    }
  } catch (err) {
    console.warn('Erro ao consultar senha de admin no Supabase:', err);
  }

  return localPass;
}

export function getAdminPassword(): string {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_PASS) || 'admin123';
}

export function setAdminPassword(newPassword: string): void {
  localStorage.setItem(STORAGE_KEYS.ADMIN_PASS, newPassword);

  if (isSupabaseConfigured) {
    Promise.resolve(
      (supabase as any).from('system_settings').upsert({
        key: 'admin_password',
        value: newPassword,
        updated_at: new Date().toISOString()
      })
    ).then(({ error }: any) => {
      if (error) {
        console.warn('Erro ao salvar nova senha no Supabase:', error.message);
      } else {
        console.log('Nova senha de admin salva na nuvem Supabase com sucesso.');
      }
    }).catch(err => {
      console.error('Falha ao salvar nova senha no Supabase:', err);
    });
  }

  addAuditLog({
    actor: 'Administrador',
    action: 'Alteração de Senha',
    details: 'A senha de acesso administrativo foi alterada com sucesso e sincronizada com a nuvem.',
    category: 'SEGURANCA'
  });

  broadcastDataChangeSignal();
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

