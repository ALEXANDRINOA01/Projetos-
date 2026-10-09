# Piloto | Cadastro centralizado de demandas (Chefia de Gabinete)

Protótipo **estático** (HTML + CSS + JavaScript puro, sem build e sem backend) para
acompanhamento de demandas, ofícios, documentos e identidade visual do gabinete.

## Como rodar localmente

Como é um site 100% estático, há duas formas:

**A. Abrir direto no navegador**

Dê duplo clique em `index.html` (funciona via `file://`; os scripts são carregados
como *scripts clássicos*, sem ES modules, justamente para funcionar assim).

**B. Servidor local (recomendado)**

```bash
cd piloto-gabinete
python -m http.server 8080
# depois acesse http://localhost:8080
```

Qualquer servidor de arquivos estáticos serve (Live Server do VS Code, `npx serve`, etc.).

## Estrutura

```
piloto-gabinete/
├── index.html          # marcação da aplicação e o CSS do ofício (inline, ver abaixo)
├── css/
│   └── styles.css      # estilos da interface (topbar, painel, ofícios, documentos, design)
├── js/
│   ├── letter-assets.js  # imagens de cabeçalho/rodapé embutidas como data URI
│   ├── utils.js          # funções auxiliares (byId, escapeHtml, showToast, ...)
│   ├── data.js           # dados estáticos (demandas, vocativos, modelos de documento)
│   ├── designs.js        # modelos de identidade visual (aplicar/salvar/excluir)
│   ├── letters.js        # elaboração, revisão, numeração e exportação de ofícios
│   ├── documents.js      # catálogo, editor, anexos e filas de documentos
│   ├── dashboard.js      # painel de demandas, filtros e navegação
│   └── main.js           # inicialização (chama cada módulo e a primeira renderização)
└── assets/             # imagens-fonte (cabeçalho, rodapé e textura do papel)
```

### Por que o CSS do ofício fica inline no `index.html`?

O cabeçalho/rodapé do ofício e o CSS do "papel" são embutidos de propósito para que
os botões **Baixar ofício** e **Imprimir** gerem um arquivo **autossuficiente**
(estilo + imagens viajam junto com o HTML exportado). O restante do CSS fica
externo em `css/styles.css`.

### Persistência

Os dados ficam apenas no navegador (`localStorage`), com estas chaves:

- `fvs-letter-counter:*` — contador de numeração por setor/ano
- `fvs-letter-records` — ofícios em revisão / revisados
- `fvs-letter-designs` — modelos de identidade visual salvos
- `fvs-letter-active-design` — modelo ativo
- `gabinete-documentos-demo` — documentos e filas

## Deploy (GitHub Pages)

O deploy é automático pelo workflow
[`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml):

- Dispara em cada `push` na branch `main` que altere `piloto-gabinete/**`.
- Também pode ser executado manualmente em **Actions → Deploy do site → Run workflow**.
- Publica a pasta `piloto-gabinete/` como raiz do site.

URL do site (após o primeiro deploy):

```
https://alexandrinoa01.github.io/Projetos-/
```

> Observação: o GitHub Pages precisa de repositório **público** (em contas gratuitas).
> O workflow já habilita o Pages automaticamente na primeira execução
> (`enablement: true`); se a conta exigir, confirme em
> **Settings → Pages → Source: GitHub Actions**.

## Escopo

Protótipo de apoio visual. Não há integração automática com SIGED/IOANEWS, nem
assinatura ou trâmite oficial — depende de validação institucional.
