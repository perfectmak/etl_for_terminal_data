TESTCOMPOSEFILE= -f docker-compose.yml -f docker-compose.test.yml

start:
	docker-compose up --build --force-recreate

stop:
	docker-compose down

run-test:
	docker-compose $(TESTCOMPOSEFILE) up --build -d
	docker-compose ps
	docker-compose $(TESTCOMPOSEFILE) exec app npm test