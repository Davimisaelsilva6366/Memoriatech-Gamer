#!/data/data/com.termux/files/usr/bin/bash

set -Eeuo pipefail

ROOT="$HOME/Memoriatech-Gamer"
cd "$ROOT"

PLUGIN="android/app/src/main/java/com/cawboygamer/memoriategamer/HardwarePlugin.kt"
MAIN="android/app/src/main/java/com/cawboygamer/memoriategamer/MainActivity.java"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$HOME/Memoriatech-backup-$STAMP.tar.gz"

echo
echo "======================================"
echo "   MEMÓRIATECH GAMER - REPARAÇÃO"
echo "======================================"

for file in "$PLUGIN" "$MAIN" "package.json" "capacitor.config.json"; do
    if [ ! -f "$file" ]; then
        echo "[ERRO] Arquivo ausente: $file"
        exit 1
    fi
done

echo
echo "[1/6] Criando backup completo..."

tar -czf "$BACKUP" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=android/.gradle \
    --exclude=android/app/build \
    .

echo "[OK] Backup: $BACKUP"

echo
echo "[2/6] Conferindo o plugin..."

if ! grep -q '@CapacitorPlugin(name = "Hardware")' "$PLUGIN"; then
    echo "[ERRO] Plugin Hardware não encontrado."
    exit 1
fi

if ! grep -q 'fun getInfo(call: PluginCall)' "$PLUGIN"; then
    echo "[ERRO] Método getInfo não encontrado."
    exit 1
fi

echo "[OK] Estrutura do plugin reconhecida."

echo
echo "[3/6] Corrigindo métricas indisponíveis..."

python - <<'PY'
from pathlib import Path

p = Path("android/app/src/main/java/com/cawboygamer/memoriategamer/HardwarePlugin.kt")
s = p.read_text()

old = '''result.put(
                    "batteryTempC",
                    if (temperature >= 0) temperature / 10.0 else 0.0
                )'''

new = '''result.put(
                    "batteryTempC",
                    if (temperature >= 0) temperature / 10.0 else null
                )'''

if old in s:
    s = s.replace(old, new, 1)
elif '"batteryTempC"' not in s:
    raise SystemExit("Não encontrei o campo batteryTempC. Nenhuma alteração feita.")

for field in ("cpuFrequencyGhz", "cpuUsagePct", "cpuTempC", "socTempC"):
    import re
    pattern = r'result\.put\("' + re.escape(field) + r'",\s*0(?:\.0)?\)'
    s, count = re.subn(pattern, f'result.put("{field}", null)', s, count=1)
    if count == 0:
        if f'"{field}"' not in s:
            raise SystemExit(f"Campo {field} não encontrado. Verifique o plugin.")

p.write_text(s)
print("Métricas sem leitura real agora retornam null.")
PY

echo
echo "[4/6] Conferindo alterações..."

git diff --check || {
    echo "[AVISO] Existem avisos de formatação."
}

echo
echo "[5/6] Executando verificações..."

npm run lint
npm run build
npx cap sync android

echo
echo "[6/6] Resultado..."

echo
echo "Arquivos modificados:"
git status --short

echo
echo "======================================"
echo " REPARAÇÃO E VERIFICAÇÕES CONCLUÍDAS"
echo "======================================"
echo "Backup preservado em:"
echo "$BACKUP"
echo
echo "IMPORTANTE: isso ainda não confirma a geração do APK."
