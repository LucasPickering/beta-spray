# Wheels don't work on alpine which makes builds super slow, so we use debian
# https://discuss.python.org/t/wheels-for-musl-alpine/7084
FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1 DJANGO_SETTINGS_MODULE=beta_spray.settings.settings_dev
WORKDIR /app

# Dependencies first, for layer caching
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
