# Memóriatech Gamer

**Sua memória, seu desempenho, seu controle.**

Aplicativo/protótipo de monitoramento de hardware, diagnóstico e gerenciamento inteligente para Android.

## Recursos planejados
- Painel de memória RAM, CPU e informações de GPU disponíveis no Android.
- Monitoramento de sensores térmicos compatíveis.
- Diagnóstico de Wi-Fi e rede.
- Visão geral do armazenamento e gerenciamento de arquivos.
- Ferramentas de limpeza com confirmação explícita.
- Modo Gamer com indicadores de desempenho.
- Temas futuristas em azul, rosa, roxo, dourado, branco e preto.

## Tecnologias do protótipo recebido
- React
- TypeScript
- Vite

> **Nota:** o protótipo atual é uma aplicação web. Recursos de hardware Android dependem de uma camada nativa (por exemplo, Kotlin/Android APIs ou Capacitor) e das permissões e limitações do sistema. Dados não disponíveis devem ser exibidos como indisponíveis, nunca simulados como medições reais.

## Desenvolvimento
Instale as dependências e inicie o ambiente local:

```bash
npm install
npm run dev
```

Consulte `package.json` para os scripts disponíveis.

## Segurança
O app deve solicitar apenas permissões necessárias, não apagar dados sem autorização e respeitar o isolamento de aplicativos do Android.
