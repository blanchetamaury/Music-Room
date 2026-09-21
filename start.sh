#!/bin/bash

# =========================
# Configuration
# =========================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

ENV_FILE="$BACKEND_DIR/.env"
EXPO_LOG="/tmp/expo-tunnel.log"

# =========================
# Vérifications
# =========================

if ! command -v gnome-terminal &> /dev/null; then
    echo "❌ gnome-terminal n'est pas installé."
    exit 1
fi

if ! command -v zsh &> /dev/null; then
    echo "❌ zsh n'est pas installé."
    exit 1
fi

if ! command -v script &> /dev/null; then
    echo "❌ La commande 'script' n'est pas disponible."
    exit 1
fi

if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Dossier backend introuvable : $BACKEND_DIR"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Dossier frontend introuvable : $FRONTEND_DIR"
    exit 1
fi

rm -f "$EXPO_LOG"

echo "🚀 Démarrage de l'environnement de développement..."

# =========================
# Terminal 1 - Prisma
# =========================

gnome-terminal --tab \
    --title="Backend - Prisma" \
    -- zsh -ic "
        cd '$BACKEND_DIR' || exit 1

        echo '======================================'
        echo ' Prisma'
        echo '======================================'
        echo ''

        npx prisma dev

        exec zsh
    "

# =========================
# Terminal 2 - Ngrok
# =========================

gnome-terminal --tab \
    --title="Backend - Ngrok" \
    -- zsh -ic "
        cd '$BACKEND_DIR' || exit 1

        echo '======================================'
        echo ' Ngrok'
        echo '======================================'
        echo ''

        ngrok http 3000

        exec zsh
    "

# =========================
# Terminal 3 - Backend
# =========================

gnome-terminal --tab \
    --title="Backend - Dev" \
    -- zsh -ic "
        cd '$BACKEND_DIR' || exit 1

        echo '======================================'
        echo ' Backend'
        echo '======================================'
        echo ''
        echo '⏳ En attente de l adresse Expo...'
        echo ''

        while [ ! -f '$EXPO_LOG' ]; do
            sleep 1
        done

        while true; do
            CLIENT_URL_MOBILE=\$(sed 's/\x1b\[[0-9;]*m//g' '$EXPO_LOG' \
                | tr -d '\r' \
                | grep -oE 'exp://[a-zA-Z0-9.-]+\.exp\.direct|https://[a-zA-Z0-9.-]+\.exp\.direct' \
                | head -n 1)

            if [ -n \"\$CLIENT_URL_MOBILE\" ]; then
                break
            fi

            sleep 2
        done

        echo ''
        echo \"✅ Adresse Expo trouvée : \$CLIENT_URL_MOBILE\"
        echo ''

        if grep -q '^CLIENT_URL_MOBILE=' '$ENV_FILE'; then
            sed -i \"s|^CLIENT_URL_MOBILE=.*|CLIENT_URL_MOBILE=\$CLIENT_URL_MOBILE|\" '$ENV_FILE'
        else
            echo "" >> '$ENV_FILE'
            echo \"CLIENT_URL_MOBILE=\$CLIENT_URL_MOBILE\" >> '$ENV_FILE'
        fi

        echo '✅ CLIENT_URL_MOBILE mis à jour dans .env'
        echo ''

        echo '📄 Valeur actuelle :'
        grep '^CLIENT_URL_MOBILE=' '$ENV_FILE'
        echo ''

        echo '🚀 Lancement du backend...'
        echo ''

        # === IMPORTANT : on ignore SIGINT au niveau du script ===
        trap '' SIGINT

        # === Boucle de relance automatique ===
        while true; do
            npm run dev
            EXIT_CODE=\$?
            echo ''
            echo \"⚠️  Le backend s'est arrêté (code \$EXIT_CODE). Relance dans 2s...\"
            sleep 2
        done

        exec zsh
    "

# =========================
# Terminal 4 - Frontend
# =========================

gnome-terminal --tab \
    --title="Frontend - Expo" \
    -- zsh -ic "
        cd '$FRONTEND_DIR' || exit 1

        echo '======================================'
        echo ' Frontend - Expo'
        echo '======================================'
        echo ''

        while true; do

            # Nettoyer le log de la tentative précédente
            rm -f '$EXPO_LOG'

            echo '🚀 Lancement d Expo...'
            echo ''

            # 'script' donne un vrai pseudo-terminal à Expo
            # afin de conserver le QR code et l affichage interactif.
            script -qefc 'npm run start' '$EXPO_LOG'

            EXIT_CODE=\$?

            echo ''
            echo '======================================'
            echo \"⚠️ Expo s est arrêté (code \$EXIT_CODE)\"
            echo '======================================'
            echo ''
            echo '🔄 Nouvelle tentative dans 2 secondes...'
            echo ''

            sleep 2
        done
    "

echo ""
echo "✅ Les onglets ont été lancés."
echo ""