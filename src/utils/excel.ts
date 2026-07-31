import * as XLSX from 'xlsx';
import { CampaignUser, AuditLog } from '../types';

function buildDocUrl(userId: string, docType: string, dataUrl?: string): string {
  if (!dataUrl) return '';
  if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
    return dataUrl;
  }
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://relatorio-de-campanha.vercel.app';
  return `${appOrigin}/?userId=${encodeURIComponent(userId)}&doc=${encodeURIComponent(docType)}`;
}

export function exportUsersToExcel(users: CampaignUser[], logs: AuditLog[]) {
  // 1. Sheet of Registered Users with Clickable Document Hyperlinks
  const userRows = users.map((u) => {
    const rgUrl = u.documents.rg?.dataUrl ? buildDocUrl(u.id, 'RG', u.documents.rg.dataUrl) : '';
    const tituloUrl = u.documents.titulo?.dataUrl ? buildDocUrl(u.id, 'TITULO', u.documents.titulo.dataUrl) : '';
    const cnhUrl = u.documents.cnh?.dataUrl ? buildDocUrl(u.id, 'CNH', u.documents.cnh.dataUrl) : '';
    const docVeicUrl = u.documents.docVeicular?.dataUrl ? buildDocUrl(u.id, 'DOC_VEICULAR', u.documents.docVeicular.dataUrl) : '';
    const compEndUrl = u.documents.comprovanteEndereco?.dataUrl ? buildDocUrl(u.id, 'COMPROVANTE_ENDERECO', u.documents.comprovanteEndereco.dataUrl) : '';

    return {
      'ID do Cadastro': u.id,
      'Nome Completo': u.fullName,
      'Função': u.role,
      'Coordenador Responsável': u.coordinatorName || 'Não informado',
      'Deputado Estadual': u.deputadoEstadual || 'Não informado',
      'Rede Social': u.socialMedia || 'Não informado',
      'Zona Eleitoral': u.electoralZone,
      'Chave PIX': u.pixKey,
      'WhatsApp': u.whatsapp,
      'Endereço Completo': u.address,
      'Cadastrado Por': u.registeredBy || 'Próprio',
      'Tipo de Cadastro': u.registrationType === 'TERCEIROS' ? 'Por Terceiros' : 'Próprio Titular',
      'IP de Origem': u.ipAddress || 'Não registrado',
      'Status': u.status,
      'Sincronizado Nuvem': u.syncedToCloud ? 'SIM' : 'NÃO',
      'Link Documento RG': rgUrl ? { f: `HYPERLINK("${rgUrl}", "🔗 Abrir RG")` } : 'Sem Anexo',
      'Link Título Eleitor': tituloUrl ? { f: `HYPERLINK("${tituloUrl}", "🔗 Abrir Título")` } : 'Sem Anexo',
      'Link CNH (Motorista)': cnhUrl ? { f: `HYPERLINK("${cnhUrl}", "🔗 Abrir CNH")` } : 'Sem Anexo',
      'Link Doc. Veicular': docVeicUrl ? { f: `HYPERLINK("${docVeicUrl}", "🔗 Abrir Doc Veicular")` } : 'Sem Anexo',
      'Link Comprovante Endereço': compEndUrl ? { f: `HYPERLINK("${compEndUrl}", "🔗 Abrir Comprovante")` } : 'Sem Anexo',
      'Data de Cadastro': new Date(u.createdAt).toLocaleString('pt-BR'),
    };
  });

  // 2. Sheet of Document Inventory Details with Hyperlinks
  const docRows: any[] = [];
  users.forEach((u) => {
    Object.entries(u.documents).forEach(([docKey, doc]) => {
      if (doc && doc.dataUrl) {
        const docUrl = buildDocUrl(u.id, doc.type, doc.dataUrl);
        docRows.push({
          'ID do Usuário': u.id,
          'Nome Usuário': u.fullName,
          'Tipo do Documento': doc.type,
          'Nome do Arquivo': doc.name,
          'Formato': doc.fileType,
          'Data de Envio': new Date(doc.uploadedAt).toLocaleString('pt-BR'),
          'Visualizar Documento (Hiperlink)': { f: `HYPERLINK("${docUrl}", "🔗 Clique para Visualizar Documento (${doc.type})")` },
          'Tamanho do Arquivo (aprox)': doc.dataUrl.length > 0 ? `${Math.round(doc.dataUrl.length / 1024)} KB` : 'N/A'
        });
      }
    });
  });

  // 3. Sheet of System Logs
  const logRows = logs.map((l) => ({
    'Data/Hora': new Date(l.timestamp).toLocaleString('pt-BR'),
    'Categoria': l.category,
    'Usuário/Ator': l.actor,
    'Ação': l.action,
    'Detalhes': l.details
  }));

  const wb = XLSX.utils.book_new();

  // Create worksheets
  const wsUsers = XLSX.utils.json_to_sheet(userRows);
  const wsDocs = XLSX.utils.json_to_sheet(docRows.length > 0 ? docRows : [{ Mensagem: 'Nenhum documento anexado' }]);
  const wsLogs = XLSX.utils.json_to_sheet(logRows);

  // Set column widths
  wsUsers['!cols'] = [
    { wch: 15 }, { wch: 30 }, { wch: 18 }, { wch: 22 },
    { wch: 22 }, { wch: 20 }, { wch: 15 }, { wch: 25 },
    { wch: 18 }, { wch: 35 }, { wch: 18 }, { wch: 18 },
    { wch: 18 }, { wch: 15 }, { wch: 18 }, { wch: 22 },
    { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 22 },
    { wch: 20 }
  ];

  if (docRows.length > 0) {
    wsDocs['!cols'] = [
      { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 30 },
      { wch: 12 }, { wch: 22 }, { wch: 45 }, { wch: 20 }
    ];
  }

  XLSX.utils.book_append_sheet(wb, wsUsers, 'Usuários Cadastrados');
  XLSX.utils.book_append_sheet(wb, wsDocs, 'Inventário de Anexos');
  XLSX.utils.book_append_sheet(wb, wsLogs, 'Logs do Sistema');

  const nowStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Backup_Campanha_Documentos_${nowStr}.xlsx`);
}
