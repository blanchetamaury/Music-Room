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

        # Attendre que le fichier existe
        while [ ! -f '$EXPO_LOG' ]; do
            sleep 1
        done

        # Attendre qu une URL Expo soit trouvée
        while true; do
            CLIENT_URL=\$(grep -oE 'exp://[^[:space:]]+|https://[^[:space:]]+' '$EXPO_LOG' | head -n 1)

            if [ -n \"\$CLIENT_URL\" ]; then
                break
            fi

            sleep 1
        done

        echo ''
        echo \"✅ Adresse Expo trouvée : \$CLIENT_URL\"
        echo ''

        # =========================
        # Mise à jour du .env
        # =========================

        if grep -q '^CLIENT_URL=' '$ENV_FILE'; then
            sed -i \"s|^CLIENT_URL=.*|CLIENT_URL=\$CLIENT_URL|\" '$ENV_FILE'
        else
            echo \"CLIENT_URL=\$CLIENT_URL\" >> '$ENV_FILE'
        fi

        echo '✅ CLIENT_URL mis à jour dans .env'
        echo ''

        echo '📄 Valeur actuelle :'
        grep '^CLIENT_URL=' '$ENV_FILE'
        echo ''

        echo '🚀 Lancement du backend...'
        echo ''

        npm run dev

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