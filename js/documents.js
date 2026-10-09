/* Documentos: catalogo de modelos, editor, filas e acoes. */

let documents = [];
try {
  documents = JSON.parse(localStorage.getItem('gabinete-documentos-demo') || '[]');
} catch (e) {
  documents = [];
}

let activeQueue = 'Rascunho';
let attachments = [];
let docCatalog;
let docType;
let signerList;

function showDocTab(name) {
  document.querySelectorAll('[data-doc-tab]').forEach(t => {
    const on = t.dataset.docTab === name;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', String(on));
  });
  byId('docCatalogPanel').style.display = name === 'catalog' ? 'block' : 'none';
  byId('docEditorPanel').style.display = name === 'editor' ? 'block' : 'none';
  byId('docQueuesPanel').style.display = name === 'queues' ? 'block' : 'none';
  if (name === 'queues') renderDocQueue();
}

function addSigner(name = '', role = '') {
  const wrap = document.createElement('div');
  wrap.className = 'signer-entry';
  wrap.innerHTML = '<input class="signer-name" placeholder="Nome da autoridade" aria-label="Nome da autoridade"><input class="signer-role" placeholder="Cargo" aria-label="Cargo"><button type="button" class="secondary remove-signer" aria-label="Remover autoridade">×</button>';
  wrap.querySelector('.signer-name').value = name;
  wrap.querySelector('.signer-role').value = role;
  wrap.querySelector('.remove-signer').onclick = () => {
    if (signerList.children.length > 1) wrap.remove();
    else wrap.querySelectorAll('input').forEach(i => i.value = '');
  };
  signerList.appendChild(wrap);
}

function renderAttachments() {
  const box = byId('attachmentList');
  box.innerHTML = attachments.length
    ? attachments.map(f => `<div>📎 ${escapeHtml(f.name)} <span class="hint">(${(f.size / 1024).toFixed(1)} KB)</span></div>`).join('')
    : 'Nenhum anexo selecionado.';
}

function escapeDoc(s) {
  return escapeHtml(s || '');
}

function persistDocs() {
  localStorage.setItem('gabinete-documentos-demo', JSON.stringify(documents));
}

function renderDocQueue() {
  const list = byId('docQueueList');
  const items = documents.filter(d => d.status === activeQueue);
  list.innerHTML = items.length ? items.map(d => `<div class="doc-row"><div class="doc-row-main"><div class="doc-row-title">${escapeDoc(d.title)}</div><div class="doc-row-meta">${escapeDoc(d.type)} · ${escapeDoc(d.updated)} · ${d.signers.length} autoridade(s) · ${d.attachments.length} anexo(s)</div><div class="doc-summary">${escapeDoc(d.summary || 'Sem ementa/resumo.')}</div><div class="status ${d.status === 'Documento registrado' ? 's-done' : d.status === 'Pendente de assinatura' ? 's-wait' : d.status === 'Cancelado' ? 's-late' : 's-progress'}">${escapeDoc(d.status)}</div></div><div class="doc-row-actions"><button type="button" class="secondary" data-doc-action="view" data-id="${d.id}">Visualizar</button>${d.status !== 'Cancelado' ? `<button type="button" class="secondary" data-doc-action="edit" data-id="${d.id}">Editar</button><button type="button" class="secondary" data-doc-action="cancel" data-id="${d.id}">Cancelar</button>` : ''}${d.status === 'Rascunho' ? `<button type="button" class="secondary" data-doc-action="register" data-id="${d.id}">Registrar</button>` : ''}${d.status === 'Documento registrado' ? `<button type="button" class="secondary" data-doc-action="sign" data-id="${d.id}">Pendente assinatura</button>` : ''}</div></div>`).join('') : '<div class="doc-empty">Nenhum item nesta fila. Use o catálogo para iniciar um documento.</div>';
  list.querySelectorAll('[data-doc-action]').forEach(btn => btn.onclick = () => docAction(btn.dataset.docAction, btn.dataset.id));
}

