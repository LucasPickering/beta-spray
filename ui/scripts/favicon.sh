#!/bin/sh

convert \
    -background transparent \
    # This has to go *after* the background arg
    logo.svg \
    -define icon:auto-resize=64,48,32,16 \
    -colors 256 \
    public/favicon.ico
