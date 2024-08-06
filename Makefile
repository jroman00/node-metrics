.DEFAULT_GOAL := help

.PHONY: help
help: ## Show the help docs (DEFAULT)
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage: make COMMAND\n\nCommands: \033[36m\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

.PHONY: init
init: ## Initialize the local env, install dependencies, and build all containers
	bash ./bin/local-init.sh

.PHONY: log
log: ## Tail container logs
	docker compose logs -f node-metrics

.PHONY: shell
shell: ## Start a shell session in a new container
	docker compose run --rm node-metrics bash

.PHONY: start
start: ## Start containers and run the application
	bash ./bin/local-start.sh

.PHONY: stop
stop: ## Stop containers and the application
	bash ./bin/local-stop.sh

.PHONY: lint
lint: ## Run the lint suite
	docker compose run --rm node-metrics npm run lint

.PHONY: lint-fix
lint-fix: ## Run the lint suite fixer
	docker compose run --rm node-metrics npm run lint:fix

.PHONY: test
test: ## Run the test suite
	docker compose run --rm node-metrics npm run test
