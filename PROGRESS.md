# Andamento

Atualizado em 7 de novembro de 2026.

## Funcionalidades concluídas

- Arquitetura definida: Electron, React/Vite, Express local, Prisma e PostgreSQL no Supabase.
- Estrutura de pastas criada (`electron`, `backend`, `frontend`, `shared`, `scripts`, `tests`, `docs`).
- Modelo de dados em `backend/prisma/schema.prisma`, com migrations em `backend/prisma/migrations`.
- Aplicação da Fase 1 sobe de verdade: Electron com isolamento de contexto, React com a tela do PDV, Express em `127.0.0.1:3920`.
- A tela principal tem três colunas, modalidades, busca, resumo, atalhos F1–F8 e as rotas de mesas, comandas, vendas e cozinha. O catálogo e as listas vêm do banco. Sem produtos, a tela avisa. Finalizar com a conta vazia não grava venda.
- Testes de centavos, leitura de valor e rótulo fiscal passando. Typecheck do frontend e do backend passando. `/health` responde.
- Contratos compartilhados de permissão, atalho, rótulo, unidade e dinheiro em `shared/`.
- Repositório Git inicializado nesta pasta, na branch `main`, ainda sem commit.

## Funcionalidades pendentes

- Fase 1 — aplicar as migrations no Supabase. O código e os SQL estão prontos. Falta colocar as connection strings reais no `.env`.
- Fase 2 — Login, perfis, permissões e assistente de primeiro acesso.
- Fase 3 — Categorias, produtos, ingredientes, adicionais e fichas técnicas.
- Fase 4 — Venda, pagamento, troco, desconto e proteção contra clique duplo.
- Fase 5 — Mesas, comandas e delivery.
- Fase 6 — Cozinha (KDS) e impressão térmica ESC/POS.
- Fase 7 — Abertura, movimentação e fechamento de caixa.
- Fase 8 — Estoque e relatórios, com exportação PDF e Excel.
- Fase 9 — NFC-e modelo 65, em homologação, para a SEFAZ-SP.
- Fase 10 — Backup, restauração, testes de ponta a ponta e instalador Windows.

## Erros encontrados

Nenhum erro de compilação. Os testes de dinheiro e de rótulo fiscal passaram.

A migration não chegou ao Supabase. O `.env` ainda usa `PROJECT_REF`, `PASSWORD` e `REGION`. O Prisma respondeu `P1001` ao tentar `db.PROJECT_REF.supabase.co:5432`. Com isso, `/health` responde `database: down` e a tela mostra "Sem conexão com o banco".

O Git detectado aponta para o perfil do usuário (`C:\Users\Carola`), não para esta pasta. O repositório do produto deve nascer dentro de `pdvChurros` na Fase 1, para dados do sistema não se misturarem com arquivos pessoais.

## Decisões técnicas

- Banco no Supabase (PostgreSQL). Vários caixas e a cozinha leem o mesmo dado. A operação de venda depende de internet.
- A tela não acessa o Supabase. O Express usa `DATABASE_URL` (pooler em modo sessão) e o Prisma Migrate usa `DIRECT_URL`.
- Depois da migration, `lock_data_api.sql` revoga anon/authenticated e liga RLS. A connection string do postgres não vai para o renderer.
- Cada computador é um `terminals`, com a própria gaveta e as próprias impressoras. Um índice garante um caixa aberto por terminal.
- API local em `127.0.0.1`. IPC só para janela, pasta local, impressora, certificado e backup.
- `contextIsolation` ligado e `nodeIntegration` desligado.
- Dinheiro em centavos (`Int`). Quantidade em `Decimal`.
- Pedido operacional (`orders`) separado da venda financeira (`sales`). Uma mesa pode receber vários envios à cozinha antes de um pagamento. A divisão da conta gera mais de uma venda para o mesmo pedido.
- Itens ficam em `order_items`. A comanda (`tabs`) agrupa o atendimento e não tem uma segunda cópia dos itens.
- Ingredientes são produtos com tipo `INGREDIENT` e `sellable = false`. Isso evita dois estoques para o mesmo insumo.
- Baixa de estoque conforme `stockMode` e `deductTrigger`. Adicional tem ficha própria. Modificador de retirada não devolve estoque, salvo `restoresStock`.
- A NFC-e corre depois do commit da venda. Falha de transmissão não apaga o pagamento. Documento só fica autorizado com protocolo.
- Campos fiscais do produto nascem vazios. O sistema não preenche NCM, CFOP, CST, CSOSN nem alíquota.
- Comprovante comercial e comanda de produção são modelos diferentes do DANFE. A via de cozinha sai sem preço, salvo configuração explícita.
- Numeração de pedido, venda e senha de cozinha em `number_sequences`. Numeração da NFC-e em `fiscal_number_sequences`, separada por série e ambiente.
- Licenciamento por estabelecimento fica reservado em `system_settings` para uma versão futura.
- Backup do banco fica a cargo do projeto Supabase. XML, certificado e a chave fiscal continuam com cópia no computador. A exportação lógica pelo aplicativo entra na Fase 10.

## Próxima etapa

Colocar no `.env` as connection strings do projeto Supabase e rodar `npm run db:migrate`. Isso cria as tabelas e executa o bloqueio da API anon.

Depois, Fase 2: login, perfis, permissões e o assistente de primeiro acesso, com o administrador criado de verdade.
