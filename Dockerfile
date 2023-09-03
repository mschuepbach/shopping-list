FROM node:20-alpine as build

WORKDIR /app

RUN npm install -g pnpm

ENV DB_URL=""

COPY pnpm-lock.yaml* ./
COPY package.json ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build


FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/build ./build

EXPOSE 3000

CMD ["node", "build"]
