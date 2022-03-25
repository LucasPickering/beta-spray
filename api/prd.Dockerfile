FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1 DJANGO_SETTINGS_MODULE=beta_spray.settings.settings_prd
WORKDIR /app

RUN apt-get update && \
    apt-get install -y \
    gcc \
    git \
    openssl \
    libpq-dev \
    && \
    rm -rf /var/lib/apt/lists/*
RUN pip install poetry

# Dependencies first, for caching
ADD pyproject.toml poetry.lock ./
RUN poetry install --no-dev

ADD . .

CMD ["./m.sh", "runserver", "0.0.0.0:8000"]
