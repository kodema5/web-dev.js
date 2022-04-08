// a simple json web-service
//
import * as path from "https://deno.land/std@0.134.0/path/mod.ts"
import { Application, Router, Status } from "https://deno.land/x/oak/mod.ts"
import payload from "./payload.js"
import config from "./config.js"
import { webFn } from "./postgresql.js"

export default { version: '0.0.1' }

;(async () => {

    let router = new Router()
    .all('/api/:schema/:funcs+', async (ctx) => {
        let { schema, funcs } = ctx.params
        let p = await payload.get(ctx)

        await payload.set(
            ctx,
            await webFn(p)
        )
    })

    let app = new Application()
    app.use(router.routes())
    app.use(router.allowedMethods())
    app.use(async (ctx, next) => {
        let root = `${Deno.cwd()}`
        try {
            await ctx.send({ root, index:'index.html' })
        } catch {
            next()
        }
    })
    app.use( async ctx => {
        ctx.response.status = Status.NotFound
        ctx.response.body = `"${ctx.request.url}" not found`
    })

    console.log(`web-dev.js serving ${Deno.cwd()} at ${config.PORT}`)
    await app.listen(`127.0.0.1:${config.PORT}`)
})()


