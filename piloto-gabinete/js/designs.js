/* Modelos de design: identidade visual padrao, aplicacao e gerenciamento. */

const designDefault = {
  id: 'fvs-rcp-default',
  name: 'Identidade FVS-RCP (padrão)',
  primary: '#00843d',
  accent: '#232e69',
  header: LETTERHEAD_DATA,
  footer: LETTER_FOOTER_DATA,
  locked: true
};

let designTemplates = [];
try {
  designTemplates = JSON.parse(localStorage.getItem('fvs-letter-designs') || '[]');
} catch (e) {
  designTemplates = [];
}

let activeDesignId = localStorage.getItem('fvs-letter-active-design') || designDefault.id;

function allDesigns() {
  return [designDefault, ...designTemplates];
}

function persistDesigns() {
  localStorage.setItem('fvs-letter-designs', JSON.stringify(designTemplates));
}

function applyDesign(id, quiet = false) {
  const item = allDesigns().find(x => x.id === id) || designDefault;
  activeDesignId = item.id;
  localStorage.setItem('fvs-letter-active-design', item.id);
  byId('letterheadImage').src = item.header || designDefault.header;
  byId('letterFooterImage').src = item.footer || designDefault.footer;
  const paper = byId('letterPaper');
  paper.style.setProperty('--letter-green', item.primary || designDefault.primary);
  paper.style.setProperty('--letter-blue', item.accent || designDefault.accent);
  byId('designPrimary').value = item.primary || designDefault.primary;
  byId('designAccent').value = item.accent || designDefault.accent;
  renderDesignList();
  if (!quiet) {
    showToast(`Modelo “${item.name}” aplicado ao ofício.`);
  }
}

function renderDesignList() {
  const list = byId('designList');
  if (!list) return;
  list.innerHTML = allDesigns().map(item => `<div class="design-card ${item.id === activeDesignId ? 'active' : ''}"><div><div class="design-card-title">${escapeHtml(item.name)}${item.id === activeDesignId ? ' · Em uso' : ''}</div><div class="design-card-meta"><span class="design-swatch" style="background:${escapeHtml(item.primary)}"></span><span class="design-swatch" style="background:${escapeHtml(item.accent)}"></span>${item.locked ? 'Modelo incluído' : 'Modelo salvo neste navegador'}</div></div><div class="design-card-actions"><button type="button" class="secondary apply-design" data-id="${escapeHtml(item.id)}">Usar como padrão</button>${item.locked ? '' : `<button type="button" class="secondary delete-design" data-id="${escapeHtml(item.id)}">Excluir</button>`}</div></div>`).join('');
  list.querySelectorAll('.apply-design').forEach(b => b.onclick = () => applyDesign(b.dataset.id));
  list.querySelectorAll('.delete-design').forEach(b => b.onclick = () => {
    designTemplates = designTemplates.filter(d => d.id !== b.dataset.id);
    persistDesigns();
    if (activeDesignId === b.dataset.id) applyDesign(designDefault.id, true);
    else renderDesignList();
  });
}

function readDesignImage(input) {
  return new Promise((resolve, reject) => {
    const f = input.files && input.files[0];
    if (!f) return resolve('');
    if (!/^image\/(png|jpeg)$/.test(f.type)) return reject(new Error('Use uma imagem PNG ou JPG.'));
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.readAsDataURL(f);
  });
}

function initDesigns() {
  byId('saveDesign').addEventListener('click', async () => {
    const name = byId('designName').value.trim();
    if (!name) {
      byId('designName').focus();
      alert('Informe um nome para o modelo.');
      return;
    }
    try {
      const [headerImage, footerImage] = await Promise.all([
        readDesignImage(byId('designHeaderFile')),
        readDesignImage(byId('designFooterFile'))
      ]);
      if (!headerImage && !footerImage) {
        alert('Selecione ao menos uma imagem para o novo modelo.');
        return;
      }
      const item = {
        id: 'design-' + Date.now(),
        name,
        primary: byId('designPrimary').value,
        accent: byId('designAccent').value,
        header: headerImage || designDefault.header,
        footer: footerImage || designDefault.footer,
        locked: false
      };
      designTemplates.unshift(item);
      persistDesigns();
      applyDesign(item.id, true);
      byId('designName').value = '';
      byId('designHeaderFile').value = '';
      byId('designFooterFile').value = '';
      showToast('Modelo visual adicionado e aplicado ao ofício.');
    } catch (err) {
      alert(err.message || 'Não foi possível salvar o modelo.');
    }
  });

  applyDesign(activeDesignId, true);
}
