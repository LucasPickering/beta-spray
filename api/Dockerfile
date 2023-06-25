FROM python:3.10-alpine

ARG BUILD_PRODUCTION

ENV PATH=$PATH:/root/.local/bin/:/app/.venv/bin/ \
    POETRY_VERSION=1.3.2 \
    POETRY_INSTALL_ARGS=${BUILD_PRODUCTION:+"--without dev"} \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=beta_spray.settings.settings_dev
WORKDIR /app

# Dependencies first, for layer caching
RUN apk add --no-cache \
    gcc \
    libffi-dev \
    libpq-dev \
    musl-dev \
    openssl \
    # Needed for pg_dump/pg_restore for backup management
    postgresql14-client

# Install poetry
RUN apk add --no-cache --virtual .build-deps curl && \
    curl -sSL https://install.python-poetry.org | python - && \
    apk del .build-deps

ADD poetry.toml pyproject.toml poetry.lock ./
RUN poetry install ${POETRY_INSTALL_ARGS}

ADD . .

CMD ["./scripts/cmd_dev.sh"]
