# PDV Restaurante

Sistema de ponto de venda para Windows, feito para restaurante, lanchonete, pizzaria e outros estabelecimentos de alimentação. O programa roda no caixa. O banco é o PostgreSQL do Supabase, compartilhado entre os computadores do salão. Vender, abrir mesa e acompanhar a cozinha exigem conexão com o Supabase. A impressora, o certificado digital e a cópia do XML ficam no computador. A NFC-e ainda depende da SEFAZ ou de um provedor fiscal.

O programa da Fase 1 já abre a tela de vendas, consulta o banco e responde no endereço local. A migration ainda depende das connection strings reais no `.env`. Cadastro, pagamento e NFC-e entram nas fases seguintes.

## Como o sistema se divide

| Parte | Função |
| --- | --- |
| `electron/` | Janela, segurança, pasta de dados, impressora e certificado |
| `frontend/` | Telas em React |
| `backend/` | Regras, API local, Prisma e Supabase |
| `shared/` | Permissões, atalhos, rótulos e o tipo de dinheiro |
| `docs/` | Arquitetura e contrato da tela de vendas |
| `tests/` | Testes das próximas fases |

O operador usa o React. O React conversa com o Express em `127.0.0.1`. O Express é o único processo que grava no banco. O Electron não entrega o Node para a tela.

## Onde ficam os dados

O cadastro, as mesas, as vendas, o caixa, o estoque e a fila de impressão ficam no Supabase. As fotos de produto e o logotipo ficam no Storage do mesmo projeto. A tela fala só com o Express em `127.0.0.1`. A chave anon do Supabase não entra no programa.

No computador, `%APPDATA%\pdv-restaurante\` guarda o que não deve ir em claro para o banco:

- `fiscal\certs\` — certificado A1
- `fiscal\secrets\` — chave que cifra CSC e senha do certificado
- `fiscal\xml\` — cópia local do XML, além do conteúdo gravado no banco
- `logs\`
- identidade deste terminal (`machine_key`)

A connection string fica no `.env` da máquina, fora do Git. O modelo está em `.env.example`.

## Dinheiro e estoque

Valores financeiros são inteiros em centavos. `R$ 10,50` é `1050`. Quantidade de insumo usa decimal. A venda, o caixa, o estoque e a fila de impressão usam chave de idempotência para um clique duplo não lançar a mesma operação duas vezes.

# Como executar

Na pasta do projeto:

```bash
npm install
npm run db:generate
npm run dev
```

O Electron abre a tela do PDV. O backend fica em `http://127.0.0.1:3920` e a interface em `http://127.0.0.1:5173`.

`npm run dev:web` sobe só o backend e o navegador, sem a janela do Electron.

Antes da migration, troque no `.env` os trechos `PROJECT_REF`, `PASSWORD` e `REGION` pelas connection strings do projeto Supabase. Em seguida:

```bash
npm run db:migrate
```

## Documentos

- [Arquitetura e decisões](docs/arquitetura.md)
- [Contrato da tela de PDV](docs/tela-pdv.md)
- [Andamento](PROGRESS.md)
- Modelo do banco: `backend/prisma/schema.prisma`

## Próximo passo

A Fase 1 sobe o Electron, o React e o Express, aplica a primeira migration no Supabase e abre a casca da tela de vendas. As vendas de verdade entram na Fase 4, quando houver produtos, caixa e pagamento.

Antes de qualquer NFC-e em produção, o enquadramento tributário, os produtos e o CSC precisam ser conferidos com o contador do estabelecimento. O ambiente inicial previsto é a homologação da SEFAZ-SP.
