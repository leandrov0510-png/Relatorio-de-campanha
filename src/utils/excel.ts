import * as XLSX from 'xlsx';
import { CampaignUser, AuditLog } from '../types';

export function exportUsersToExcel(users: CampaignUser[], logs: AuditLog[]) {
  // 1. Sheet of Registered Users
  const userRows = users.map((u) => {
    const hasRg = u.documents.rg ? 'Anexado' : 'Ausente';
    const hasTitulo = u.documents.titulo ? 'Anexado' : 'Ausente';
    const hasCnh = u.documents.cnh ? 'Anexado' : 'Não exigido/Ausente';
    const hasDocVeic = u.documents.docVeicular ? 'Anexado' : 'Não exigido/Ausente';

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
      'RG': hasRg,
      'Título de Eleitor': hasTitulo,
      'CNH (Motoristas)': hasCnh,
      'Doc. Veicular (Motoristas)': hasDocVeic,
      'Status': u.status,
      'Sincronizado Nuvem': u.syncedToCloud ? 'SIM' : 'NÃO',
      'Data de Cadastro': new Date(u.createdAt).toLocaleString('pt-BR'),
    };
  });

  // 2. Sheet of Document Inventory Details
  const docRows: any[] = [];
  users.forEach((u) => {
    Object.entries(u.documents).forEach(([docKey, doc]) => {
      if (doc) {
        docRows.push({
          'ID do Usuário': u.id,
          'Nome Usuário': u.fullName,
          'Tipo do Documento': doc.type,
          'Nome do Arquivo': doc.name,
          'Formato': doc.fileType,
          'Data de Envio': new Date(doc.uploadedAt).toLocaleString('pt-BR'),
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
    { wch: 15 }, { wch: 30 }, { wch: 18 }, { wch: 15 },
    { wch: 25 }, { wch: 18 }, { wch: 35 }, { wch: 12 },
    { wch: 18 }, { wch: 22 }, { wch: 25 }, { wch: 15 },
    { wch: 18 }, { wch: 20 }
  ];

  XLSX.utils.book_append_sheet(wb, wsUsers, 'Usuários Cadastrados');
  XLSX.utils.book_append_sheet(wb, wsDocs, 'Inventário de Anexos');
  XLSX.utils.book_append_sheet(wb, wsLogs, 'Logs do Sistema');

  const nowStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Backup_Campanha_Documentos_${nowStr}.xlsx`);
}
