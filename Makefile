PWD:=$(shell pwd)

kb-%: export KUBECONFIG=$(PWD)/kubeconfig.yml

install: install-deps install-env

run:
	./bin/client.js

install-env:
	cp env.template .env

install-deps:
	npm ci

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint --fix .

publish:
	npm publish

docker-build:
	docker pull codebattle/discord-bot:latest || true
	docker build --cache-from=codebattle/discord-bot:latest --tag codebattle/discord-bot:latest .

docker-push:
	docker push codebattle/discord-bot:latest

kb-deploy:
	kubectl apply -f deployment.yaml

kb-k9s:
	k9s
.PHONY: test run
