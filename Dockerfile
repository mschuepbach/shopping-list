FROM node:20-alpine as build

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml* ./
COPY package.json ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build && \
    pnpm prune --prod


FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/drizzle ./drizzle

CMD ["node", "build"]
