# FinSight Quick Docker Setup

This is the one-command local setup for development and thesis demonstrations. It starts the complete local infrastructure, imports the bundled thesis database, builds FinSight, and exposes the application at <http://localhost:8080>.

## Requirements

- Docker Engine with Docker Compose on Linux; or
- Docker Desktop on Windows or macOS;
- at least 8 GB RAM and 15 GB free disk space;
- an internet connection for the first image and dependency downloads.

Docker must be running before starting the setup.

## Windows

Open Command Prompt or PowerShell in the repository directory and run:

```powershell
.\quick-docker-setup.cmd
```

The `.cmd` launcher runs `quick-docker-setup.ps1` with a process-only execution-policy bypass. It does not change the machine's permanent PowerShell execution policy.

## Linux or macOS

Run from the repository directory:

```bash
chmod +x quick-docker-setup.sh
./quick-docker-setup.sh
```

## What the setup does

The setup:

- creates `.env.quickstart` with generated local MySQL and Redis passwords;
- leaves an existing `.env` unchanged;
- starts MySQL, Redis, Kafka, and MQTT;
- imports `deployment/mysql/init/01-finsight.sql` into a new MySQL volume;
- creates the required Kafka topics;
- builds the frontend and backend images;
- starts the core FinSight services and local Nginx gateway;
- waits for the REST health check to pass.

The first build can take several minutes. Later runs reuse Docker images, build caches, and local data.

## Open FinSight

- Application: <http://localhost:8080>
- Health check: <http://localhost:8080/health>
- Swagger UI: <http://localhost:8080/api-docs/>

## Common commands

Windows:

```powershell
.\quick-docker-setup.cmd status
.\quick-docker-setup.cmd logs
.\quick-docker-setup.cmd stop
```

Linux or macOS:

```bash
./quick-docker-setup.sh status
./quick-docker-setup.sh logs
./quick-docker-setup.sh stop
```

`stop` removes the containers and network but preserves the local MySQL, Redis, Kafka, and MQTT data volumes.

## Reload the bundled thesis database

The database snapshot is imported only when the MySQL volume is first created. To delete all local service data and reload the original snapshot, stop the stack with volumes before rerunning setup.

Windows, in one line:

```powershell
docker compose --env-file .env.quickstart -f docker-compose.yml -f docker-compose.local.yml down -v
.\quick-docker-setup.cmd
```

Linux or macOS:

```bash
docker compose \
  --env-file .env.quickstart \
  -f docker-compose.yml \
  -f docker-compose.local.yml \
  down -v

./quick-docker-setup.sh
```

> **Warning:** `down -v` permanently deletes all local database, Redis, Kafka, and MQTT changes.

## Optional integrations

The quick setup does not enable the DNSE live-market collector or PayOS webhook service. Those integrations require real authorized credentials and additional configuration in [DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md).

## Basic troubleshooting

- `Docker is not installed`: install Docker Desktop or Docker Engine with Compose.
- `Docker Desktop is not running`: start Docker Desktop and wait until its engine is ready.
- `port is already allocated`: stop the application using ports `8080`, `9092`, `1883`, or `9001`.
- setup or health-check failure: run the platform-specific `logs` command above.
- old or unwanted database contents: follow [Reload the bundled thesis database](#reload-the-bundled-thesis-database).

For infrastructure customization, production deployment, security, backups, and detailed troubleshooting, read [DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md).
