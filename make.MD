# Make Command Reference

This document describes the targets provided by the root `Makefile` for this project. The targets wrap the Docker Compose services `mongodb`, `backend`, and `frontend`.

## Prerequisites

- GNU Make
- Docker Engine or Docker Desktop
- Docker Compose v2, available as `docker compose`

Run commands from the repository root, where the `Makefile` and `docker-compose.yml` are located. Running `make` without a target prints the help summary.

## Quick Start

```sh
# Build images and start all services in the background
make up

# Show service status
make ps

# Follow all service logs
make logs

# Stop and remove containers and the Compose network
make down
```

When the services are running, the frontend is at <http://localhost:3000>, the backend API is at <http://localhost:8000>, and the API docs are at <http://localhost:8000/docs>.

## Targets

### `help`

Print a short summary of the available targets. This is also the default target.

```sh
make
make help
```

### `up`

Build images if needed and start all services in the background. Use `make logs` or a service-specific logs target to watch output afterward.

```sh
make up
```

### `dev`

Build images if needed and run Compose in the foreground. Logs appear directly in the terminal. Press `Ctrl+C` to stop the foreground process; use `make down` afterward if you also want to remove the containers and network.

```sh
make dev
```

### `down`

Stop and remove the project containers and network. Named MongoDB volumes are preserved, so database data remains available the next time the services start.

```sh
make down
```

This target does not use `docker compose down --volumes` and will not delete the database volumes.

### `stop` and `start`

`stop` stops the existing containers without removing them. `start` starts containers that were previously created and stopped. Use `make up` to create missing containers or build images.

```sh
make stop
make start
```

### `restart`

Restart all services. Set `SERVICE` to restart only one Compose service.

```sh
make restart
make restart SERVICE=backend
make restart SERVICE=frontend
make restart SERVICE=mongodb
```

Restarting does not rebuild images. To rebuild, use `make build` or `make rebuild`, then `make up` to recreate and start containers with the new images.

### `build`

Build the Compose service images without starting containers.

```sh
make build
```

### `rebuild`

Build all service images without using the Docker build cache. This can take longer than `make build`.

```sh
make rebuild
```

This target only builds images; it does not restart running containers. Run `make up` afterward to start containers using the rebuilt images.

### `ps`

Show the Compose service and container status.

```sh
make ps
```

### `logs`

Follow the most recent 100 log lines from all services. Press `Ctrl+C` to stop following logs; this does not stop the containers.

```sh
make logs
```

### `logs-backend`, `logs-frontend`, and `logs-mongodb`

Follow the most recent 100 log lines from one service. These are useful when diagnosing API startup, React development-server issues, or MongoDB startup.

```sh
make logs-backend
make logs-frontend
make logs-mongodb
```

### `config`

Validate and print the resolved Docker Compose configuration. Review the output before sharing it, since Compose configuration can include environment values.

```sh
make config
```

### `shell`

Open an interactive `sh` shell in a running service container. The default service is `backend`; specify `SERVICE` to choose another service. The target requires that the selected container is already running.

```sh
# Open a shell in the backend (default)
make shell

# Open a shell in the frontend
make shell SERVICE=frontend

# Open a shell in MongoDB's container
make shell SERVICE=mongodb
```

## Make Variables

### `SERVICE`

`SERVICE` selects a service for `restart` or `shell`. Valid service names in this Compose project are `mongodb`, `backend`, and `frontend`. With no value, `restart` applies to all services and `shell` defaults to `backend`.

```sh
make restart SERVICE=backend
make shell SERVICE=frontend
```

### `COMPOSE`

`COMPOSE` controls the Docker Compose command used by the targets. Its default is `docker compose`.

```sh
make ps COMPOSE='docker compose --ansi never'
```

## Common Debugging Workflow

```sh
# Start the stack, then inspect container status
make up
make ps

# Follow only the service that needs investigation
make logs-backend

# Restart a single service after diagnosing it
make restart SERVICE=backend

# Inspect the resolved configuration if Compose reports a config error
make config
```