function docAction(action, id) {
  const d = documents.find(x => x.id === id);
  if (!d) return;
  if (action === 'view') {
    alert(`Tipo: ${d.type}\nAssunto: ${d.title}\nEmenta: ${d.summary || '—'}\nAutoridades: ${d.signers.map(x => x.name + (x.role ? ' — ' + x.role : '')).join('; ') || '—'}\nAnexos: ${d.attachments.map(x => x.name).join(', ') || '—'}\nSituação: ${d.status}`);
    return;
  }
  if (action === 'edit') {
    docType.value = d.type;
    byId('docTitle').value = d.title;
    byId('docSummary').value = d.summary;
    byId('docContent').value = d.content;
    byId('selectedModelTag').textContent = d.type;
    signerList.innerHTML = '';
    (d.signers.length ? d.signers : [{ name: '', role: '' }]).forEach(x => addSigner(x.name, x.role));
    attachments = d.attachments.slice();
    renderAttachments();
    byId('docEditorForm').dataset.editing = id;
    showDocTab('editor');
    return;
  }
  d.status = action === 'cancel' ? 'Cancelado' : action === 'register' ? 'Documento registrado' : 'Pendente de assinatura';
  d.updated = new Date().toLocaleString('pt-BR');
  persistDocs();
  activeQueue = d.status;
  document.querySelectorAll('[data-queue]').forEach(t => {
    const on = t.dataset.queue === activeQueue;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', String(on));
  });
  renderDocQueue();
  showToast(`Documento movido para a fila: ${d.status}.`);
}

function initDocuments() {
  docCatalog = byId('docCatalog');
  docType = byId('docType');
  signerList = byId('signerList');

  document.querySelectorAll('[data-doc-tab]').forEach(t => t.addEventListener('click', () => showDocTab(t.dataset.docTab)));

  docCatalog.innerHTML = docModels.map(([name, desc]) => `<article class="doc-model"><span class="model-type">Modelo documental</span><h3>${escapeHtml(name)}</h3><p>${escapeHtml(desc)}</p><button type="button" class="secondary choose-model" data-model="${escapeHtml(name)}">Usar modelo</button></article>`).join('');
  docType.innerHTML = docModels.map(([name]) => `<option>${escapeHtml(name)}</option>`).join('');

  addSigner('Tatyana Amorim', 'Diretora-Presidente');
  byId('addSigner').onclick = () => addSigner();

  docCatalog.querySelectorAll('.choose-model').forEach(btn => btn.addEventListener('click', () => {
    docType.value = btn.dataset.model;
    byId('selectedModelTag').textContent = btn.dataset.model;
    byId('docTitle').value = btn.dataset.model + ' — ';
    byId('docContent').value = `[Modelo de ${btn.dataset.model}: redija o conteúdo conforme o padrão institucional vigente.]`;
    showDocTab('editor');
  }));

  byId('docAttachments').addEventListener('change', e => {
    attachments = Array.from(e.target.files || []).map(f => ({ name: f.name, size: f.size }));
    renderAttachments();
  });

  document.querySelectorAll('[data-queue]').forEach(t => t.addEventListener('click', () => {
    activeQueue = t.dataset.queue;
    document.querySelectorAll('[data-queue]').forEach(x => {
      const on = x === t;
      x.classList.toggle('active', on);
      x.setAttribute('aria-selected', String(on));
    });
    renderDocQueue();
  }));

  document.querySelectorAll('[data-save-status]').forEach(btn => btn.addEventListener('click', () => {
    const title = byId('docTitle').value.trim();
    if (!title) {
      byId('docTitle').reportValidity();
      byId('docTitle').focus();
      return;
    }
    const form = byId('docEditorForm');
    const editing = form.dataset.editing;
    const signers = Array.from(signerList.querySelectorAll('.signer-entry')).map(x => ({
      name: x.querySelector('.signer-name').value.trim(),
      role: x.querySelector('.signer-role').value.trim()
    })).filter(x => x.name);
    const record = {
      id: editing || 'DOC-' + Date.now(),
      type: docType.value,
      title,
      summary: byId('docSummary').value.trim(),
      content: byId('docContent').value,
      signers,
      attachments: attachments.slice(),
      status: btn.dataset.saveStatus,
      updated: new Date().toLocaleString('pt-BR')
    };
    const i = documents.findIndex(x => x.id === record.id);
    if (i >= 0) documents[i] = record;
    else documents.unshift(record);
    persistDocs();
    form.dataset.editing = '';
    form.reset();
    docType.selectedIndex = 0;
    signerList.innerHTML = '';
    addSigner('Tatyana Amorim', 'Diretora-Presidente');
    attachments = [];
    renderAttachments();
    byId('selectedModelTag').textContent = 'Sem modelo selecionado';
    activeQueue = record.status;
    document.querySelectorAll('[data-queue]').forEach(t => {
      const on = t.dataset.queue === activeQueue;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', String(on));
    });
    showDocTab('queues');
    showToast(`Documento movido para a fila: ${record.status}.`);
  }));

  byId('docCancel').onclick = () => {
    byId('docEditorForm').reset();
    attachments = [];
    renderAttachments();
    byId('docEditorForm').dataset.editing = '';
    showDocTab('catalog');
  };

  renderAttachments();
  renderDocQueue();
}
