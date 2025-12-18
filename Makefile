DOCKER_COMPOSE := docker compose

.PHONY: up upd build down logs exec restart clean

up:
	$(DOCKER_COMPOSE) up --build

upd:
	$(DOCKER_COMPOSE) up --build -d

build:
	$(DOCKER_COMPOSE) build --no-cache

down:
	$(DOCKER_COMPOSE) down

logs:
	$(DOCKER_COMPOSE) logs -f

exec:
	@echo "Opening shell in 'app' container..."
	$(DOCKER_COMPOSE) exec app sh

restart:
	$(DOCKER_COMPOSE) restart

clean:
	$(DOCKER_COMPOSE) down -v --remove-orphans
	echo "Cleaned up containers and volumes"
