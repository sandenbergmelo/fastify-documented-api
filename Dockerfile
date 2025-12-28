FROM node:24-alpine AS builder

WORKDIR /app

COPY . ./

RUN npm ci

EXPOSE 3000

CMD ["node", "src/app.ts"]
