# Memóriatech Gamer

**Sua memória, seu desempenho, seu controle.**

Aplicativo Android de monitoramento de hardware, diagnóstico e otimização gamer com interface cyberpunk e integração nativa via Capacitor e Kotlin.

---

## 🚀 Principais Funcionalidades

### 1. Painel de Telemetria Dinâmico
- **Memória RAM:** Utilização em tempo real (LPDDR5X), memória total, usada e disponível com pontuação de integridade e diagnósticos.
- **Processador (CPU):** Uso geral em porcentagem, frequência de escalonamento em GHz e visualização individual dos núcleos (Prime, Performance e Efficiency).
- **Armazenamento:** Espaço interno flash (UFS), partição utilizada e livre com categorias (Sistema, Jogos, Mídia, Cache).
- **Monitoramento Térmico:** Leituras de sensores de CPU, Bateria e zona térmica do SoC com alertas de risco de thermal throttling.

### 2. Otimização Inteligente de RAM
- Botão interativo de liberação de memória em um toque.
- Execução nativa (`System.gc()` e reciclagem de processos) no Android e algoritmo adaptativo em preview.
- Feedback sonoro sintetizado em Web Audio API e histórico em tempo real de 60 segundos.

### 3. Central de Limpeza Inteligente
- Varredura de arquivos residuais, pacotes APK antigos, miniaturas e logs de erro.
- Seleção granular de itens com cálculo imediato do espaço a ser recuperado.
- Exclusão com confirmação de segurança, preservando fotos pessoais e documentos importantes.
- Suporte a mapeamento de cartão MicroSD externo.

### 4. Modo Gamer (Cyber Gaming Accelerator)
- Biblioteca de jogos instalados (Free Fire, COD Mobile, PUBG, Genshin Impact, Roblox, Asphalt 9, etc.).
- Lançamento de jogos com Boost instantâneo e ajuste da taxa de quadros alvo (60, 90, 120 FPS).
- Modo Foco / Não Perturbe para evitar interrupções.
- Gerenciamento e suspensão de processos ociosos em segundo plano para ganho de estabilidade.

### 5. Diagnóstico de Hardware & SpeedTest
- Teste de velocidade integrado de três fases (Ping, Download e Upload) com medição de jitter.
- Diagnóstico de rede Wi-Fi / 5G (SSID, canal, frequência, sinal em dBm e padrão de segurança).
- Identificação da GPU (Renderizador, Fabricante, drivers Vulkan/OpenGL e precisão de shaders).

### 6. Configurações & Personalização
- 6 temas visuais neon (Azul Cyber, Roxo Neon, Rosa Gamer, Ouro Midas, Branco Puro, Preto Stealth).
- Gerenciador de aplicativos instalados com atalhos de inicialização e configurações de sistema.
- Arquitetura de código Kotlin Jetpack Compose pronta para Android Studio.

---

## 📱 Publicação no Google Play Store
- **Conformidade Android 11+ a 14:** Utiliza `<queries>` declaradas para descoberta compatível de apps sem violar a restrição de `QUERY_ALL_PACKAGES`.
- **Permissões Mínimas Necessárias:** Apenas `INTERNET`, `ACCESS_NETWORK_STATE` e `KILL_BACKGROUND_PROCESSES`.
- **Privacidade & Segurança:** Não realiza overclock perigoso, respeita o isolamento de processos (sandbox) e não coleta dados confidenciais do usuário.

---

## 🛠️ Tecnologias
- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Web Audio API
- **Bridge Nativo:** Capacitor 8, Kotlin (`HardwarePlugin.kt`, `MainActivity.java`)
- **Build & Empacotamento:** Vite, Android Gradle Plugin
