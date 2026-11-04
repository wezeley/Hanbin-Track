<h1 align="center">Hanbin Tracker</h1>

<p align="center">
  Aplicação web para acompanhar a coleção de cards de K-pop do <b>Hanbin Bot</b>:<br>
  marque os cards que você já tem, veja o progresso e navegue por grupos, sets e raridades.
</p>

<p align="center">
  <a href="https://wezeley.github.io/Hanbin-Track/"><b>Ver demo ao vivo</b></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-20232a?logo=react&logoColor=61DAFB" alt="React 19">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite 8">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white" alt="GitHub Actions">
  <img src="https://img.shields.io/badge/deploy-GitHub%20Pages-222?logo=github" alt="GitHub Pages">
  <img src="https://img.shields.io/badge/status-em%20desenvolvimento-orange" alt="Status">
</p>

---

## Sobre o projeto

Quem coleciona cards no Hanbin Bot precisa controlar centenas de cartas espalhadas por grupos, sets e raridades. O **Hanbin Tracker** resolve isso com uma interface simples: você clica no card para marcar que já tem, e o app guarda sua coleção no navegador e mostra seu progresso geral.

Projeto pessoal criado para praticar **React** do zero ao deploy, com foco em resolver um problema real de uma comunidade.

## Funcionalidades

- **Dashboard** com progresso global da coleção (cards adicionados / total) e lista de próximos lançamentos
- **Navegação por categorias**: Boy Group, Girl Group, Soloists, Co-Ed, Duos, Survival Shows, Radiant, Events e Limiteds
- **Visão por grupo** organizada em **sets** e **raridades (1H a 5H)**, com sets que abrem e fecham
- **Marcar / desmarcar cards** com um clique (cards que você não tem ficam esmaecidos)
- **Coleção salva automaticamente** no navegador com `localStorage`, sem precisar de login
- **Nome de usuário editável**, também persistido
- **Busca rápida** de grupos pelo nome

## Tecnologias

| Camada | Ferramenta |
|---|---|
| Interface | React 19 (componentes funcionais + Hooks) |
| Build e dev server | Vite |
| Linguagem | JavaScript (ES6+), HTML5, CSS3 |
| Qualidade de código | Oxlint |
| Persistência | Web Storage API (`localStorage`) |
| CI/CD | GitHub Actions |
| Hospedagem | GitHub Pages |

## Destaques técnicos

- **Estado com React Hooks**: `useState` com *lazy initialization* para carregar a coleção salva só uma vez, e `useEffect` para sincronizar cada alteração com o `localStorage`.
- **Geração dinâmica dos cards**: em vez de cadastrar card por card, cada grupo informa até onde vai a coleção (ex.: `maxSet: 3.2` = até o Set 3, raridade 2H) e o app calcula os sets, as raridades e os IDs no formato do bot (`SKZ#BC001`).
- **Dados separados da interface**: grupos, categorias e lançamentos ficam em `src/data/hanbinData.js`, então incluir um grupo novo não exige mexer nos componentes.
- **Imagens resilientes**: links externos com *fallback* para pasta local, `loading="lazy"` para performance e imagem substituta quando um card não carrega.
- **Deploy contínuo**: a cada `push` na branch `main`, um workflow do GitHub Actions instala as dependências, gera o build e publica no GitHub Pages automaticamente.

## Estrutura

```
src/
├── App.jsx              # estado da coleção, navegação e regras dos sets
├── components/
│   ├── Dashboard.jsx    # progresso, lançamentos e busca
│   ├── Header.jsx       # barra superior e nome do usuário
│   └── Card.jsx         # card clicável (tem / não tem)
├── data/
│   └── hanbinData.js    # grupos, membros, sets e lançamentos
└── App.css
.github/workflows/
└── deploy.yml           # CI/CD para o GitHub Pages
```

## Como rodar localmente

Pré-requisito: [Node.js](https://nodejs.org/) 20 ou superior.

```bash
git clone https://github.com/wezeley/Hanbin-Track.git
cd Hanbin-Track
npm install
npm run dev
```

Outros comandos:

```bash
npm run build     # gera a versão de produção em /dist
npm run preview   # serve o build localmente
npm run lint      # analisa o código com Oxlint
```

## Próximos passos

- [ ] Nova interface visual (o layout atual é uma base focada em funcionalidade)
- [ ] Layout responsivo para celular
- [ ] Busca rápida abrindo o grupo direto ao clicar
- [ ] Abas Collection, Events, Commands e Status
- [ ] Filtros por raridade e por cards que faltam
- [ ] Exportar e importar a coleção

## English summary

**Hanbin Tracker** is a React + Vite web app to track a K-pop trading card collection from the Hanbin Bot. Users mark owned cards with one click, browse groups by category, set and rarity, and see their global progress. The collection is persisted with `localStorage`, card data is generated dynamically from a single data file, and every push to `main` is built and deployed to GitHub Pages through a GitHub Actions CI/CD pipeline.

## Autor

**Wesley Lima**, desenvolvedor full stack em formação (ADS)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-wezeley-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/wezeley)
[![GitHub](https://img.shields.io/badge/GitHub-wezeley-181717?logo=github)](https://github.com/wezeley)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-contato-25D366?logo=whatsapp&logoColor=white)](https://wa.me/5517997928199)
