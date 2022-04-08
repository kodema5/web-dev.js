// set/get payload from oak's context
//
// ref: https://deno.land/x/oak@v10.5.1/examples/echoServer.ts

// get from request
//
export let get = async (ctx) => {
    let req = ctx.request

    let cookies = {}
    for await (let [key, value] of ctx.cookies.entries()) {
        cookies[key] = value
    }

    let data
    if (req.hasBody) {
        let body = req.body()
        let t = body.type
        if (t==='form') // application/x-www-form-urlencoded
        {
            data = Object.fromEntries((await body.value).entries())
        }
        else if (t==='form-data') // multipart/form-data
        {
            let { fields } = await body.value.read()
            data = fields

        }
        else if (t==='text') // plain/text
        {
            data = await body.value
        }
        else if (t==='json') // application/json
        {
            data = await body.value
        }
    }

    return {
        method: req.method,
        origin: req.ip,
        url: req.url,
        cookies,
        data,
        headers: Object.fromEntries(req.headers),
        query: Object.fromEntries(new URLSearchParams(req.url.search)),
    }
}


// sets respone
//
export let set = async (ctx, { status, data, errors, cookies, headers } ) => {
    let res = ctx.response

    status = status || (errors && 500)

    if (status) {
        res.status = status
    }

    if (errors || data) {
        res.body = errors || data
    }

    if (headers) {
        for (let [k,v] of Object.entries(headers)) {
            res.headers.set(k, v)
        }
    }

    if (cookies) {
        for (let [k,v] of Object.entries(cookies)) {
            await ctx.cookies.set(k, v)
        }
    }
}

export default { set, get }