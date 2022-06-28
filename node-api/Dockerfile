# If you update this, make sure you update the .nvmrc too
# Can't use alpine until prisma supports arm64+musl
# https://github.com/prisma/prisma/issues/8478
# FROM node:16-alpine
# RUN apk add --no-cache openssl
FROM node:16-slim
RUN apt-get update && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app

# npm install is done during container startup
