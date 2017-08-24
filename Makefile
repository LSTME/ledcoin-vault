build:
	docker build -t ledcoin-vault .

deploy:
	DOCKER_HOST=127.0.0.1:12375 docker-compose -f docker-compose.yml -f docker-compose-production.yml up --force-recreate -d --build

.PHONY: build deploy
