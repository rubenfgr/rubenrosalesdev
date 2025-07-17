# Makefile para gestión de contenedores y utilidades del proyecto

DOCKER_COMPOSE = docker compose -f ./docker/docker-compose.yml

.PHONY: up down restart logs ps prisma-generate prisma-studio start

up:
	$(DOCKER_COMPOSE) up -d

down:
	$(DOCKER_COMPOSE) down

restart:
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) up -d

logs:
	$(DOCKER_COMPOSE) logs -f

ps:
	$(DOCKER_COMPOSE) ps

prisma-generate:
	npx prisma generate

prisma-studio:
	npx prisma studio

start:
	pnpm dev
