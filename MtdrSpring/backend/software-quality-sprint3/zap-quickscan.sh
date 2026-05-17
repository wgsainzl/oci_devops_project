#!/usr/bin/env bash

TARGET_URL="${1:-http://host.docker.internal:8080}"

echo "Running OWASP ZAP quick scan against: $TARGET_URL"

docker run --rm \
  -v "$(pwd):/zap/wrk/:rw" \
  -t ghcr.io/zaproxy/zaproxy:stable \
  zap.sh -cmd \
  -quickurl "$TARGET_URL" \
  -quickout /zap/wrk/results.xml

echo "ZAP scan finished."
echo "Generated file: results.xml"
