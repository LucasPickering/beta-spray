#!/bin/sh

convert \
    -background transparent \
    $1 \
    -define icon:auto-resize=64,48,32,16 \
    -colors 256 \
    public/favicon.ico
