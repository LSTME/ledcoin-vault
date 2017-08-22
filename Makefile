build:
	docker build -t ledcoin-vault .

deploy:
	DOCKER_HOST=127.0.0.1:12375 docker-compose up --force-recreate -d

.PHONY: build deploy
