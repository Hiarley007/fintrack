# FinTrack

**Aplicativo de finanças pessoais com React Native, Expo, Supabase e integração com Open Finance via Pluggy.**

O FinTrack reúne receitas e despesas em um aplicativo móvel, permitindo acompanhar o resultado de cada mês, organizar lançamentos por categoria e importar movimentações bancárias com autorização do usuário. O projeto combina desenvolvimento mobile, autenticação, banco de dados na nuvem, regras financeiras testáveis e integração com serviços externos.

## Identificação acadêmica

| Item | Informação |
| --- | --- |
| **Projeto** | Projeto 01 — FinTrack |
| **Instituição** | IESB |
| **Disciplina** | Programação para Dispositivos Móveis |
| **Semestre** | 4º semestre |
| **Professor orientador** | Prof. Me. Bruno Assunção Dias |
| **Aluno desenvolvedor** | Hiarley de Morais Rabelo |
| **Material-base** | *FinTrack — Guia de construção passo a passo* (setembro de 2026), elaborado pelo Prof. Me. Bruno Assunção Dias |

> **Sobre esta documentação:** o FinTrack é desenvolvido no IESB, na disciplina de Programação para Dispositivos Móveis, pelo aluno Hiarley de Morais Rabelo, sob orientação do Prof. Me. Bruno Assunção Dias. A construção segue o documento *FinTrack — Guia de construção passo a passo*, fornecido pelo professor. Este README descreve o projeto conforme o guia; os resultados de testes e a validação da integração real devem ser conferidos no repositório e no ambiente de execução.

## Pontos mais importantes do projeto

| Prioridade | Ponto central | Por que importa |
| --- | --- | --- |
| **Segurança** | Dados pessoais protegidos por Row Level Security (RLS) | Cada usuário acessa apenas seus próprios lançamentos e conexões. |
| **Segredos no servidor** | Credenciais do Pluggy armazenadas nas Edge Functions | O aplicativo recebe somente um token temporário para abrir o widget. |
| **Integração somente leitura** | Importação de movimentações com consentimento | O FinTrack não realiza pagamentos nem transferências. |
| **Importação sem duplicidade** | Chave única por usuário e transação externa | Sincronizar novamente não insere o mesmo lançamento duas vezes. |
| **Correção dos totais** | Tratamento de pagamentos de fatura | Evita somar a compra no cartão e seu pagamento como duas despesas. |
| **Precisão financeira** | Somatórios em centavos e valores positivos com tipo explícito | Reduz erros de ponto flutuante e separa valor de direção financeira. |
| **Arquitetura em camadas** | Tela → hook → serviço → banco | Separa interface, acesso a dados e regras de negócio. |
| **Controle do usuário** | Correção de categorias e desconexão bancária | A sincronização preserva categorias corrigidas; desconectar remove os dados importados daquela conexão. |
| **Qualidade verificável** | 46 testes unitários descritos no guia | Cobrem regras do app base e da importação bancária; devem ser executados no repositório. |

## Sumário

