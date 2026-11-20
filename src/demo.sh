#!/bin/bash
# Startet die Demo: Mock-Backend (Fake-Daten) + Frontend
cd "$(dirname "$0")"
node mock/mock-server.js &
MOCK=$!
trap "kill $MOCK" EXIT
cd frontend && npx vite --open
