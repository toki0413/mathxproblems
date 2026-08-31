#!/bin/sh
# 生产入口：启动前先应用 DB 迁移（幂等，已在 Neon 建过表时跳过新增），
# 再拉起 Hono 服务。迁移在 docker runtime 下比平台 preDeploy 更可控。
set -e
npm run db:migrate || true
exec npm start