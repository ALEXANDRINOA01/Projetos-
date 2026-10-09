/* Ofícios: numeração, vocativos, prévia, filas de revisão, download e impressão. */

const sector = byId('letterSector');
const yearInput = byId('letterYear');
const paperNumber = byId('letterNumber');
const vocativeSelect = byId('letterSalutationChoice');
const vocativeInput = byId('letterSalutation');

let vocativeCategory = 'padrao';
let activeLetterTab = 'compose';
let letterRecords = [];

function counterKey() {
  return `fvs-letter-counter:${sector.value}:${yearInput.value}`;
}

function lastSequence() {
  const saved = localStorage.getItem(counterKey());
  if (saved === null) {
    return sector.value === 'DIPRE' && Number(yearInput.value) === 2026 ? 3020 : 0;
  }
  return Number(saved);
}

function formatNumber(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function nextNumber() {
  return `OFÍCIO Nº ${formatNumber(lastSequence() + 1)}/${yearInput.value} - ${sector.value}/FVS-RCP.`;
}

function renderVocatives(category, selectFirst = true) {
  vocativeCategory = category;
  document.querySelectorAll('.vocative-tab').forEach(tab => {
    const active = tab.dataset.category === category;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  const list = vocatives[category] || vocatives.padrao;
  vocativeSelect.innerHTML = list.map(([label], i) => `<option value="${i}">${escapeHtml(label)}</option>`).join('') + '<option value="custom">Personalizado (editar abaixo)</option>';
  if (selectFirst && list.length) {
    vocativeSelect.value = '0';
    applyVocative();
  } else {
    vocativeSelect.value = 'custom';
  }
}

function applyVocative() {
  const option = vocativeSelect.value;
  if (option === 'custom') {
    vocativeInput.focus();
    return;
  }
  const entry = (vocatives[vocativeCategory] || [])[Number(option)];
  if (entry) {
    const role = byId('letterRole').value.trim();
    vocativeInput.value = entry[1].replace('{cargo}', role || '[cargo]');
    updateLetter();
  }
}

function updateLetter() {
  byId('numberPreview').textContent = nextNumber();
  if (paperNumber.dataset.fixedNumber === 'true') {
    paperNumber.textContent = paperNumber.textContent;
  } else if (paperNumber.dataset.reserved !== 'true') {
    paperNumber.textContent = nextNumber();
  }
  const pairs = [
    ['letterDate', 'letterDateOut'],
    ['letterRecipient', 'recipientOut'],
    ['letterRole', 'roleOut'],
    ['letterInstitution', 'institutionOut'],
    ['letterAddress', 'addressOut'],
    ['letterZip', 'zipOut'],
    ['letterCity', 'cityOut'],
    ['letterSalutation', 'salutationOut'],
    ['letterSigner', 'signerOut'],
    ['letterTitle', 'titleOut']
  ];
  pairs.forEach(([input, out]) => {
    byId(out).textContent = byId(input).value;
  });
  const lines = byId('letterBody').value.split('\n').map(x => x.trim()).filter(Boolean);
  byId('bodyOut').innerHTML = lines.map((line, i) => `<p>${i + 1}. ${escapeHtml(line)}</p>`).join('');
}

function loadLetterRecords() {
  try {
    return JSON.parse(localStorage.getItem('fvs-letter-records') || '[]');
  } catch (e) {
    return [];
  }
}

function persistLetters() {
  localStorage.setItem('fvs-letter-records', JSON.stringify(letterRecords));
}

function currentLetter() {
  return paperNumber.textContent.trim();
}

function currentLetterData(number) {
  return {
    number,
    sector: sector.value,
    year: yearInput.value,
    date: byId('letterDate').value,
    recipient: byId('letterRecipient').value,
    role: byId('letterRole').value,
    institution: byId('letterInstitution').value,
    address: byId('letterAddress').value,
    zip: byId('letterZip').value,
    city: byId('letterCity').value,
    salutation: byId('letterSalutation').value,
    body: byId('letterBody').value,
    signer: byId('letterSigner').value,
    title: byId('letterTitle').value,
    closing: byId('letterClosing').value,
    designId: activeDesignId,
    paperHtml: byId('letterPaper').outerHTML
  };
}

function ensureLetterNumber() {
  if (paperNumber.dataset.fixedNumber === 'true') return currentLetter();
  if (paperNumber.dataset.reserved !== 'true') {
    const seq = lastSequence() + 1;
    localStorage.setItem(counterKey(), String(seq));
    paperNumber.textContent = `OFÍCIO Nº ${formatNumber(seq)}/${yearInput.value} - ${sector.value}/FVS-RCP.`;
    paperNumber.dataset.reserved = 'true';
  }
  return currentLetter();
}

function sendCurrentToReview() {
  const number = ensureLetterNumber();
  const data = currentLetterData(number);
  const found = letterRecords.findIndex(x => x.number === number);
  data.status = 'Em revisão';
  data.updated = new Date().toLocaleString('pt-BR');
  if (found >= 0) {
    letterRecords[found] = { ...letterRecords[found], ...data };
  } else {
    letterRecords.unshift(data);
  }
  persistLetters();
  paperNumber.dataset.fixedNumber = 'true';
  renderLetterLists();
  byId('reviewStatus').textContent = 'Em revisão';
  byId('reviewStatus').className = 'status s-progress';
  document.querySelector('[data-letter-tab="reviewing"]').click();
  showToast('Ofício encaminhado para revisão.');
}

function fillLetterForm(item) {
  sector.value = item.sector || 'DIPRE';
  yearInput.value = item.year || new Date().getFullYear();
  const fields = {
    date: 'letterDate',
    recipient: 'letterRecipient',
    role: 'letterRole',
    institution: 'letterInstitution',
    address: 'letterAddress',
    zip: 'letterZip',
    city: 'letterCity',
    salutation: 'letterSalutation',
    body: 'letterBody',
    signer: 'letterSigner',
    title: 'letterTitle',
    closing: 'letterClosing'
  };
  Object.entries(fields).forEach(([key, id]) => {
    const el = byId(id);
    if (el && item[key] != null) el.value = item[key];
  });
  paperNumber.textContent = item.number;
  paperNumber.dataset.reserved = 'true';
  paperNumber.dataset.fixedNumber = 'true';
  byId('numberPreview').textContent = item.number;
  if (item.designId) applyDesign(item.designId, true);
  updateLetter();
  byId('letterClosing').setAttribute('value', byId('letterClosing').value);
  document.querySelector('[data-letter-tab="compose"]').click();
}

function makePrintableHtml(item) {
  let html = item.paperHtml || byId('letterPaper').outerHTML;
  html = html.replace(/(<input\b[^>]*\bid="letterClosing"[^>]*\bvalue=")[^"]*(")/i, `$1${escapeAttr(item.closing)}$2`);
  return html;
}

function getLetterStyle() {
  return byId('letterStyles')?.outerHTML || '';
}

function downloadLetter(item) {
  const style = getLetterStyle();
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(item.number)}</title>${style}</head><body>${makePrintableHtml(item)}</body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (item.number || 'oficio').replace(/[^\p{L}\p{N}-]+/gu, '_') + '.html';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function printLetterRecord(item) {
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:1px;height:1px;border:0';
  document.body.appendChild(frame);
  const style = getLetterStyle();
  const doc = frame.contentDocument;
  doc.open();
  doc.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${escapeHtml(item.number)}</title>${style}</head><body>${makePrintableHtml(item)}</body></html>`);
  doc.close();
  frame.onload = () => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    setTimeout(() => frame.remove(), 1000);
  };
}

function renderLetterLists() {
  const queue = letterRecords.filter(x => x.status === 'Em revisão');
  const done = letterRecords.filter(x => x.status === 'Ofício revisado');
  byId('reviewListEmpty').style.display = queue.length ? 'none' : 'block';
  byId('reviewedListEmpty').style.display = done.length ? 'none' : 'block';
  byId('reviewList').innerHTML = queue.map(x => `<div class="letter-queue-item"><div class="letter-queue-head"><strong>${escapeHtml(x.number)}</strong><span class="status s-progress">Em revisão</span></div><div class="letter-queue-actions"><button type="button" class="secondary" data-letter-action="edit" data-number="${escapeAttr(x.number)}">Abrir para ajustes</button><button type="button" class="primary" data-letter-action="review" data-number="${escapeAttr(x.number)}">Marcar como revisado</button></div></div>`).join('');
  byId('reviewedList').innerHTML = done.map(x => `<div class="letter-queue-item"><div class="letter-queue-head"><strong>${escapeHtml(x.number)}</strong><span class="status s-done">Ofício revisado</span></div><div class="letter-queue-actions"><button type="button" class="secondary" data-letter-action="edit" data-number="${escapeAttr(x.number)}">Abrir para ajustes</button><button type="button" class="secondary" data-letter-action="download" data-number="${escapeAttr(x.number)}">Baixar ofício</button><button type="button" class="primary" data-letter-action="print" data-number="${escapeAttr(x.number)}">Imprimir</button></div></div>`).join('');
}

function letterQueueAction(action, number) {
  const item = letterRecords.find(x => x.number === number);
  if (!item) return;
  if (action === 'edit') {
    fillLetterForm(item);
    return;
  }
  if (action === 'review') {
    item.status = 'Ofício revisado';
    item.updated = new Date().toLocaleString('pt-BR');
    persistLetters();
    renderLetterLists();
    byId('reviewStatus').textContent = 'Ofício revisado';
    byId('reviewStatus').className = 'status s-done';
    document.querySelector('[data-letter-tab="reviewed"]').click();
    return;
  }
  if (item.status !== 'Ofício revisado') {
    alert('Somente ofícios revisados podem ser baixados ou impressos.');
    return;
  }
  if (action === 'download') downloadLetter(item);
  if (action === 'print') printLetterRecord(item);
}

function initLetters() {
  yearInput.value = new Date().getFullYear();
  byId('letterDate').value = 'Manaus, ' + new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  document.querySelectorAll('.vocative-tab').forEach(tab => tab.addEventListener('click', () => renderVocatives(tab.dataset.category)));
  vocativeSelect.addEventListener('change', applyVocative);
  vocativeInput.addEventListener('input', () => {
    if (vocativeSelect.value !== 'custom') vocativeSelect.value = 'custom';
    updateLetter();
  });
  renderVocatives('padrao', false);
  vocativeSelect.value = '0';

  document.querySelectorAll('#letterForm input,#letterForm select,#letterForm textarea').forEach(el => el.addEventListener('input', () => {
    if (paperNumber.dataset.fixedNumber !== 'true') paperNumber.dataset.reserved = '';
    updateLetter();
  }));
  byId('previewLetter').onclick = updateLetter;
  byId('reserveNumber').onclick = () => {
    if (paperNumber.dataset.fixedNumber === 'true') {
      alert('Este ofício já possui número cadastrado.');
      return;
    }
    const seq = lastSequence() + 1;
    localStorage.setItem(counterKey(), String(seq));
    paperNumber.textContent = `OFÍCIO Nº ${formatNumber(seq)}/${yearInput.value} - ${sector.value}/FVS-RCP.`;
    paperNumber.dataset.reserved = 'true';
    byId('numberPreview').textContent = nextNumber();
    showToast('Número reservado neste navegador; confirme no controle oficial antes de expedir.');
  };
  byId('letterClosing').addEventListener('input', () => {
    const closing = byId('letterClosing');
    paperNumber.dataset.closing = closing.value;
    closing.setAttribute('value', closing.value);
  });

  letterRecords = loadLetterRecords();
  byId('sendToReview').onclick = sendCurrentToReview;

  document.querySelectorAll('[data-letter-tab]').forEach(tab => tab.addEventListener('click', () => {
    document.querySelectorAll('[data-letter-tab]').forEach(t => {
      const active = t === tab;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
    });
    activeLetterTab = tab.dataset.letterTab;
    byId('composeTabPanel').style.display = activeLetterTab === 'compose' ? 'block' : 'none';
    byId('reviewTabPanel').style.display = activeLetterTab === 'reviewing' ? 'block' : 'none';
    byId('reviewedTabPanel').style.display = activeLetterTab === 'reviewed' ? 'block' : 'none';
    byId('reviewListTitle').textContent = activeLetterTab === 'reviewed' ? 'Ofícios revisados' : 'Ofícios em revisão';
  }));
  ['reviewList', 'reviewedList'].forEach(id => {
    byId(id).addEventListener('click', e => {
      const b = e.target.closest('[data-letter-action]');
      if (b) letterQueueAction(b.dataset.letterAction, b.dataset.number);
    });
  });
}
