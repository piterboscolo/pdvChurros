# Arquitetura

## Processos

```text
Electron (processo principal)
  ├─ guarda certificado, segredo fiscal e a chave deste terminal
  ├─ sobe o Express em 127.0.0.1
  ├─ abre a janela do React
  └─ expõe, pelo preload, só os canais de janela, pasta, impressão, certificado e backup

React (renderer)
  └─ HTTP para o Express. Sem chave do Supabase e sem acesso ao Postgres.

Express
  ├─ rotas
  ├─ validação Zod
  ├─ serviços (regras)
  ├─ Prisma → PostgreSQL no Supabase
  ├─ FiscalService → FiscalProvider
  └─ PrintService → fila em print_jobs → ESC/POS neste computador
```

O renderer não recebe `DATABASE_URL`, senha do banco nem a chave anon. O Express usa o pooler do Supabase em modo sessão, na porta 5432, porque o processo fica aberto o dia inteiro e o Prisma usa prepared statements. A migration usa `DIRECT_URL`, a conexão direta na porta 5432 de `db.<projeto>.supabase.co`. Se essa URL falhar por IPv6, a migration usa o mesmo pooler de sessão.

Vários computadores apontam para o mesmo projeto. Cada um se registra em `terminals` com uma `machine_key` criada no primeiro acesso. A gaveta e as impressoras pertencem ao terminal. Mesas, pedidos, cozinha, produtos e estoque são comuns.

## Supabase

| Uso | Onde |
| --- | --- |
| Tabelas do PDV | Postgres, schema `public` |
| Fotos e logotipo | Storage do mesmo projeto, com URL assinada pelo backend |
| Backup do banco | Backup do projeto Supabase |
| API REST anon | Sem permissão de leitura nem escrita |

O schema `public` é exposto pela API do Supabase. Por isso, logo depois da migration, o script `backend/prisma/sql/lock_data_api.sql` revoga `anon` e `authenticated`, liga RLS em todas as tabelas do PDV e cria os índices de um caixa aberto e uma impressora padrão por terminal. O usuário `postgres` da connection string continua gravando, porque ele ignora RLS. Essa connection string fica só no `.env` do backend.

A cozinha de outro computador vê o mesmo pedido porque lê o mesmo banco, pela API local daquele computador. A consulta é periódica. Realtime do Supabase fica de fora enquanto a API pública estiver fechada.

## Segurança da janela

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- preload entrega um objeto pequeno, com canais nomeados
- navegação externa bloqueada
- certificado, CSC e senha não entram em log

A senha do funcionário será hash Argon2id. A recuperação de acesso é feita na própria tela: um código gerado no primeiro acesso, guardado só como hash no Supabase, redefine a senha do administrador.

## O que fica no computador

| Caminho | Conteúdo |
| --- | --- |
| `%APPDATA%\pdv-restaurante\terminal.json` | Nome e `machine_key` deste caixa |
| `%APPDATA%\pdv-restaurante\fiscal\certs` | Certificado A1 |
| `%APPDATA%\pdv-restaurante\fiscal\secrets` | Chave local que cifra CSC e senha do certificado |
| `%APPDATA%\pdv-restaurante\fiscal\xml` | Cópia do XML, repetida também em `fiscal_xml` |
| `%APPDATA%\pdv-restaurante\logs` | Logs |

Uma atualização do instalador substitui o programa e preserva essa pasta. O CSC e a senha do certificado podem ter uma cópia cifrada no Supabase; sem a chave local, esse texto não abre o certificado. A exportação lógica dos dados, para pendrive ou pasta de rede, entra na Fase 10 e exige a permissão `backup.restore` para voltar um backup.

## Dinheiro, quantidade e concorrência

