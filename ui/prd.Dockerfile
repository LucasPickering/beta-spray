# This needs to be built from the **repo root**, so it can access the schema file
# and django static files

# If you update this, make sure you update the .nvmrc too
FROM node:16-alpine AS js-builder

WORKDIR /app/ui

ADD ./ui/package.json ./ui/package-lock.json ./
RUN npm install

ADD ./ui/ ./
# Do this *second*, to overwrite the broken link file
ADD ./api/src/schema.graphql ./
RUN npm run build

# Build Django static assets (for admin UI)
FROM ghcr.io/lucaspickering/beta-spray-api:latest AS python-builder
RUN poetry run ./src/manage.py collectstatic --no-input

FROM alpine:latest
WORKDIR /app/static
COPY --from=js-builder /app/ui/build ./
COPY --from=python-builder /app/src/static ./django/
