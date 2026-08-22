#!/bin/bash

echo "⚠️  DANGER ZONE ⚠️"
echo "Ce script va SUPPRIMER TOUT Docker :"
echo "- conteneurs"
echo "- images"
echo "- volumes"
echo "- réseaux"
echo "- cache"
echo
read -p "Tu es sûr ? (oui/NON) : " confirm

if [ "$confirm" != "oui" ]; then
  echo "❌ Annulé."
  exit 1
fi

echo "🛑 Arrêt de tous les conteneurs..."
docker stop $(docker ps -aq) 2>/dev/null

echo "🧹 Suppression de tous les conteneurs..."
docker rm -f $(docker ps -aq) 2>/dev/null

echo "🗑️ Suppression de toutes les images..."
docker rmi -f $(docker images -aq) 2>/dev/null

echo "📦 Suppression de tous les volumes..."
docker volume rm $(docker volume ls -q) 2>/dev/null

echo "🌐 Suppression de tous les réseaux (hors default)..."
docker network rm $(docker network ls -q | grep -v bridge | grep -v host | grep -v none) 2>/dev/null

echo "🧽 Nettoyage système (cache, build, etc)..."
docker system prune -a --volumes -f

echo "✅ Docker est totalement vidé."
echo "🚀 Prêt pour repartir clean."