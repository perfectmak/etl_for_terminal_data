TESTCOMPOSEFILE= -f docker-compose.yml -f docker-compose.test.yml

start:
	docker-compose up --build --force-recreate

stop:
	docker-compose down

start-test:
	docker-compose $(TESTCOMPOSEFILE) up --build -d
	docker-compose ${TESTCOMPOSEFILE} ps

run-test:
	docker-compose $(TESTCOMPOSEFILE) exec app npm test