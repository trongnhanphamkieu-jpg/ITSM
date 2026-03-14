#!/bin/bash
# ITMS — Database Backup Script
# Usage: ./backup.sh [daily|weekly|manual]
# Cron: 0 2 * * * /path/to/scripts/backup.sh daily

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups}"
DB_NAME="${DB_NAME:-itms}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-postgres}"
RETENTION_DAILY=7
RETENTION_WEEKLY=30

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_TYPE="${1:-manual}"
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${BACKUP_TYPE}_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "🗄️  ITMS Backup — $(date)"
echo "   Type: ${BACKUP_TYPE}"
echo "   Database: ${DB_NAME}"
echo "   Target: ${BACKUP_FILE}"

# Create backup
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" \
  --no-owner --no-privileges --clean --if-exists \
  | gzip > "$BACKUP_FILE"

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "✅ Backup complete: ${BACKUP_SIZE}"

# Cleanup old backups
if [ "$BACKUP_TYPE" = "daily" ]; then
  find "$BACKUP_DIR" -name "*_daily_*" -mtime +$RETENTION_DAILY -delete 2>/dev/null && \
    echo "🧹 Cleaned daily backups older than ${RETENTION_DAILY} days" || true
elif [ "$BACKUP_TYPE" = "weekly" ]; then
  find "$BACKUP_DIR" -name "*_weekly_*" -mtime +$RETENTION_WEEKLY -delete 2>/dev/null && \
    echo "🧹 Cleaned weekly backups older than ${RETENTION_WEEKLY} days" || true
fi

echo "📦 Current backups:"
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -10

echo ""
echo "🔄 To restore: ./restore.sh ${BACKUP_FILE}"
