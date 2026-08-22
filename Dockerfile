FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/db ./db
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /app/contracts ./contracts
COPY --from=build /app/tsconfig.server.json ./tsconfig.server.json
# 秘钥与环境变量不在镜像里烘焙，运行时通过 --env-file 或平台 secrets 注入。
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
