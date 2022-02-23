install: install-deps install-env

run:
	bin/client.js

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

.PHONY: test
