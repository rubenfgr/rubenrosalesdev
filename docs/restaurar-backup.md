# Copias de seguridad de Postgres y restauración

## Cómo se hacen

El servicio `backup` del compose (`rubenrosales-backup`, imagen `postgres:17`) ejecuta `pg_dump -Fc` al arrancar y cada 24 h y deja el fichero `rr-AAAAMMDD-HHMM.dump` en el volumen `backups`. Guarda los 14 más recientes (`BACKUP_KEEP`) y borra el resto. El log dice si salió bien.

```bash
docker logs --tail 20 rubenrosales-backup          # «backup ok: /backups/… (tamaño)» o «backup FALLO»
docker exec rubenrosales-backup ls -lh /backups     # copias disponibles
docker compose restart backup                       # fuerza una copia ahora
```

**Copia externa:** el volumen vive en el mismo VPS, así que no protege de perder el servidor. La copia externa cifrada está pendiente de elegir el destino (decisión D-6 del plan, T-8.2). Hasta entonces, descarga alguna copia de vez en cuando con `docker cp`.

## Restaurar (probado en local con estos comandos)

1. Saca el `.dump` que quieras del contenedor de copias (en el VPS, desde `/opt/apps/projects/rubenrosalesdev`):
   ```bash
   docker cp rubenrosales-backup:/backups/rr-AAAAMMDD-HHMM.dump ./rr.dump
   ```
2. **Prueba primero en un Postgres limpio** (no toques producción hasta ver que los datos están):
   ```bash
   docker run -d --name rr-restore -e POSTGRES_PASSWORD=x -e POSTGRES_DB=rr postgres:17
   docker cp ./rr.dump rr-restore:/tmp/rr.dump
   docker exec rr-restore pg_restore -U postgres -d rr --no-owner --exit-on-error /tmp/rr.dump
   ```
3. Verifica tablas y filas:
   ```bash
   docker exec rr-restore psql -U postgres rr -c "select (select count(*) from conversations) conversaciones, (select count(*) from messages) mensajes, (select count(*) from leads) leads, (select count(*) from drizzle.__drizzle_migrations) migraciones"
   docker rm -f rr-restore
   ```
   Resultado de la prueba (datos de ejemplo): 1 conversación, 2 mensajes, 1 lead y 4 migraciones; el lead conservaba su `conversation_id`. La tabla de migraciones de Drizzle se restaura, así que la API no vuelve a aplicarlas.
4. **Restaurar en producción** (solo con la decisión de Rubén; sustituye los datos actuales):
   ```bash
   docker compose stop api backup
   docker exec rubenrosales-postgres dropdb -U "$POSTGRES_USER" "$POSTGRES_DB"
   docker exec rubenrosales-postgres createdb -U "$POSTGRES_USER" "$POSTGRES_DB"
   docker cp ./rr.dump rubenrosales-postgres:/tmp/rr.dump
   docker exec rubenrosales-postgres pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --exit-on-error /tmp/rr.dump
   docker compose up -d api backup
   ```
   (`POSTGRES_USER` y `POSTGRES_DB` salen del `.env`: `set -a; . ./.env; set +a`.)

## Qué no incluye

Las copias contienen conversaciones y leads, es decir, datos personales: trátalas igual que la base de datos y respeta la caducidad (una conversación borrada sigue en las copias hasta que rotan, 14 días; ver [privacidad-operativa.md](privacidad-operativa.md)).
