#!/bin/bash

npx prisma dev &
cd backend && npm i && npx tsx watch src/index.ts &
cd frontend && npm i && npx expo start