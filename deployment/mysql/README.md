# Local thesis database snapshot

`init/01-finsight.sql` is a complete snapshot of the configured FinSight thesis database exported on July 4, 2026. It contains the schema and demonstration data for all seven application tables.

The local Compose override mounts the snapshot into `/docker-entrypoint-initdb.d`. The official MySQL image imports it only when `mysql-data` is first created. Normal setup reruns preserve the existing local database.

To reload the snapshot, explicitly remove the local Compose volumes and run the quick setup again. This deletes all subsequent local database, Redis, Kafka, and MQTT changes:

```bash
docker compose \
  --env-file .env.quickstart \
  -f docker-compose.yml \
  -f docker-compose.local.yml \
  down -v

./quick-docker-setup.sh
```

The snapshot is demonstration data, not a versioned migration system. Regenerate and review it whenever the application schema or approved thesis dataset changes.