- `MoneyCents` é inteiro. O arredondamento de linha é half-up no serviço, e o valor gravado é o inteiro já arredondado.
- Totais da venda são recalculados no servidor. O valor enviado pela tela é conferido, não aceito às cegas.
- `orders.version`, `sales.version` e `cash_registers.version` sobem a cada alteração. Uma gravação com versão antiga falha e a tela recarrega a conta.
- `client_request_id` em pedidos e vendas é único. Repetir a mesma chave devolve a operação já gravada.
- `idempotency_key` em movimentação de caixa, estoque, ticket de cozinha e job de impressão impede segunda baixa ou segunda via acidental.
- Venda, pagamentos, movimentos de caixa e baixa de estoque do gatilho "na venda" acontecem na mesma transação.
- A NFC-e é outra transação, depois do pagamento confirmado.

## Pedido e venda

`orders` é a conta aberta: mesa, balcão, retirada, delivery ou comanda. Os itens, adicionais e observações ficam nela. Cada envio à cozinha cria um `kitchen_tickets` por setor, só com a quantidade ainda não impressa (`quantity` menos `printedQuantity`).

`sales` nasce no pagamento e guarda o retrato financeiro (`sale_items` e `sale_item_addons`). Cancelar uma venda muda o status e grava quem cancelou. A linha permanece.

Dividir a conta cria uma venda para cada parte, ligada ao mesmo pedido. Um item entra em uma venda só. Se for preciso dividir a quantidade, o serviço parte a linha em duas dentro da transação.

Juntar comandas move os itens para o pedido destino e encerra a origem. Transferir mesa altera `tableId`. As duas ações gravam `audit_logs`. Item já impresso gera aviso de produção na fila, sem preço.

O status da mesa é atualizado na mesma transação do pedido:

| Situação | Status |
| --- | --- |
| Sem pedido aberto | Livre |
| Pedido aberto sem itens ativos | Aguardando pedido |
| Itens lançados, conta ainda não pedida | Ocupada |
| Pré-conta solicitada | Aguardando fechamento |

## Cozinha

A tela da cozinha lê `kitchen_tickets` nos status Aguardando, Em preparação e Pronto. O pedido guarda `kitchenStatus` como resumo, atualizado junto com o ticket, para o painel do dia não varrer todas as linhas.

O tempo de espera usa `createdAt` do ticket. Cada tela consulta o Express do próprio computador, e o Express lê o Supabase. Com a internet no ar, cozinha e caixa veem o mesmo pedido.

## Estoque e ficha técnica

Cada produto declara:

- `NONE` — não controla estoque
- `DIRECT` — baixa o próprio produto
- `RECIPE` — explode a ficha

E quando baixa:

- `ON_KITCHEN_SEND` — ao enviar para produção
- `ON_SALE` — ao receber

O padrão do cadastro novo é `NONE` e `ON_SALE`, para um produto sem ficha não baixar nada. Prato de produção passa a `RECIPE` + `ON_KITCHEN_SEND` no cadastro. Bebida vendida por unidade pode ficar `DIRECT` + `ON_SALE`.

A ficha do produto não inclui o adicional opcional. O adicional tem a própria ficha ou o próprio produto de estoque. `stockApplied` no item e no adicional, somado à chave idempotente do movimento, impede baixa dupla.

`REMOVE` (retirar cebola, por exemplo) não devolve insumo. `restoresStock` existe para o caso em que o estabelecimento decidir o contrário.

Perda e rendimento ficam na ficha: quantidade do item × (1 + perda%) ÷ rendimento. Conversões kg/g e l/ml estão em `shared/constants/units.ts`, com fator em texto decimal. Conversão específica de um produto fica em `unit_conversions`.

Cancelamento depois da baixa gera `CANCEL_REVERSAL` ou `LOSS`, conforme o item já tenha sido produzido. O movimento original permanece.

## Caixa

Há um caixa aberto por terminal. O índice parcial `cash_registers_one_open_per_terminal` impede o segundo. A venda exige o caixa aberto daquele computador. O movimento de venda aponta para o pagamento (`payment_id` único).

O saldo esperado em dinheiro é:

abertura + vendas em dinheiro (valor aplicado, já sem o troco) + suprimentos + entradas − sangrias − despesas − retiradas.

