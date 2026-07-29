import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  CreditCard,
  MapPin,
  Vote,
  Briefcase,
  FileCheck,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Info,
  Car,
  UserCheck,
  Building2,
  Share2
} from 'lucide-react';
import { CampaignRole, ElectoralZone, DocumentAttachment, CampaignUser } from '../types';
import { CameraModal } from './CameraModal';
import { saveUser, addAuditLog } from '../utils/storage';

interface RegistrationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: CampaignUser) => void;
}

export const RegistrationFormModal: React.FC<RegistrationFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<CampaignRole>('Divulgador');
  const [coordinatorName, setCoordinatorName] = useState('');
  const [deputadoEstadual, setDeputadoEstadual] = useState('');
  const [socialMedia, setSocialMedia] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [electoralZone, setElectoralZone] = useState<ElectoralZone>('176');

  // Attached Documents
  const [rgDoc, setRgDoc] = useState<DocumentAttachment | null>(null);
  const [tituloDoc, setTituloDoc] = useState<DocumentAttachment | null>(null);
  const [cnhDoc, setCnhDoc] = useState<DocumentAttachment | null>(null);
  const [docVeicular, setDocVeicular] = useState<DocumentAttachment | null>(null);
  const [comprovanteEndDoc, setComprovanteEndDoc] = useState<DocumentAttachment | null>(null);

  // Camera Modal State
  const [cameraModalTarget, setCameraModalTarget] = useState<'RG' | 'TITULO' | 'CNH' | 'DOC_VEICULAR' | 'COMPROVANTE_ENDERECO' | null>(null);

  if (!isOpen) return null;

  const isDriver = role === 'Motorista';

  // Validation checks - Basic fields are required, documents recommended
  const isNameValid = fullName.trim().split(' ').filter(Boolean).length >= 2;
  const isPixValid = pixKey.trim().length >= 3;
  const isWhatsappValid = whatsapp.replace(/\D/g, '').length >= 10;
  const isAddressValid = address.trim().length >= 5;

  const isFormComplete = isNameValid && isPixValid && isWhatsappValid && isAddressValid;

  const handleWhatsappChange = (value: string) => {
    // Auto format whatsapp mask (XX) XXXXX-XXXX
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) {
      setWhatsapp(digits ? `(${digits}` : '');
    } else if (digits.length <= 7) {
      setWhatsapp(`(${digits.slice(0, 2)}) ${digits.slice(2)}`);
    } else {
      setWhatsapp(`(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`);
    }
  };

  const handleCaptureDoc = (
    type: 'RG' | 'TITULO' | 'CNH' | 'DOC_VEICULAR' | 'COMPROVANTE_ENDERECO',
    fileData: { name: string; dataUrl: string; fileType: 'image' | 'pdf' }
  ) => {
    const docObj: DocumentAttachment = {
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      name: fileData.name,
      dataUrl: fileData.dataUrl,
      fileType: fileData.fileType,
      uploadedAt: new Date().toISOString(),
    };

    if (type === 'RG') setRgDoc(docObj);
    if (type === 'TITULO') setTituloDoc(docObj);
    if (type === 'CNH') setCnhDoc(docObj);
    if (type === 'DOC_VEICULAR') setDocVeicular(docObj);
    if (type === 'COMPROVANTE_ENDERECO') setComprovanteEndDoc(docObj);
  };

  const resetForm = () => {
    setFullName('');
    setRole('Divulgador');
    setCoordinatorName('');
    setDeputadoEstadual('');
    setSocialMedia('');
    setPixKey('');
    setWhatsapp('');
    setAddress('');
    setElectoralZone('176');
    setRgDoc(null);
    setTituloDoc(null);
    setCnhDoc(null);
    setDocVeicular(null);
    setComprovanteEndDoc(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete) return;

    const newUser: CampaignUser = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: fullName.trim(),
      role,
      coordinatorName: coordinatorName.trim() || undefined,
      deputadoEstadual: deputadoEstadual.trim() || undefined,
      socialMedia: socialMedia.trim() || undefined,
      pixKey: pixKey.trim(),
      whatsapp: whatsapp.trim(),
      address: address.trim(),
      electoralZone,
      status: 'PENDENTE',
      syncedToCloud: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: {
        rg: rgDoc || undefined,
        titulo: tituloDoc || undefined,
        cnh: cnhDoc || undefined,
        docVeicular: docVeicular || undefined,
        comprovanteEndereco: comprovanteEndDoc || undefined,
      },
    };

    saveUser(newUser);
    addAuditLog({
      actor: newUser.fullName,
      action: 'Novo Cadastramento Efetuado',
      details: `Novo cadastro efetuado para "${newUser.fullName}" (${newUser.role}, Zona ${newUser.electoralZone}). Status: PENDENTE de aprovação.`,
      category: 'CADASTRO',
    });

    onSuccess(newUser);
    resetForm();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-white/15 my-auto flex flex-col max-h-[92vh] text-slate-100">
          {/* Top Banner */}
          <div className="bg-white/5 backdrop-blur-md text-white px-6 py-5 flex items-center justify-between border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full text-blue-300 text-xs font-semibold mb-1 border border-blue-400/30">
                <FileCheck className="w-3.5 h-3.5" /> Formulário de Fichamento Eleitoral
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Cadastrar Documentos de Campanha
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Preencha todos os metadados requeridos e anexe os documentos legíveis.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-950/40">
            {/* Driver Alert Notice */}
            {isDriver && (
              <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 text-amber-200 text-xs flex items-start gap-3 shadow-lg">
                <div className="p-2 bg-amber-500/20 rounded-xl text-amber-300 shrink-0 border border-amber-400/30">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-amber-200">Atenção para Função Motorista</h4>
                  <p className="mt-0.5 text-amber-300/90">
                    A função <strong className="underline">Motorista</strong> exige obrigatoriamente o envio da{' '}
                    <strong>CNH ativa</strong> e do <strong>Documento Veicular (CRLV)</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Section 1: Dados Pessoais */}
            <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                <User className="w-4 h-4 text-blue-400" />
                1. Identificação do Integrante
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome Completo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome Completo <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: João da Silva Santos"
                      className={`w-full pl-9 pr-3 py-2.5 bg-white/5 backdrop-blur-md border text-sm rounded-xl text-white placeholder-slate-400 focus:outline-none transition-all ${
                        fullName && !isNameValid
                          ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/30'
                          : 'border-white/15 focus:border-blue-400'
                      }`}
                      required
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  {fullName && !isNameValid && (
                    <p className="text-[11px] text-rose-400 mt-1">Informe nome e sobrenome completo.</p>
                  )}
                </div>

                {/* Função */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Função na Campanha <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as CampaignRole)}
                      className="w-full pl-9 pr-8 py-2.5 bg-slate-900 border border-white/15 text-sm text-white rounded-xl focus:border-blue-400 focus:outline-none appearance-none transition-all"
                    >
                      <option value="Divulgador">Divulgador</option>
                      <option value="Coordenador">Coordenador</option>
                      <option value="Liderança">Liderança</option>
                      <option value="Motorista">Motorista (Exige CNH + Veicular)</option>
                    </select>
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Coordenador Responsável */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Coordenador Responsável <span className="text-slate-400 font-normal">(Preenchimento manual)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={coordinatorName}
                      onChange={(e) => setCoordinatorName(e.target.value)}
                      placeholder="Nome do Coordenador"
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 backdrop-blur-md border border-white/15 text-sm text-white placeholder-slate-400 rounded-xl focus:border-blue-400 focus:outline-none transition-all"
                    />
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Deputado Estadual */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Deputado Estadual <span className="text-slate-400 font-normal">(Preenchimento manual)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={deputadoEstadual}
                      onChange={(e) => setDeputadoEstadual(e.target.value)}
                      placeholder="Nome do Deputado Estadual"
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 backdrop-blur-md border border-white/15 text-sm text-white placeholder-slate-400 rounded-xl focus:border-blue-400 focus:outline-none transition-all"
                    />
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Rede Social */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rede Social <span className="text-slate-400 font-normal">(Preenchimento manual - Instagram/Facebook/etc)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={socialMedia}
                      onChange={(e) => setSocialMedia(e.target.value)}
                      placeholder="@usuario ou link do perfil"
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 backdrop-blur-md border border-white/15 text-sm text-white placeholder-slate-400 rounded-xl focus:border-blue-400 focus:outline-none transition-all"
                    />
                    <Share2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Chave Pix */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Chave Pix para Pagamento <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      placeholder="CPF, Telefone, E-mail ou Chave Aleatória"
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 backdrop-blur-md border border-white/15 text-sm text-white placeholder-slate-400 rounded-xl focus:border-blue-400 focus:outline-none transition-all"
                      required
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Contato Whatsapp */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contato WhatsApp <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => handleWhatsappChange(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 backdrop-blur-md border border-white/15 text-sm text-white placeholder-slate-400 rounded-xl focus:border-blue-400 focus:outline-none transition-all"
                      required
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Endereço Completo */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Endereço Completo (Rua, Nº, Bairro, Cidade/UF) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ex: Av. Brasil, 500, Apt 12 - Bairro Centro, São Paulo / SP"
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 backdrop-blur-md border border-white/15 text-sm text-white placeholder-slate-400 rounded-xl focus:border-blue-400 focus:outline-none transition-all"
                      required
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Zona Eleitoral */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Zona Eleitoral <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={electoralZone}
                      onChange={(e) => setElectoralZone(e.target.value as ElectoralZone)}
                      className="w-full pl-9 pr-8 py-2.5 bg-slate-900 border border-white/15 text-sm text-blue-300 rounded-xl focus:border-blue-400 focus:outline-none appearance-none transition-all font-semibold"
                    >
                      <option value="176">Zona 176</option>
                      <option value="185">Zona 185</option>
                      <option value="276">Zona 276</option>
                      <option value="278">Zona 278</option>
                      <option value="279">Zona 279</option>
                      <option value="393">Zona 393</option>
                      <option value="395">Zona 395</option>
                    </select>
                    <Vote className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Anexos de Documentos */}
            <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-400" />
                  2. Anexar Documentos Pessoais
                </h3>
                <span className="text-[11px] text-slate-400">
                  Tirar foto, galeria ou PDF
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Anexar RG */}
                <DocumentUploadCard
                  title="RG (Registro Geral)"
                  isRequired={false}
                  doc={rgDoc}
                  onOpenModal={() => setCameraModalTarget('RG')}
                  onRemove={() => setRgDoc(null)}
                />

                {/* 2. Anexar Título */}
                <DocumentUploadCard
                  title="Título de Eleitor"
                  isRequired={false}
                  doc={tituloDoc}
                  onOpenModal={() => setCameraModalTarget('TITULO')}
                  onRemove={() => setTituloDoc(null)}
                />

                {/* 3. Anexar CNH */}
                <DocumentUploadCard
                  title="CNH (Carteira de Habilitação)"
                  isRequired={false}
                  isDriverSpecific={true}
                  doc={cnhDoc}
                  onOpenModal={() => setCameraModalTarget('CNH')}
                  onRemove={() => setCnhDoc(null)}
                />

                {/* 4. Anexar Documento Veicular */}
                <DocumentUploadCard
                  title="Documento Veicular (CRLV)"
                  isRequired={false}
                  isDriverSpecific={true}
                  doc={docVeicular}
                  onOpenModal={() => setCameraModalTarget('DOC_VEICULAR')}
                  onRemove={() => setDocVeicular(null)}
                />

                {/* 5. Anexar Comprovante de Endereço */}
                <DocumentUploadCard
                  title="Comprovante de Endereço"
                  isRequired={false}
                  doc={comprovanteEndDoc}
                  onOpenModal={() => setCameraModalTarget('COMPROVANTE_ENDERECO')}
                  onRemove={() => setComprovanteEndDoc(null)}
                />
              </div>
            </div>

            {/* Validation Checklist Box */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-xs">
              <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-400" /> Status de Validação do Formulário:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                <span className={`flex items-center gap-1.5 ${isNameValid ? 'text-emerald-300 font-medium' : ''}`}>
                  {isNameValid ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                  Nome completo (Mínimo 2 palavras)
                </span>
                <span className={`flex items-center gap-1.5 ${isPixValid && isWhatsappValid ? 'text-emerald-300 font-medium' : ''}`}>
                  {isPixValid && isWhatsappValid ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                  Chave Pix & WhatsApp preenchidos
                </span>
                <span className={`flex items-center gap-1.5 ${isAddressValid ? 'text-emerald-300 font-medium' : ''}`}>
                  {isAddressValid ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                  Endereço informado
                </span>
                <span className={`flex items-center gap-1.5 ${rgDoc || tituloDoc || comprovanteEndDoc ? 'text-emerald-300 font-medium' : 'text-slate-400'}`}>
                  {rgDoc || tituloDoc || comprovanteEndDoc ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <Info className="w-4 h-4 text-blue-400 shrink-0" />}
                  {rgDoc || tituloDoc || comprovanteEndDoc ? 'Documentos anexados' : 'Documentos (Opcionais no envio)'}
                </span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto py-3 px-5 rounded-xl border border-white/15 bg-white/5 text-slate-300 font-medium text-sm hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isFormComplete}
                className={`w-full sm:w-auto py-3 px-8 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${
                  isFormComplete
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25 border border-emerald-300/40 active:scale-98 cursor-pointer'
                    : 'bg-white/10 text-slate-500 cursor-not-allowed border border-white/5 shadow-none'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                Concluir Cadastro
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Camera & File Attachment Modal */}
      {cameraModalTarget && (
        <CameraModal
          isOpen={true}
          docTitle={
            cameraModalTarget === 'RG'
              ? 'RG'
              : cameraModalTarget === 'TITULO'
              ? 'Título de Eleitor'
              : cameraModalTarget === 'CNH'
              ? 'CNH'
              : cameraModalTarget === 'DOC_VEICULAR'
              ? 'Documento Veicular'
              : 'Comprovante de Endereço'
          }
          onClose={() => setCameraModalTarget(null)}
          onCapture={(fileData) => handleCaptureDoc(cameraModalTarget, fileData)}
        />
      )}
    </>
  );
};

interface DocumentUploadCardProps {
  title: string;
  isRequired: boolean;
  isDriverSpecific?: boolean;
  doc: DocumentAttachment | null;
  onOpenModal: () => void;
  onRemove: () => void;
}

const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  title,
  isRequired,
  isDriverSpecific = false,
  doc,
  onOpenModal,
  onRemove,
}) => {
  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        doc
          ? 'bg-emerald-500/10 border-emerald-500/30 backdrop-blur-md'
          : isRequired
          ? 'bg-amber-500/10 border-amber-500/30 backdrop-blur-md'
          : 'bg-white/5 border-white/10 backdrop-blur-md'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="text-xs font-bold text-white flex items-center gap-1">
            {title}
            {isRequired ? (
              <span className="text-rose-400 font-bold">*</span>
            ) : (
              <span className="text-[10px] text-slate-400 font-normal">(Opcional)</span>
            )}
          </h4>
          {isDriverSpecific && isRequired && (
            <span className="text-[10px] text-amber-300 font-medium">Exigido para Motorista</span>
          )}
        </div>

        {doc ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Anexado
          </span>
        ) : (
          <span className="text-[10px] text-slate-400">Pendente</span>
        )}
      </div>

      {doc ? (
        <div className="mt-2 bg-white/5 backdrop-blur-md p-2.5 rounded-xl border border-emerald-400/30 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-bold text-xs shrink-0">
              {doc.fileType === 'pdf' ? 'PDF' : 'IMG'}
            </div>
            <div className="truncate text-xs">
              <p className="font-semibold text-white truncate">{doc.name}</p>
              <p className="text-[10px] text-slate-400">
                {new Date(doc.uploadedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/20 px-2 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Remover
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenModal}
          className="w-full mt-2 py-2 px-3 bg-white/10 hover:bg-white/20 text-blue-300 border border-white/15 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5 text-blue-400" />
          Anexar (Câmera / Arquivo)
        </button>
      )}
    </div>
  );
};
