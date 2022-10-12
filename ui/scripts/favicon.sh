#!/bin/sh


convert -density 256x256 -background transparent logo.svg -define icon:auto-resize -colors 256 public/favicon.ico
