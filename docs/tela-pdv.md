# Tela principal do PDV

Esta é a tela do dia a dia. O layout abaixo é o contrato visual. Na Fase 1 a janela já abre nessa disposição. Pagamento, estoque e cozinha passam a funcionar nas fases em que o dado existe. Até lá, a região aparece como parte da tela e a ação que ainda não tem regra não finge concluir uma venda.

Resolução de referência: 1366×768. Confortável em 1920×1080. Alvo de toque mínimo de 56 px. Texto grande o bastante para leitura a uma distância de balcão.

## Disposição

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Operador        Caixa        Impressora        Fiscal        data e hora │
├──────────────────────┬─────────────────────────┬───────────────────────────┤
│ Categorias           │ Mesa | Balcão | Retirada│ Resumo                    │
│                      │ | Delivery              │ Subtotal                  │
│ Busca (F2)           │                         │ Desconto                  │
│                      │ Itens da conta          │ Taxa                      │
│ Grade de produtos    │ qtd, adicionais, obs    │ Total                     │
│                      │                         │ Pagamentos                │
│                      │                         │ Finalizar (F5)            │
└──────────────────────┴─────────────────────────┴───────────────────────────┘
```

Proporção das colunas: categorias e produtos 38%, conta 34%, resumo 28%. Em altura menor, a grade de produtos rola sozinha. O total e o botão finalizar permanecem visíveis.

Topo, sempre:

- nome do funcionário logado
- caixa aberto, com o valor de abertura, ou o aviso "Caixa fechado"
- impressora: pronta, com falha ou sem configuração
- fiscal: desligado, homologação ou produção, mais pendências se houver
- data e hora locais

## Modalidade

Ao começar o atendimento o operador escolhe Mesa, Balcão, Retirada ou Delivery.

| Modalidade | O que a conta pede |
| --- | --- |
| Mesa | Número da mesa, pessoas e, se quiser, nome |
| Balcão | Nenhum dado extra |
| Retirada | Nome para chamar |
| Delivery | Nome, telefone, endereço, número, complemento, bairro, referência, taxa e entregador |

Mesa ou comanda já aberta volta para a mesma conta. Sair da tela não apaga item lançado.

## Produtos

Categorias em botões altos, na ordem do cadastro. A grade mostra nome e preço. Produto com complemento obrigatório abre o painel de personalização antes de entrar na conta. Produto simples entra com quantidade 1.

O painel de personalização cobre:

- grupos de adicionais, com mínimo, máximo e preço
- sabores, tamanho e borda quando o produto tiver essas opções
- observação do item

Busca por nome e por código de barras no mesmo campo. Leitor USB funciona como teclado: o código termina em Enter e o item entra na conta. F2 foca a busca.

## Conta

Cada linha mostra produto, quantidade, adicionais, observação, preço unitário e total do item. A quantidade muda por botões grandes. Remover item já enviado à cozinha exige a permissão de cancelar item e gera aviso de produção. Remover item ainda não enviado só tira da conta.

O resumo mostra subtotal, desconto, taxa de entrega quando houver, e total. Desconto pede a permissão `discount.apply` e o motivo. Quem não tem permissão vê o pedido de autorização de outro funcionário, sem mensagem técnica.

## Pagamento

Formas iniciais: Dinheiro, PIX, Crédito e Débito. Outras formas entram no cadastro. O pagamento dividido soma parcelas até cobrir o total. O restante aparece o tempo todo.

Em dinheiro, o operador informa o valor recebido e a tela mostra o troco. Troco negativo não finaliza: a mensagem é "Valor recebido menor que o total".

Finalizar pede confirmação com modalidade, total e troco. O primeiro clique gera um identificador e desliga o botão. Um segundo clique, ou uma nova tentativa depois de queda da conexão, reutiliza o identificador. O servidor devolve a venda já gravada no Supabase em vez de criar outra. Se a gravação não chegar ao banco, a conta permanece na tela e a mensagem é: "Sem conexão. A venda não foi concluída."

Com caixa fechado, finalizar explica que é preciso abrir o caixa (F7) e não grava a venda.

## Depois de gravar

Na mesma transação da venda:

1. gravar a venda e o número
2. gravar itens e adicionais
3. gravar pagamentos e troco
4. baixar estoque se o gatilho do produto for na venda e ainda não tiver baixado
5. lançar o caixa
6. criar os tickets de cozinha que ainda não existirem
7. enfileirar a impressão configurada

Depois do commit, a tela oferece, conforme a configuração:

- via de produção, se a impressão automática estiver desligada
- comprovante não fiscal
- NFC-e, somente se a configuração fiscal estiver completa

A NFC-e não volta atrás o pagamento se a SEFAZ não responder. A venda fica com a situação fiscal visível: não emitida, pendente, autorizada, rejeitada ou em contingência.

## Atalhos

| Tecla | Ação |
| --- | --- |
| F1 | Nova venda |
| F2 | Pesquisar produto |
| F3 | Consultar mesas |
| F4 | Consultar comandas |
| F5 | Finalizar pedido |
| F6 | Consultar vendas |
| F7 | Abrir caixa |
| F8 | Fechar caixa |
| Esc | Voltar ou fechar o painel |

Os atalhos padrão estão em `shared/constants/shortcuts.ts`. A configuração do estabelecimento pode substituir cada um.

## Fora desta tela

Mesas em mapa, cozinha em três colunas, cadastros e relatórios têm páginas próprias. O PDV continua sendo a rota inicial de quem opera venda. O perfil Cozinha entra direto na produção e não vê pagamento.
