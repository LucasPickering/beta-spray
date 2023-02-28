FROM python:3.10-alpine

ENV PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=beta_spray.settings.settings_prd
WORKDIR /app

RUN apk add --no-cache \
    openssl \
    # Needed for pg_dump in backup container
    postgresql14-client
# Install some temporary build dependencies
RUN apk add --no-cache --virtual .build-deps \
    gcc \
    libffi-dev \
    musl-dev && \
    pip install poetry && \
    apk del .build-deps

# Dependencies first, for caching
ADD poetry.toml pyproject.toml poetry.lock ./
# We need to reinstall some of the dependencies from before. Most of the time
# though we won't need to re-run the above commands, so this will be faster for
# re-builds than installing poetry+dependencies together
RUN apk add --no-cache --virtual .build-deps \
    gcc \
    libffi-dev \
    libpq-dev \
    musl-dev && \
    poetry install --no-dev && \
    apk del .build-deps

ADD . .

CMD ["./scripts/cmd_prd.sh"]
