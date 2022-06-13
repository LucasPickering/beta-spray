# If you update this, update rust-toolchain.toml too
FROM rust:1.61-slim

WORKDIR /app
RUN apt-get update && \
    apt-get install -y \
    libssl-dev \
    pkg-config \
    && \
    rm -rf /var/lib/apt/lists/*
COPY rust-toolchain.toml .
RUN cargo install cargo-watch
