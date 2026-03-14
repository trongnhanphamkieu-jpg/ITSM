#!/bin/bash
# ITMS — Database Restore Script
# Usage: ./restore.sh <backup_file.sql.gz>

set -euo pipefail

BACKUP_FILE="${1:?Usage: ./restore.sh <backup_file.sql.gz>}"
DB_NAME="${DB_NAME:-itms}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-postgres}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ File not found: $BACKUP_FILE"
  exit 1
fi

echo "⚠️  ITMS Database Restore"
echo "   Source: ${BACKUP_FILE}"
echo "   Target: ${DB_NAME}@${DB_HOST}"
echo ""
echo "   This will OVERWRITE the current database!"
read -p "   Continue? (y/N): " confirm
[ "$confirm" = "y" ] || [ "$confirm" = "Y" ] || { echo "Cancelled."; exit 0; }

echo "🔄 Restoring..."
gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" --quiet

echo "✅ Restore complete!"
echo "   Verify at: http://localhost:4000/api/v1/health"