PIX, crédito e débito entram no fechamento por forma e só afetam a gaveta se `affectsDrawer` estiver marcado. Forma nova nasce com `affectsDrawer` desligado.

Divergência no fechamento pede justificativa e um usuário com `cash.close`. O valor contado, o esperado e a diferença ficam no caixa. O relatório de fechamento é um job de impressão do tipo `CASH_CLOSING`.

## Impressão

A fila é a tabela `print_jobs`. O worker de cada computador pega só os jobs das impressoras daquele terminal, marca `PRINTING` e só então envia ESC/POS. Sucesso vira `PRINTED`. Falha vira `FAILED`, com `lastError` em linguagem simples ("A impressora da cozinha não respondeu"). Reenviar um job já impresso não cria outro: a chave idempotente bloqueia.

Rotas (`printer_routes`) ligam tipo de documento e setor à impressora. Um pedido com lanches e bebidas gera um ticket por setor e um job por rota ativa.

Três famílias de layout, sem reaproveitar cabeçalho entre elas:

1. Produção — pedido, mesa ou modalidade, hora, itens, adicionais e observações. Sem valor.
2. Comprovante comercial — traz a frase "Comprovante não fiscal".
3. DANFE NFC-e — só com documento autorizado, ou em contingência quando a regra vigente permitir a via específica.

Larguras 58 mm e 80 mm. Conexão USB, rede ou serial.

## Fiscal

Camadas previstas, ainda sem transmissão:

- `FiscalService` — decide se a venda pode tentar emitir e grava estado
- `FiscalProvider` — contrato
- `NFCeProvider` — SEFAZ-SP ou provedor, escolhido na configuração
- repositório dos documentos, eventos e XML

Estados: não emitida, pendente, em processamento, autorizada, rejeitada, cancelada e em contingência. Autorizada exige protocolo e chave de acesso. O número da NFC-e é consumido quando o documento é gravado, inclusive se a SEFAZ rejeitar. Homologação e produção têm sequências separadas.

O schema guarda regime, série e ambiente. O arquivo do certificado fica no computador que emite. CSC e senha ficam cifrados com a chave de `%APPDATA%\pdv-restaurante\fiscal\secrets`. NCM, CEST, CFOP, origem, CST, CSOSN, unidade tributável e alíquotas ficam no perfil do produto, todos opcionais e vazios até o cadastro. A emissão recusa o item incompleto com a mensagem de que os dados fiscais precisam ser conferidos com o contador. A numeração da NFC-e é uma linha travada na transação, então dois computadores não gastam o mesmo número.

A contingência será implementada na Fase 9 segundo a nota técnica vigente da NFC-e em São Paulo. O banco já separa o estado, o motivo e o payload para regularização posterior. Esta etapa não escolhe um modo de contingência no lugar da legislação.

Integração com WhatsApp Business tem só a tabela `integration_configs`, desligada. Não há envio de mensagem.

## Permissões

Perfis fixos: Administrador, Gerente, Operador e Cozinha. As chaves e o conjunto inicial de cada perfil estão em `shared/constants/permissions.ts`.

O operador vende, atende mesa, comanda e delivery. Desconto, cancelamento, caixa, estoque, preço e relatório financeiro dependem de permissão extra. A cozinha enxerga somente a produção. Operação sensível grava `audit_logs` com o usuário.

## O que a tela não mostra

Falhas técnicas viram frases curtas. Sem conexão, a tela diz: "Sem conexão. O pedido não foi salvo." O detalhe fica no log. Venda, comanda e mesa já confirmadas pelo Supabase continuam lá se o programa fechar. Uma finalização interrompida antes do commit não deixa pagamento pela metade; a tentativa seguinte usa a mesma chave e conclui ou reapresenta a venda já feita.

## Fases

O detalhamento operacional de cada fase está no `PROGRESS.md`. Cada fase termina com os testes do que ela passou a gravar de verdade. A Fase 1 ainda não grava venda: ela prova que a janela abre, o backend responde e a migration está aplicada no Supabase, com a API anon sem acesso às tabelas.
