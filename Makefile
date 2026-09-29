.DEFAULT_GOAL := help

COMPOSE ?= docker compose
SERVICE ?=

.PHONY: help up dev down stop start restart build rebuild ps logs logs-backend logs-frontend logs-mongodb config shell

help:
	@printf '%s\n' \
	  'Usage: make <target>' \
	  '' \
	  'up             Build and start services in the background' \
	  'dev            Build and run services in the foreground' \
	  'down           Stop and remove containers (keeps database volumes)' \
	  'stop / start   Stop or start existing containers' \
	  'restart        Restart all services, or SERVICE=<name>' \
	  'build          Build service images' \
	  'rebuild        Rebuild images without cache' \
	  'ps             Show service status' \
	  'logs           Follow logs for all services' \
	  'logs-backend   Follow backend logs' \
	  'logs-frontend  Follow frontend logs' \
	  'logs-mongodb   Follow MongoDB logs' \
	  'config         Validate and print the Compose configuration' \
	  'shell          Open a shell in SERVICE=<name> (default: backend)'

up:
	$(COMPOSE) up -d --build

dev:
	$(COMPOSE) up --build

down:
	$(COMPOSE) down

stop:
	$(COMPOSE) stop

start:
	$(COMPOSE) stop $(SERVICE)

restart:
	$(COMPOSE) restart $(SERVICE)

build:
	$(COMPOSE) build

rebuild:
	$(COMPOSE) build --no-cache

ps:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f --tail=100

logs-backend:
	$(COMPOSE) logs -f --tail=100 backend

logs-frontend:
	$(COMPOSE) logs -f --tail=100 frontend

logs-mongodb:
	$(COMPOSE) logs -f --tail=100 mongodb

config:
	$(COMPOSE) config

shell:
	$(COMPOSE) exec $(or $(SERVICE),backend) sh