- [Identificação acadêmica](#identificação-acadêmica)
- [Visão geral e escopo](#visão-geral-e-escopo)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura de arquivos](#estrutura-de-arquivos)
- [Telas e navegação](#telas-e-navegação)
- [Modelo de dados](#modelo-de-dados)
- [Regras de negócio](#regras-de-negócio)
- [Como executar](#como-executar)
- [Configurar o Open Finance](#configurar-o-open-finance)
- [Segurança e privacidade](#segurança-e-privacidade)
- [Testes e validação](#testes-e-validação)
- [Gerar um APK de teste](#gerar-um-apk-de-teste)
- [Problemas comuns](#problemas-comuns)
- [Limitações e melhorias futuras](#limitações-e-melhorias-futuras)
- [Roteiro de desenvolvimento](#roteiro-de-desenvolvimento)
- [Apresentação no portfólio](#apresentação-no-portfólio)
- [Autoria e créditos](#autoria-e-créditos)

## Visão geral e escopo

O projeto tem duas partes principais:

1. **Aplicativo base:** autenticação, lançamentos manuais, painel mensal, filtros, gráficos e exportação em CSV.
2. **Integração Open Finance:** conexão bancária pelo Pluggy, importação de movimentações, categorização inicial, sincronização e desconexão.

O guia divide a construção em 17 etapas: as etapas 1 a 11 entregam o app base; as etapas 12 a 16 acrescentam o Open Finance; a etapa 17 orienta a publicação no GitHub e a apresentação no portfólio.

**Contexto e finalidade:** o FinTrack é o Projeto 01 da disciplina de Programação para Dispositivos Móveis (4º semestre, IESB). Tem finalidade educacional e de portfólio, voltado à prática de desenvolvimento mobile e integração financeira. O uso com bancos reais depende das credenciais, conectores e condições do agregador. O modo de demonstração utiliza o banco fictício Pluggy Bank.

## Funcionalidades

### Conta e sessão

- Cadastro com nome, e-mail, senha e confirmação de senha.
- Login e logout com Supabase Auth.
- Persistência da sessão no aparelho usando AsyncStorage.
- Navegação protegida para telas que exigem autenticação.
- Mensagens de validação e tratamento de falhas de autenticação.

### Lançamentos manuais

- Criar receitas e despesas com descrição, categoria, valor e data.
- Editar e excluir lançamentos, com confirmação para exclusão.
- Listar movimentações agrupadas por dia.
- Buscar por descrição ou categoria e filtrar por tipo.
- Navegar entre meses e atualizar lista e painel após alterações.

### Painel mensal

- Total de receitas, total de despesas e saldo do mês.
- Gráfico de rosca das despesas por categoria, construído com `react-native-svg`.
- Legenda com participação percentual das categorias.
- Exibição dos últimos lançamentos.
- Estados de carregamento, ausência de dados e erro com opção de tentar novamente.

> **O saldo apresentado é o resultado dos lançamentos do mês: receitas menos despesas. Não representa o saldo bancário disponível na instituição.**

### Exportação em CSV

- Exportação acessível pela tela Perfil.
- Colunas: `data`, `tipo`, `categoria`, `descricao` e `valor`.
- Datas no formato brasileiro, separador `;` e vírgula decimal.
- Escape de aspas e proteção para textos que começam com caracteres de fórmula, como `=`, `+`, `-` e `@`.
- Compartilhamento pelo mecanismo nativo do aparelho.

**Detalhe da implementação do guia:** o CSV é enviado como texto por `Share.share`, com o título `fintrack.csv`. Não há criação explícita de um arquivo físico anexado; o comportamento de recebimento depende do aplicativo escolhido para compartilhar.

### Open Finance

- Abertura do widget Pluggy Connect para escolha do banco e autorização.
- Importação de movimentações de contas e cartões.
- Exibição da instituição e da data da última sincronização.
- Identificação visual de lançamentos importados, incluindo o nome da conta.
- Sugestão de categoria e possibilidade de correção pelo usuário.
- Sincronização após conexão e por ação do usuário.
- Desconexão com remoção da conexão no Pluggy e dos lançamentos importados associados.

> **Lançamentos importados têm tratamento próprio na interface:** valor, data e descrição ficam bloqueados; apenas a categoria pode ser alterada. Lançamentos manuais continuam editáveis e excluíveis. Essa restrição de edição descrita no guia é um comportamento da interface, não uma garantia adicional de imutabilidade no banco.

## Tecnologias

| Tecnologia | Responsabilidade |
| --- | --- |
| React Native e Expo | Aplicativo móvel para Android e iOS. |
| TypeScript | Tipagem do domínio, formulários e serviços. |
| Expo Router | Rotas baseadas em arquivos e navegação protegida. |
| Supabase Auth | Cadastro, login e validação de sessão. |
| PostgreSQL e RLS | Persistência e isolamento dos dados por usuário. |
| Supabase Edge Functions / Deno | Integração com o Pluggy e execução de operações que exigem segredos. |
| Pluggy | Agregação de dados bancários e widget de consentimento. |
| TanStack Query | Consultas, mutações, cache e atualização de dados remotos. |
| React Hook Form e Zod | Formulários e validação tipada. |
| react-native-svg | Desenho do gráfico de rosca. |
| AsyncStorage | Persistência local da sessão. |
| react-native-pluggy-connect e react-native-webview | Widget de conexão bancária no aplicativo. |
| Jest e jest-expo | Testes unitários das regras de negócio. |
| Prettier | Formatação do código. |

**Versões de referência declaradas no guia:** Expo SDK 57, React Native 0.86, React 19.2 e TypeScript 6. São as versões citadas no material, não uma verificação de compatibilidade realizada para este README. Ao trabalhar no repositório, confira `package.json` e o arquivo de lock.

## Arquitetura

A organização central é:

```text
Tela → Hook → Serviço → Supabase → PostgreSQL com RLS
                         │
                         └→ Edge Function → API Pluggy
```

| Camada | Local | Responsabilidade |
| --- | --- | --- |
| Rotas e telas | `app/` | Compor telas, navegação e interação. |
| Componentes | `src/components/` | Reutilizar elementos visuais. |
| Hooks | `src/hooks/` | Consultas e mutações com TanStack Query. |
| Serviços | `src/services/` | Concentrar acesso aos dados e chamadas às funções. |
| Regras puras | `src/utils/` | Dinheiro, datas, resumos e CSV. |
| Validação | `src/schemas/` | Schemas Zod dos formulários. |
| Sessão | `src/context/` | Compartilhar estado de autenticação. |
| Infraestrutura do app | `src/lib/` | Clientes, configurações e cache. |
| Backend | `supabase/functions/` | Autenticar chamadas e integrar com o Pluggy. |

**Regra de organização:** as telas de negócio usam hooks e serviços para consultar dados. As regras de transformação financeira permanecem independentes da interface e da rede, facilitando os testes.

O módulo `supabase/functions/_shared/openfinance.ts` contém regras puras compartilhadas com os testes. Os demais módulos de servidor usam o ambiente Deno e recebem configuração de tipos separada da aplicação Expo.

## Estrutura de arquivos

Estrutura resumida do repositório:

```text
fintrack/
├── __test__/                  # date, money, openfinance e summary (*.test.ts)
├── app/
│   ├── _layout.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (app)/
│       ├── _layout.tsx
│       ├── (tabs)/
│       │   ├── _layout.tsx
│       │   ├── index.tsx
│       │   ├── transactions.tsx
│       │   └── profile.tsx
│       ├── transaction/
│       │   ├── new.tsx
│       │   └── [id].tsx
│       └── banks/
│           ├── index.tsx
│           ├── connect.tsx
│           └── callback.tsx
├── assets/
├── patches/
├── src/
│   ├── components/            # Button, Card, DonutChart, Fab, FormInput, Input,
│   │                          # MonthSwitcher, Screen, StateViews, SummaryCards,
│   │                          # TransactionForm, TransactionItem,
│   │                          # BankConnectionCard, BankConnectWidget, etc.
│   ├── context/AuthContext.tsx
│   ├── hooks/                 # useBanks, useCategories, useTransactions
│   ├── lib/                   # config, queryClient, supabase
│   ├── schemas/               # auth, transaction
│   ├── services/              # banks, categories, functions, transaction
│   ├── theme/index.ts
│   ├── types/index.ts
│   └── utils/                 # csv, date, errors, icons, money, summary
├── supabase/
│   ├── config.toml
│   ├── schema.sql
│   ├── open_finance.sql
│   └── functions/
│       ├── deno.json
│       ├── deno.lock
│       ├── _shared/           # http.ts, pluggy.ts, openfinance.ts
│       ├── bank-connect-token/index.ts
│       ├── bank-sync/index.ts
│       └── bank-disconnect/index.ts
├── .env.example
├── .prettierrc
├── App.tsx
├── AGENTS.md
├── app.json
├── eas.json
├── index.ts
├── LICENSE
├── package.json
├── tsconfig.json
└── README.md
```

Arquivos locais e fora do Git: `.env`, `node_modules/` e `supabase/.temp/`. O `eas.json` define os perfis de build do EAS.

## Telas e navegação

| Tela | Rota | Uso |
| --- | --- | --- |
| Login | `/login` | Entrar com e-mail e senha. |
| Cadastro | `/register` | Criar uma conta. |
| Início | `/` | Resumo mensal, gráfico e últimos lançamentos. |
| Lançamentos | `/transactions` | Lista, busca e filtros. |
| Novo lançamento | `/transaction/new` | Registrar receita ou despesa. |
| Editar lançamento | `/transaction/[id]` | Editar ou excluir um registro manual; recategorizar um importado. |
| Perfil | `/profile` | Dados do usuário, CSV, bancos e logout. |
| Contas bancárias | `/banks` | Consultar, sincronizar e desconectar bancos. |
| Conectar banco | `/banks/connect` | Abrir o widget de autorização. |
| Retorno da autorização | `/banks/callback` | Tratar o retorno do fluxo bancário. |

Os grupos `(auth)`, `(app)` e `(tabs)` organizam a navegação sem compor o endereço público das rotas.

## Modelo de dados

### `categories`

Categorias compartilhadas, com leitura para usuários autenticados. O script inicial cadastra **14 categorias** de receitas e despesas.

Campos principais: `id`, `name`, `type`, `icon` e `color`.

### `transactions`

Lançamentos financeiros associados a um usuário.

| Campo | Finalidade |
| --- | --- |
| `id` | Identificador do lançamento. |
| `user_id` | Proprietário, preenchido por padrão com `auth.uid()`. |
| `category_id` | Categoria associada. |
| `type` | `income` para receita ou `expense` para despesa. |
| `description` | Descrição entre 2 e 80 caracteres. |
| `amount` | Valor positivo em `numeric(12, 2)`. |
| `date` | Data do lançamento. |
| `created_at` | Data e hora de criação. |
| `source` | `manual` ou `open_finance`. |
| `connection_id` | Conexão bancária de origem, quando houver. |
| `external_id` | Identificador da transação no Pluggy. |
| `account_name` | Nome da conta de origem. |

### `bank_connections`

Armazena o vínculo entre usuário e instituição: `id`, `user_id`, `pluggy_item_id`, `institution_name`, `institution_image_url`, `status`, `last_error`, `last_synced_at` e `created_at`.

### Restrições essenciais

- `unique (user_id, pluggy_item_id)`: impede repetir a mesma conexão para o usuário.
- `unique (user_id, external_id)`: impede repetir uma transação importada.
- `external_id` nulo nos registros manuais: não interfere na criação de lançamentos comuns.
- `connection_id` com `on delete cascade`: excluir a conexão remove os lançamentos vinculados.
- RLS em lançamentos e conexões: leitura e escrita limitadas ao proprietário.
- Índices por usuário/data e conexão: apoiam as consultas do aplicativo.

## Regras de negócio

### Valores e formulários

- O valor é positivo; o campo `type` define se ele entra como receita ou despesa.
- O formulário aceita valores no padrão brasileiro, como `1.250,00`.
- Os somatórios financeiros usam centavos para reduzir imprecisões de ponto flutuante.
- O formulário valida valor maior que zero e de até `9.999.999`.
- Descrição obrigatória com 2 a 80 caracteres, categoria obrigatória e data válida.
- Datas são apresentadas como `DD/MM/AAAA` e armazenadas como `AAAA-MM-DD`.
- Ao trocar o tipo do lançamento, a categoria selecionada é limpa.
- Cadastro exige nome com pelo menos 2 caracteres, e-mail válido, senha com pelo menos 6 caracteres e confirmação correspondente.

### Tratamento das importações

| Situação | Regra prevista |
| --- | --- |
| Transação pendente | Ignorar até ser confirmada. |
| Moeda diferente de BRL | Não importar. |
| Identificador ausente, data inválida ou valor inválido/zero | Não importar. |
| Valor importado | Usar valor absoluto arredondado para duas casas decimais. |
| Direção financeira | Priorizar o tipo recebido; quando ausente, interpretar o sinal conforme conta ou cartão. |
| Data com horário | Converter conforme a regra de Brasília, UTC−3, definida no guia. |
| Data exatamente à meia-noite UTC | Preservar o dia, tratando-a como data sem horário. |
| Descrição longa | Limitar a 80 caracteres. |
| Descrição curta demais | Usar uma descrição padrão. |
| Categoria | Usar a informação do agregador ou palavras-chave da descrição. |

### Faturas de cartão sem dupla contagem

A compra no cartão já é uma despesa. Por isso, as regras identificam e ignoram o pagamento da fatura na conta bancária e o pagamento recebido no cartão. Estornos continuam sendo tratados como receita.

**Exemplo:** uma compra de R$ 100 e o pagamento da fatura correspondente não devem produzir R$ 200 de despesas.

A identificação depende de padrões de descrição. Portanto, novos formatos de extrato podem exigir ajustes nas regras e novos testes.

### Sincronização idempotente

O guia prevê que a primeira sincronização busque uma janela de **90 dias** e que as seguintes comecem **7 dias antes da última sincronização**, permitindo capturar movimentações confirmadas com atraso.

> **Estado atual da implementação:** o Pluggy descontinuou o endpoint `GET /transactions` (resposta 410 `ENDPOINT_DEPRECATED`). A função `listTransactions` foi migrada para `GET /v2/transactions`, que usa paginação por cursor e **não aceita** os parâmetros `from`, `to` e `pageSize`. Por isso, a busca atual envia apenas `accountId` (e `cursor` nas páginas seguintes) e traz o histórico disponível a cada sincronização, sem aplicar a janela de 90/7 dias. A janela só poderá ser reaplicada depois de confirmar na documentação do v2 os nomes dos parâmetros de data.

A combinação de chave única e `upsert` com `ignoreDuplicates` faz com que registros já importados sejam ignorados. Isso preserva a categoria corrigida pelo usuário e impede duplicações mesmo quando os períodos de busca se sobrepõem ou quando o histórico completo é reprocessado.

**Limite dessa escolha:** registros existentes não são atualizados automaticamente por esse fluxo. Uma alteração posterior feita pelo banco em uma transação já importada exige uma estratégia adicional de reconciliação.

## Como executar

As instruções pressupõem que o código do projeto, construído conforme o guia, esteja disponível no repositório. Este README documenta o projeto; o código-fonte está nos diretórios descritos em [Estrutura de arquivos](#estrutura-de-arquivos).

### 1. Pré-requisitos

- Node.js LTS; o guia indica versão 22 ou superior.
- npm e Git.
- Expo Go compatível com o SDK do projeto, ou ambiente móvel equivalente.
- Conta e projeto no Supabase.
- Conta no Pluggy para habilitar a integração bancária.
- Conta Expo/EAS para o build opcional.
- Deno e a extensão **Deno** (`denoland.vscode-deno`) no VS Code, para editar as Edge Functions sem erros falsos no editor.

Confira o ambiente:

```bash
node -v
npm -v
git --version
deno --version
```

### 2. Instalar dependências

Na raiz do projeto:

```bash
npm install
```

Se houver divergência entre dependências e o SDK do Expo, o guia orienta:

```bash
npx expo install --fix
```

### 3. Configurar o banco

Crie um projeto no Supabase e execute os scripts no SQL Editor, **nesta ordem**:

1. `supabase/schema.sql`: categorias, lançamentos, permissões e políticas RLS.
2. `supabase/open_finance.sql`: conexões bancárias e campos de importação.

Para a versão final descrita neste README, aplique ambos os scripts mesmo que vá testar inicialmente apenas lançamentos manuais. A configuração do provedor Pluggy pode ser feita depois.

Confira as 14 categorias iniciais e o RLS ativo nas tabelas. Os scripts são de criação do esquema; não presuma que podem ser reaplicados integralmente em um banco já configurado. Comandos avulsos (como `update bank_connections set last_synced_at = null;`) devem ser executados à parte, no SQL Editor, e não adicionados aos scripts de esquema.

### 4. Configurar variáveis públicas

Copie `.env.example` para `.env` e preencha:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=SUA-CHAVE-ANON-OU-PUBLISHABLE
EXPO_PUBLIC_OPEN_FINANCE_SANDBOX=true
```

| Variável | Uso |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | URL do projeto Supabase. |
| `EXPO_PUBLIC_SUPABASE_KEY` | Chave pública anon ou publishable. |
| `EXPO_PUBLIC_OPEN_FINANCE_SANDBOX` | `true` para testes; `false` para o fluxo com dados reais. |

> **Nunca coloque `service_role`, senha do banco, `PLUGGY_CLIENT_ID` ou `PLUGGY_CLIENT_SECRET` nas variáveis públicas do aplicativo. Tudo que começa com `EXPO_PUBLIC_` pode ser incorporado ao app distribuído.**

Mantenha `.env` fora do Git e versione apenas `.env.example` com valores fictícios. Para um uso real, preserve a confirmação de e-mail no Supabase; o guia permite desativá-la apenas para facilitar testes em aula.

### 5. Iniciar o aplicativo

```bash
npx expo start
```

Abra no Expo Go. Computador e celular devem conseguir se comunicar pela rede. Se houver bloqueio de rede, use:

```bash
npx expo start --tunnel
```

Após alterar `.env`, reinicie limpando o cache:

```bash
npx expo start -c
```

### Scripts do projeto

| Comando | Ação |
| --- | --- |
| `npm start` | Inicia o Expo. |
| `npm run android` | Inicia o fluxo Android configurado no Expo. |
| `npm run ios` | Inicia o fluxo iOS configurado no Expo. |
| `npm run web` | Inicia o Expo para web. |
| `npm test` | Executa os testes Jest. |
| `npm run typecheck` | Verifica os tipos com `tsc --noEmit`. |
| `npm run format` | Formata os arquivos com Prettier; altera arquivos. |

## Configurar o Open Finance

### Fluxo de conexão

```text
1. App autenticado solicita um Connect Token.
2. bank-connect-token usa os segredos do servidor e vincula o token ao usuário.
3. App abre o widget do Pluggy com o token temporário.
4. Usuário escolhe o banco e autoriza o compartilhamento.
5. Widget retorna o identificador da conexão (Item).
6. bank-sync verifica o proprietário, consulta dados e aplica as regras de importação.
7. Novos lançamentos são gravados no Supabase e exibidos no app.
```

O guia descreve o Connect Token como válido por 30 minutos. A integração importa dados; não movimenta dinheiro.

### 1. Preparar o Pluggy

Crie uma aplicação no painel Pluggy e obtenha seu Client ID e Client Secret. Armazene essas credenciais somente no backend. Para a demonstração inicial, mantenha o sandbox ativado.

Dependências adicionadas na etapa de integração do guia, caso ainda não estejam no projeto:

```bash
npx expo install react-native-webview
npm install react-native-pluggy-connect pluggy-js
```

### 2. Preparar o projeto Supabase na CLI

Se o comando `supabase` não for encontrado, use a CLI via `npx` (como nos exemplos abaixo).

```bash
npx supabase login
npx supabase init
npx supabase link --project-ref SEU-PROJECT-REF
```

Execute `init` apenas se a configuração local da CLI ainda não existir. O identificador do projeto (Reference ID) está em **Project Settings → General** ou no trecho `SEU-PROJECT-REF` da URL do projeto no painel; não é o identificador da organização.

### 3. Cadastrar segredos e publicar funções

Cadastre `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET` nos segredos das Edge Functions. O guia apresenta a seguinte alternativa pela CLI, substituindo os valores fictícios:

```bash
npx supabase secrets set PLUGGY_CLIENT_ID=SEU-CLIENT-ID PLUGGY_CLIENT_SECRET=SEU-CLIENT-SECRET
npx supabase functions deploy bank-connect-token
npx supabase functions deploy bank-sync
npx supabase functions deploy bank-disconnect
```

Os valores usados diretamente nesse comando podem ficar no histórico do terminal. Evite expô-los em gravações ou computadores compartilhados.

Confira a publicação:

```bash
npx supabase functions list
npx supabase secrets list
```

Se o deploy solicitar Docker indisponível, o guia orienta acrescentar `--use-api` ao comando de publicação. O aviso "Docker is not running" por si só é inofensivo: a CLI envia os arquivos ao servidor.

Os logs de cada função ficam em **Dashboard → Edge Functions → (função) → Logs**. É o lugar mais rápido para diagnosticar falhas do Pluggy, pois o app recebe apenas mensagens genéricas.

### Responsabilidade das funções

| Função | Entrada principal | Responsabilidade |
| --- | --- | --- |
| `bank-connect-token` | Sessão autenticada e URI de retorno | Gerar token temporário vinculado ao usuário. |
| `bank-sync` | `item_id` | Confirmar propriedade, consultar movimentações e inserir novos registros. |
| `bank-disconnect` | `connection_id` | Remover o Item no Pluggy e depois excluir a conexão local. |

As funções validam a sessão com `auth.getUser` e usam um cliente Supabase com o token do usuário, preservando a aplicação do RLS. A sincronização compara `clientUserId` do Item com o identificador do usuário autenticado antes de importar.

### Editar as Edge Functions no VS Code

As funções rodam em Deno. O VS Code, por padrão, analisa os arquivos com o TypeScript comum e acusa `Cannot find name 'Deno'` e `Cannot find module 'npm:...'`. São erros do editor, não do deploy. Para eliminá-los:

1. Instale a extensão **Deno** (autor *denoland*).
2. Crie `supabase/functions/.vscode/settings.json` com `{ "deno.enable": true }`.
3. Abra a pasta em janela própria: `code supabase/functions`.
4. Exclua `supabase/functions` do `tsconfig.json` da raiz, para o `npm run typecheck` do app ignorá-las.
5. Valide com `deno check supabase/functions/_shared/http.ts`.

### 4. Testar com Pluggy Bank

Credenciais fictícias de teste fornecidas no guia:

| Campo | Valor |
| --- | --- |
| Usuário | `user-ok` |
| Senha | `password-ok` |
| MFA, se solicitado | `123456` |

No app, acesse **Perfil → Contas bancárias → Conectar banco**, selecione o Pluggy Bank e conclua o fluxo. Confira os lançamentos e sincronize novamente para verificar a ausência de duplicações.

### 5. Usar dados reais, opcionalmente

O guia descreve um fluxo com Meu Pluggy, uma conta bancária própria conectada e o conector correspondente habilitado na aplicação de desenvolvimento. Depois da configuração do provedor, altere:

```dotenv
EXPO_PUBLIC_OPEN_FINANCE_SANDBOX=false
```

Reinicie o Expo e compare valores e datas com o extrato da instituição. A variável, sozinha, não habilita acesso real: o funcionamento depende também da conta, dos conectores e das permissões no Pluggy. Contas em modo trial podem retornar `TRIAL_CLIENT_ITEM_CREATE_NOT_ALLOWED` até que a liberação de dados reais seja solicitada e aprovada no painel do Pluggy.

**Condições comerciais, limites e disponibilidade devem ser conferidos no provedor.** O guia distingue estudo com dados próprios de uso comercial com dados de terceiros; este README não garante gratuidade ou um plano específico.

## Segurança e privacidade

- **Isolamento por usuário:** políticas RLS restringem lançamentos e conexões ao proprietário.
- **Autenticação no servidor:** as funções conferem o token da sessão.
- **Verificação da conexão:** o servidor não confia apenas no `item_id` recebido do aplicativo.
- **Segredos protegidos:** as credenciais do Pluggy ficam no Supabase, fora do app e do Git.
- **Consentimento:** o widget conduz a autorização de acesso aos dados bancários.
- **Somente leitura:** o projeto não implementa pagamentos ou transferências.
- **Minimização:** o modelo proposto não persiste saldo bancário, CPF ou dados da contraparte.
- **Logs:** evite registrar o conteúdo das respostas do Pluggy nos logs das funções (por exemplo, com `console.log` de depuração), pois contêm dados financeiros.
- **Demonstrações:** utilizar dados fictícios e evitar exibir extratos pessoais.

### O que acontece ao desconectar

1. O usuário confirma a ação.
2. A função procura a conexão sob as políticas RLS.
3. Remove o Item correspondente no Pluggy.
4. Exclui a conexão no Supabase.
5. O banco remove, por cascata, os lançamentos importados ligados à conexão.

**A desconexão apaga o histórico importado daquela conexão no FinTrack. Lançamentos manuais não vinculados permanecem.** Se a remoção no Pluggy falhar, o fluxo descrito preserva os dados locais para permitir nova tentativa.

O guia também orienta conferir o encerramento do consentimento no banco ou no Meu Pluggy. Logout apenas encerra a sessão; não equivale a desconectar um banco.

## Testes e validação

O guia informa **46 testes unitários**, divididos em:

| Grupo | Quantidade informada | Cobertura descrita |
| --- | --- | --- |
| Aplicativo base | 24 | Dinheiro, datas e resumos financeiros. |
| Open Finance | 22 | Normalização, valores, datas, faturas, categorização, intervalos de busca e estados de conexão. |
| **Total** | **46** | Regras puras do domínio. |

Execute no repositório:

```bash
npm run typecheck
npm test
```

**Resultado esperado segundo o guia:** nenhum erro de tipos e `46 passed, 46 total`. Registre aqui o resultado da execução no seu ambiente quando disponível. O guia também relata checagem das funções com Deno e empacotamento Android, sem substituir a validação do ambiente de quem implementa o projeto.

> **Atenção ao nome da pasta de testes:** a pasta do repositório chama-se `__test__`. O script `format` do `package.json` deve apontar para o mesmo nome; se apontar para `__tests__`, o Prettier exibe `No files matching the pattern`. O Jest não é afetado, pois encontra arquivos `*.test.ts` em qualquer pasta.

### Checklist do app base

- [ ] Cadastro rejeita dados inválidos e senhas divergentes.
- [ ] Login inválido mostra mensagem clara.
- [ ] Fechar e reabrir o aplicativo preserva a sessão.
- [ ] Receita de `1.250,00` e despesa de `45,90` são interpretadas corretamente.
- [ ] Datas impossíveis, como `31/02/2026`, são rejeitadas.
- [ ] Criar, editar e excluir atualiza a lista e o painel.
- [ ] Busca, filtros, agrupamento diário e troca de mês funcionam.
- [ ] Gráfico e totais correspondem aos lançamentos exibidos.
- [ ] Exportação abre o compartilhamento com conteúdo CSV.
- [ ] Trocar de usuário não revela dados da conta anterior.
- [ ] Falhas de rede exibem erro e permitem nova tentativa.

### Checklist do Open Finance

- [ ] Pluggy Bank conecta e importa movimentações.
- [ ] A lista mostra instituição e última sincronização.
- [ ] Lançamentos importados exibem sua origem.
- [ ] A interface permite alterar apenas a categoria de registros importados.
- [ ] Sincronizar novamente não duplica registros e preserva categorias corrigidas.
- [ ] Pendências e moedas diferentes de BRL são ignoradas.
- [ ] Compras e pagamentos de fatura não geram dupla contagem nos casos cobertos pelas regras.
- [ ] Cancelar o widget retorna ao app sem erro indevido.
- [ ] Falhas do banco e ausência de rede são tratadas.
- [ ] Outra conta não consegue acessar a conexão do primeiro usuário.
- [ ] Desconectar remove a conexão e seus lançamentos importados.
- [ ] Com dados reais, valores e datas são comparados ao extrato bancário.

Os testes unitários não substituem esses cenários no aparelho nem a validação das políticas do banco e das funções publicadas.

## Gerar um APK de teste

Etapa opcional descrita no guia, utilizando EAS Build:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

Configure o `eas.json` (já presente na raiz do projeto):

```json
{
  "cli": {
    "version": ">= 24.11.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "environment": "preview"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

O `.env` não vai para a nuvem (está no `.gitignore`). Cadastre as variáveis no painel da Expo (**expo.dev → projeto → Environment variables**), no ambiente `preview`, com visibilidade **Plain text**:

| Nome | Valor |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | URL do projeto Supabase. |
| `EXPO_PUBLIC_SUPABASE_KEY` | Chave anon ou publishable. |
| `EXPO_PUBLIC_OPEN_FINANCE_SANDBOX` | `true` para demonstração; `false` somente se o Pluggy já liberou dados reais. |

Os nomes precisam ser idênticos aos lidos pelo código, e as variáveis só entram em builds novos. Nunca cadastre `service_role` nem as credenciais do Pluggy aqui.

```bash
eas build --platform android --profile preview
```

As credenciais do Pluggy permanecem no Supabase. Ajuste os identificadores Android/iOS para valores próprios e confira o `scheme` usado no retorno bancário: o guia usa `fintrack://` no aplicativo instalado e o endereço `exp://` no Expo Go.

## Problemas comuns

| Sintoma | Verificação ou ação sugerida |
| --- | --- |
| Variáveis do Supabase ausentes | Conferir `.env`, nomes das variáveis e reiniciar com `npx expo start -c`. |
| `ERESOLVE` ao instalar | Conferir compatibilidade de `react` e `react-dom` antes de forçar resolução de dependências. |
| QR Code não abre | Conferir a rede ou usar `npx expo start --tunnel`. |
| Confirmação de e-mail pendente | Confirmar pelo link enviado pelo Supabase. |
| `permission denied for table` | Conferir permissões `grant` do script SQL. |
| Violação de RLS | Conferir sessão, políticas e preenchimento de `user_id`. |
| Lista vazia após salvar | Conferir o mês selecionado e as políticas de leitura. |
| Duas telas para `/` | Remover a rota temporária `app/index.tsx` usada na construção inicial, se ainda existir. |
| Jest não reconhece `describe` | Conferir os tipos Jest em `tsconfig.json`. |
| `No files matching the pattern` no `npm run format` | O padrão do script aponta para uma pasta inexistente (`__tests__` em vez de `__test__`). Ajustar o script ou renomear a pasta. |
| Integração não configurada | Conferir os segredos do Pluggy e a publicação das funções. |
| Widget vazio ou com erro | Conferir sessão, logs de `bank-connect-token` e credenciais no servidor. |
| Erro 403 de propriedade | Conferir se o Item foi criado com `clientUserId` do usuário atual. |
| Erro 409 na sincronização | Aguardar o processamento do banco e tentar novamente. |
| Banco conecta, mas nenhum lançamento é importado | Consultar os logs de `bank-sync` no painel do Supabase (a linha de erro expandida mostra a resposta original do Pluggy) e conferir `skipped` na resposta da função. |
| Log com 410 `ENDPOINT_DEPRECATED` em `/transactions` | O Pluggy descontinuou `GET /transactions`. Usar `GET /v2/transactions` (paginação por cursor). |
| Log com 400 "property from / to / pageSize should not exist" | O v2 não aceita os parâmetros do formato antigo. Enviar apenas `accountId` (e `cursor`), conforme a documentação atual. |
| `TRIAL_CLIENT_ITEM_CREATE_NOT_ALLOWED` | Conta trial sem acesso a dados reais. Solicitar a liberação no painel do Pluggy ou usar o sandbox. |
| QR Code do Inter não aparece no widget | No app do Inter, acessar Perfil → Autorizações → Acessar via QR Code e reiniciar a conexão. |
| `Tried to register two views with the same name RNCWebView` | Verificar duplicações com `npm ls react-native-webview`, instalar com `npx expo install react-native-webview`, executar `npm dedupe` e reiniciar com `npx expo start --clear`. |
| Retorno bancário não abre o app | Conferir `banks/callback.tsx` e o `scheme`. |
| `USER_INPUT_TIMEOUT` no iPhone | O guia sugere testar `forceOauthInBrowser={false}`, observando a compatibilidade do conector. |
| Erros de tipos nos módulos Deno | Conferir a separação entre a configuração do app e a das Edge Functions. |
| `Cannot find name 'Deno'` ou `npm:` no editor | Instalar a extensão Deno (denoland), abrir `supabase/functions` em janela própria com `deno.enable: true` e excluir `supabase/functions` do `tsconfig.json` do app. São erros do editor, não do deploy. |
| `supabase: comando não encontrado` | Usar `npx supabase ...`. |
| `update ...` no terminal retorna "comando não encontrado" | Comandos SQL são executados no SQL Editor do Supabase, não no terminal. |

## Limitações e melhorias futuras

### Limites da implementação descrita

- Somente transações em BRL entram na importação.
- A busca usa `GET /v2/transactions` sem filtro de período: traz o histórico disponível a cada sincronização e o `ignoreDuplicates` evita duplicatas. A janela de 90/7 dias prevista no guia não está aplicada até que os parâmetros de data do v2 sejam confirmados.
- A categorização é heurística e pode precisar de correção manual.
- A identificação de pagamentos de fatura depende dos padrões implementados.
- A sincronização insere novos registros; não reconcilia automaticamente alterações de registros existentes.
- A atualização por webhooks não faz parte do fluxo entregue no guia.
- O projeto não implementa modo offline com fila de sincronização.
- Categorias são fixas e compartilhadas; categorias personalizadas são uma evolução.
- O painel calcula o resultado mensal, sem consultar o saldo disponível das contas.
- Capturas de tela, vídeo e endereço do repositório ainda precisam ser adicionados a este README.

### Evoluções propostas no material

- [ ] Categorias personalizadas por usuário.
- [ ] Metas de gasto por categoria.
- [ ] Gráfico de barras dos últimos seis meses.
- [ ] Tema escuro.
- [ ] Lançamentos recorrentes.
- [ ] Testes de componentes com React Native Testing Library.
- [ ] Integração contínua com GitHub Actions.
- [ ] Modo offline com fila de sincronização.
- [ ] Sincronização automática por webhooks do Pluggy.
- [ ] Tela com saldos das contas conectadas.
- [ ] Regras de categoria que aproveitem correções do usuário.
- [ ] Detecção de transferências entre contas próprias.
- [ ] Importação de extratos OFX ou CSV.
- [ ] Testes de contrato com respostas gravadas do agregador.
- [ ] Reaplicar o filtro de período na busca do `GET /v2/transactions`.

Esses itens são propostas de evolução, não funcionalidades confirmadas da versão descrita.

## Roteiro de desenvolvimento

| Etapas do guia | Entrega |
| --- | --- |
| 1–3 | Ambiente, projeto Expo e backend Supabase com RLS. |
| 4–6 | Tipos, tema, regras puras, testes, validação, serviços e hooks. |
| 7–9 | Componentes, autenticação, navegação e CRUD de lançamentos. |
| 10–11 | Painel, gráfico e validação do app base. |
| 12–14 | Conceitos de Open Finance, regras testadas, banco e Edge Functions. |
| 15–16 | Conexão bancária no app, importação, desconexão e validação. |
| 17 | Organização do GitHub, README, APK e apresentação. |

O apêndice docente do guia sugere seis encontros. A rubrica distribui 10 pontos entre funcionalidade base (1,5), Open Finance (2,0), segurança e privacidade (1,5), arquitetura (1,5), testes (1,5), repositório e README (1,0) e demonstração (1,0).

## Apresentação no portfólio

Os diferenciais técnicos a demonstrar são: separação em camadas, proteção dos segredos, RLS, verificação de propriedade da conexão, importação idempotente, prevenção de dupla contagem de faturas e cálculo financeiro em centavos.

Para apresentar a implementação, prepare:

- Capturas reais do painel, da lista de lançamentos e das contas bancárias.
- Vídeo curto mostrando login, conexão com Pluggy Bank, importação e atualização do painel.
- Resultado dos testes executados no repositório.
- Instruções de configuração reproduzíveis e arquivos SQL versionados.
- Contatos do autor (por exemplo, GitHub e LinkedIn).

Não há imagens ou links de demonstração inventados neste README. Acrescente esses elementos quando estiverem disponíveis.

## Autoria e créditos

**Desenvolvimento:** Hiarley de Morais Rabelo, aluno do 4º semestre, no IESB.

**Orientação:** Prof. Me. Bruno Assunção Dias, na disciplina de Programação para Dispositivos Móveis.

**Material-base:** este projeto é construído a partir do documento **FinTrack — Guia de construção passo a passo**, edição de **setembro de 2026**, de autoria do **Prof. Me. Bruno Assunção Dias**, IESB, identificado no guia como projeto 1 de 5 de um portfólio profissional. O guia é o material didático de referência; a implementação deste repositório é desenvolvida pelo aluno.

Referências dentro do guia:

- Páginas 3–5: escopo, tecnologias e arquitetura.
- Páginas 6–14: ambiente, configuração e banco de dados.
- Páginas 15–71: domínio, testes, interface e app base.
- Páginas 72–114: integração Open Finance, segurança e validação.
- Páginas 115–118: README, build e portfólio.
- Páginas 119–123: estrutura final, problemas comuns, evoluções e critérios de avaliação.

**Licença:** consulte o arquivo [`LICENSE`](LICENSE) na raiz do repositório.

## Autor

Hiarley de Morais Rabêlo · [LinkedIn](https://www.linkedin.com/in/hiarley-morais-bbb360352) · [GitHub](https://github.com/Hiarley007)