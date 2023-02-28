FROM python:3.10-alpine

ENV PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=beta_spray.settings.settings_dev
WORKDIR /app

# Dependencies first, for layer caching
RUN apk add --no-cache \
    gcc \
    libffi-dev \
    libpq-dev \
    musl-dev \
    openssl
RUN pip install poetry

ADD poetry.toml pyproject.toml poetry.lock ./
RUN poetry install

CMD ["./scripts/cmd_dev.sh"]
