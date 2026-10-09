/* Dados estáticos e tabelas de configuração usadas pelos módulos. */

const demands = [
  { id: 'DEM-024', subject: 'Documento para assinatura da chefia', ref: 'SIGED · 00000.014582/2026-11', area: 'Protocolo', owner: 'Mariana Costa', initials: 'MC', deadline: 'Hoje', status: 'Prazo próximo', tone: 'late' },
  { id: 'DEM-021', subject: 'Devolução de documento assinado', ref: 'SIGED · 00000.014201/2026-07', area: 'Gabinete', owner: 'Rafael Lima', initials: 'RL', deadline: 'Amanhã', status: 'Em andamento', tone: 'soon' },
  { id: 'DEM-018', subject: 'Providências para agenda institucional', ref: 'SIGED · 00000.013978/2026-32', area: 'Agenda', owner: 'Ana Souza', initials: 'AS', deadline: '02 out', status: 'Em andamento', tone: 'soon' },
  { id: 'DEM-016', subject: 'Conferência de frequência mensal', ref: 'Controle interno · set/2026', area: 'Administrativo', owner: 'João Martins', initials: 'JM', deadline: '05 out', status: 'Aguardando retorno', tone: '' },
  { id: 'DEM-014', subject: 'Organização de pauta de reunião', ref: 'Registro de apoio · 29 set', area: 'Agenda', owner: 'Luiza Alves', initials: 'LA', deadline: 'Concluído', status: 'Concluída', tone: '' }
];

const statusClass = {
  'Em andamento': 's-progress',
  'Aguardando retorno': 's-wait',
  'Concluída': 's-done',
  'Prazo próximo': 's-late'
};

const vocatives = {
  padrao: [
    ['Senhor(a),', 'Senhor(a),'],
    ['Senhor(a) + cargo,', 'Senhor(a) {cargo},'],
    ['Prezada Senhora,', 'Prezada Senhora,'],
    ['Prezado Senhor,', 'Prezado Senhor,']
  ],
  autoridades: [
    ['Excelentíssimo(a) Senhor(a),', 'Excelentíssimo(a) Senhor(a),'],
    ['Excelentíssimo(a) Senhor(a) + cargo,', 'Excelentíssimo(a) Senhor(a) {cargo},'],
    ['Senhor(a) Presidente,', 'Senhor(a) Presidente,'],
    ['Senhor(a) Governador(a),', 'Senhor(a) Governador(a),'],
    ['Senhor(a) Prefeito(a),', 'Senhor(a) Prefeito(a),'],
    ['Senhor(a) Ministro(a),', 'Senhor(a) Ministro(a),'],
    ['Senhor(a) Secretário(a),', 'Senhor(a) Secretário(a),'],
    ['Senhor(a) Diretor(a),', 'Senhor(a) Diretor(a),'],
    ['Senhor(a) Presidente da República,', 'Senhor(a) Presidente da República,'],
    ['Senhor(a) Vice-Presidente da República,', 'Senhor(a) Vice-Presidente da República,'],
    ['Senhor(a) Deputado(a),', 'Senhor(a) Deputado(a),'],
    ['Senhor(a) Senador(a),', 'Senhor(a) Senador(a),'],
    ['Senhor(a) Vereador(a),', 'Senhor(a) Vereador(a),'],
    ['Senhor(a) Parlamentar,', 'Senhor(a) Parlamentar,'],
    ['Senhor(a) Embaixador(a),', 'Senhor(a) Embaixador(a),']
  ],
  justica: [
    ['Senhor(a) Juiz(a),', 'Senhor(a) Juiz(a),'],
    ['Senhor(a) Desembargador(a),', 'Senhor(a) Desembargador(a),'],
    ['Senhor(a) Ministro(a) do Tribunal,', 'Senhor(a) Ministro(a) do Tribunal,'],
    ['Senhor(a) Procurador(a),', 'Senhor(a) Procurador(a),'],
    ['Senhor(a) Promotor(a),', 'Senhor(a) Promotor(a),'],
    ['Senhor(a) Defensor(a) Público(a),', 'Senhor(a) Defensor(a) Público(a),'],
    ['Senhor(a) Conselheiro(a),', 'Senhor(a) Conselheiro(a),'],
    ['Senhor(a) Ministro(a) do Tribunal de Contas,', 'Senhor(a) Ministro(a) do Tribunal de Contas,'],
    ['Senhor(a) Auditor(a),', 'Senhor(a) Auditor(a),'],
    ['Senhor(a) Corregedor(a),', 'Senhor(a) Corregedor(a),']
  ],
  instituicoes: [
    ['Senhor(a) Reitor(a),', 'Senhor(a) Reitor(a),'],
    ['Magnífico(a) Reitor(a),', 'Magnífico(a) Reitor(a),'],
    ['Senhor(a) Comandante,', 'Senhor(a) Comandante,'],
    ['Senhor(a) Delegado(a),', 'Senhor(a) Delegado(a),'],
    ['Senhor(a) Presidente da entidade,', 'Senhor(a) Presidente da entidade,'],
    ['Senhor(a) Coordenador(a),', 'Senhor(a) Coordenador(a),'],
    ['Senhor(a) Chefe,', 'Senhor(a) Chefe,'],
    ['Senhor(a) Secretário(a)-Executivo(a),', 'Senhor(a) Secretário(a)-Executivo(a),'],
    ['Senhor(a) Presidente do Conselho,', 'Senhor(a) Presidente do Conselho,'],
    ['Senhor(a) Presidente do Tribunal,', 'Senhor(a) Presidente do Tribunal,'],
    ['Senhor(a) Presidente da Fundação,', 'Senhor(a) Presidente da Fundação,'],
    ['Senhor(a) Cônsul,', 'Senhor(a) Cônsul,']
  ],
  tradicionais: [
    ['Ilustríssimo(a) Senhor(a), (tradicional)', 'Ilustríssimo(a) Senhor(a),'],
    ['Digníssimo(a) Senhor(a), (tradicional; verificar protocolo)', 'Digníssimo(a) Senhor(a),'],
    ['Excelentíssimo(a) Senhor(a) + cargo,', 'Excelentíssimo(a) Senhor(a) {cargo},']
  ]
};

const docModels = [
  ['Ofício', 'Correspondência oficial externa.'],
  ['Memorando', 'Comunicação interna entre unidades.'],
  ['Despacho', 'Manifestação ou encaminhamento administrativo.'],
  ['Nota técnica', 'Análise técnica e fundamentação.'],
  ['Relatório', 'Registro organizado de atividades ou resultados.'],
  ['Ata', 'Registro de reunião e deliberações.'],
  ['Requerimento', 'Solicitação formal dirigida à autoridade.'],
  ['Declaração', 'Declaração institucional ou funcional.'],
  ['Circular', 'Comunicação dirigida a múltiplos destinatários.']
];
