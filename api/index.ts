// Vercel 无服务器入口：Hono app 的 fetch handler 即可直接被调用。
// Vercel Node 运行时以 (request, context) 调用导出的 default handler。
import { app } from "./boot";

export default app.fetch;