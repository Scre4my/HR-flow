#!/bin/bash

cd backend && php -S 0.0.0.0:8000 -t public &
cd frontend && npm run dev
