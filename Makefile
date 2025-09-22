# Docker PostgreSQL Database Commands

# Database configuration
DB_NAME = proton
DB_USER = postgres
DB_PASSWORD = password
DB_PORT = 5452
CONTAINER_NAME = proton-postgres

# Create and start PostgreSQL database in Docker
db-create:
	docker run -d \
		--name $(CONTAINER_NAME) \
		-e POSTGRES_DB=$(DB_NAME) \
		-e POSTGRES_USER=$(DB_USER) \
		-e POSTGRES_PASSWORD=$(DB_PASSWORD) \
		-p $(DB_PORT):5432 \
		postgres:15-alpine

# Start existing database container
db-start:
	docker start $(CONTAINER_NAME)

# Stop database container
db-stop:
	docker stop $(CONTAINER_NAME)

# Remove database container (data will be lost)
db-remove:
	docker rm -f $(CONTAINER_NAME)

# View database logs
db-logs:
	docker logs -f $(CONTAINER_NAME)

# Connect to database using psql
db-connect:
	docker exec -it $(CONTAINER_NAME) psql -U $(DB_USER) -d $(DB_NAME)

# Show database status
db-status:
	docker ps -a --filter name=$(CONTAINER_NAME)

# Generate Prisma client
generate:
	npx prisma generate

# Run Prisma migrations in development
migrate:
	npx prisma migrate dev

# Reset database and apply all migrations
migrate-reset:
	npx prisma migrate reset

# Check migration status
status:
	npx prisma migrate status

# Open Prisma Studio
studio:
	npx prisma studio

# Build from Dockerfile
build:
	docker build -t proton .

.PHONY: db-create db-start db-stop db-remove db-logs db-connect db-status generate migrate migrate-reset status studio build