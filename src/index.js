// a simple json web-service
//
import { Application, Router, Status } from "https://deno.land/x/oak/mod.ts"
import payload from "./payload.js"
import config from "./config.js"
import { callFn } from "./postgresql.js"
import './callbacks/index.js'

export default '0.0.1'


;(async () => {

    let router = new Router()
    .all('/api/:schema/:funcs+', async (ctx) => {
        let { schema, funcs } = ctx.params
        let p = await payload.get(ctx)

        // fn has specific is prefixed with web_*
        //
        let fn = `${schema}.web_${
            (funcs || 'index').split('/').join('_')
        }`
        let x = await callFn(fn, p)

        await payload.set(ctx, x)
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

    console.log(`web-dev.js serving ${Deno.cwd()} at ${config.PORT}\npress ^C to exit\n`)
    await app.listen(`127.0.0.1:${config.PORT}`)
})()

