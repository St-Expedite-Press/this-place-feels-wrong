SHELL := /usr/bin/env bash

TARGET ?= .

.PHONY: scaffold dev build preview check-all check-links check-a11y check-lighthouse sitemap feed optimize

scaffold:
	@test -n "$(NAME)" || (echo "Usage: make scaffold NAME=my-site" && exit 1)
	sh scripts/scaffold-static.sh "$(NAME)"

dev:
	sh scripts/dev.sh "$(TARGET)"

build:
	sh scripts/build.sh "$(TARGET)"

preview:
	sh scripts/preview.sh "$(TARGET)"

check-links:
	sh scripts/check-links.sh "$(TARGET)"

check-a11y:
	sh scripts/check-a11y.sh "$(TARGET)"

check-lighthouse:
	sh scripts/check-lighthouse.sh "$(TARGET)"

check-all:
	sh scripts/check-all.sh "$(TARGET)"

sitemap:
	sh scripts/generate-sitemap.sh "$(TARGET)"

feed:
	sh scripts/generate-feed.sh "$(TARGET)"

optimize:
	sh scripts/optimize-images.sh "$(TARGET)"
