/* Painel de demandas: tabela, filtros, modal de registro e navegação. */

const dashboardParts = ['dashboardHeading', 'dashboardNotice', 'demandCards', 'demandGrid', 'footerNote'];
const modal = byId('modal');

function draw() {
  const q = byId('searchInput').value.toLowerCase();
  const st = byId('statusFilter').value;
  const ar = byId('areaFilter').value;
  const rows = demands.filter(d =>
    (!q || (d.subject + d.ref + d.id).toLowerCase().includes(q)) &&
    (!st || d.status === st) &&
    (!ar || d.area === ar)
  );
  byId('demandRows').innerHTML = rows.map(d => `<tr><td><span class="subject">${escapeHtml(d.subject)}</span><span class="id">${escapeHtml(d.id)} · ${escapeHtml(d.ref)}</span></td><td>${escapeHtml(d.area)}</td><td><div class="owner"><span class="avatar">${escapeHtml(d.initials)}</span>${escapeHtml(d.owner)}</div></td><td><span class="deadline ${d.tone}">${escapeHtml(d.deadline)}</span></td><td><span class="status ${statusClass[d.status] || 's-progress'}">${escapeHtml(d.status)}</span></td><td><button class="row-action" title="Mais opções">···</button></td></tr>`).join('');
  byId('rowCount').textContent = `Exibindo ${rows.length} registro${rows.length === 1 ? '' : 's'} de exemplo`;
}

function closeModal() {
  modal.classList.remove('open');
}

function switchView(view) {
  document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
  const button = Array.from(document.querySelectorAll('.nav-item')).find(x => x.dataset.view === view);
  if (button) button.classList.add('active');

  const showLetters = view === 'Ofícios';
  const showDocs = view === 'Documentos';
  const showDesigns = view === 'Modelos de design';
  const hideDashboard = showLetters || showDocs || showDesigns;

  dashboardParts.forEach(id => {
    byId(id).style.display = hideDashboard ? 'none' : '';
  });
  byId('lettersView').style.display = showLetters ? 'block' : 'none';
  byId('documentView').style.display = showDocs ? 'block' : 'none';
  byId('designsTabPanel').style.display = showDesigns ? 'block' : 'none';
  if (showDesigns) renderDesignList();

  const crumbs = {
    'Ofícios': 'Início <span style="padding:0 6px">/</span> Ofícios do gabinete',
    'Documentos': 'Início <span style="padding:0 6px">/</span> Documentos',
    'Modelos de design': 'Início <span style="padding:0 6px">/</span> Acompanhamento / Modelos de design'
  };
  byId('breadcrumb').innerHTML = crumbs[view] || 'Início <span style="padding:0 6px">/</span> Piloto de cadastro centralizado';

  if (!hideDashboard) {
    showToast(view === 'Painel geral' ? 'Você está no painel geral.' : `Visão “${view}” representada nesta tela demonstrativa.`);
  }
}

function initDashboard() {
  byId('searchInput').addEventListener('input', draw);
  byId('statusFilter').addEventListener('change', draw);
  byId('areaFilter').addEventListener('change', draw);

  byId('openModal').onclick = () => modal.classList.add('open');
  byId('closeModal').onclick = closeModal;
  byId('cancelModal').onclick = closeModal;
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  byId('demandForm').addEventListener('submit', e => {
    e.preventDefault();
    const subject = byId('subject').value.trim();
    const siged = byId('ref').value.trim();
    const ref = siged || 'Referência SIGED não informada';
    const area = byId('area').value;
    const owner = byId('ownerInput').value.trim();
    const deadlineValue = byId('deadlineInput').value;
    const demandStatus = byId('demandStatus').value;
    const deadline = deadlineValue ? new Date(deadlineValue + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não definido';
    demands.unshift({
      id: 'DEM-' + String(25 + demands.length - 5).padStart(3, '0'),
      subject,
      ref: siged ? 'SIGED · ' + siged : ref,
      area,
      owner,
      initials: owner.split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      deadline,
      status: demandStatus,
      tone: ''
    });
    byId('totalMetric').textContent = Number(byId('totalMetric').textContent) + 1;
    draw();
    closeModal();
    e.target.reset();
    showToast('Demanda registrada.');
  });

  document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', () => switchView(button.dataset.view));
  });
}
