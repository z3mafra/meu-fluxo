# Meu Fluxo — v0.1

Protótipo modular para acompanhar tarefas de trabalho, casa e lazer.

## Executar no computador

É necessário ter Node.js instalado. No terminal, dentro desta pasta:

```sh
npm start
```

Depois, abra <http://localhost:4173> no navegador. O servidor e o app usam apenas módulos nativos do Node e do navegador; não há dependências para instalar.

## O que funciona

- Captura rápida de tarefas, enviadas à Entrada.
- Organização por área e situação: Entrada, Hoje, Próximas ou Aguardando.
- Prazo opcional: tarefas atrasadas ou com prazo para hoje aparecem em Hoje, e as listas ficam ordenadas por prazo.
- Conclusão, edição e exclusão (com confirmação na própria tela). As concluídas ficam em “Concluídas”, na tela Tarefas, e podem ser reabertas.
- Telas: Hoje, Próximas, Tarefas e Entrada.
- Filtro por Trabalho, Casa e Lazer.
- Salvamento local no navegador deste aparelho.

## Limites desta versão

Os dados não sincronizam entre aparelhos. A análise de e-mails, notificações, tarefas recorrentes e contas de usuário ficam para depois dos testes de uso.

## Estrutura

- `src/main.js`: inicialização, navegação e eventos da interface.
- `src/render.js`: componentes visuais e telas.
- `src/tasks.js`: regras de criação, edição e consulta de tarefas.
- `src/storage.js`: leitura e gravação local.
- `src/styles.css`: aparência responsiva.
- `scripts/serve.mjs`: servidor local sem dependências externas.

## Próximas decisões após o teste

1. Verificar se Entrada, Hoje e Próximas correspondem ao seu modo de organizar.
2. Decidir se a sincronização entre dispositivos é necessária.
3. Testar se a triagem de e-mails merece uma etapa própria.

## Usar no iPhone

Hospede a pasta em qualquer endereço HTTPS (por exemplo, GitHub Pages: Settings → Pages → Deploy from a branch → `main` / root). No Safari, abra o endereço, toque em Compartilhar e escolha “Adicionar à Tela de Início”. O app abre em tela cheia, com ícone próprio. Os dados ficam salvos no aparelho; a versão da tela de início e a do Safari guardam listas separadas.
