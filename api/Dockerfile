FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1
WORKDIR /app


# Dependencies first, for layer caching
# Wheels don't work on alpine which makes builds super slow
# https://discuss.python.org/t/wheels-for-musl-alpine/7084
# RUN apk add --no-cache \
#     gcc \
#     libffi-dev \
#     linux-headers \
#     musl-dev \
#     openssl \
#     postgresql-dev \
#     rust \
#     zlib-dev
RUN apt-get update && \
    apt-get install -y \
    gcc \
    git \
    openssl \
    libpq-dev \
    && \
    rm -rf /var/lib/apt/lists/*
RUN pip install poetry

ADD pyproject.toml poetry.lock ./
RUN poetry install
