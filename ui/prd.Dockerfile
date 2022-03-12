# This needs to be built from the **repo root**, so it can access the schema file

# If you update this, make sure you update the .nvmrc too
FROM node:16-alpine AS builder

WORKDIR /app/ui

ADD ./ui/package.json ./ui/package-lock.json ./
RUN npm install

ADD ./ui/ ./
# Do this *second*, to overwrite the broken link file
ADD ./api/src/schema.graphql ./
RUN npm run build

FROM alpine:latest
COPY --from=builder /app/ui/build /app/static
