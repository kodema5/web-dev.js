// set/get payload from oak's context
// payload is { data, errors, _flags+ }

// get from request
//
export let get = async (ctx) => {
    let req = ctx.request

    let cookies = {}
    for await (let [key, value] of ctx.cookies.entries()) {
        cookies[key] = value
    }

    var type, data, errors
    if (req.hasBody) {
        let body = req.body()

        type = body.type
        if (type==='form') // application/x-www-form-urlencoded
        {
            data = Object.fromEntries((await body.value).entries())
        }
        else if (type==='form-data') // multipart/form-data
        {
            let { fields } = await body.value.read()
            data = fields
        }
        else if (type==='text') // plain/text
        {
            data = JSON.stringify(await body.value)
        }
        else if (type==='json') // application/json
        {
            let args
            ({errors, data, ...args} = (await body.value))
            data = data || args
        }
    }

    return {
        _method: req.method,
        _origin: req.ip,
        _url: req.url.toString(),
        _cookies: cookies,
        _headers: Object.fromEntries(req.headers),
        _query: Object.fromEntries(new URLSearchParams(req.url.search)),
        _type: type,

        data,
        errors,
    }
}

export let isObject = (a) => a !== null
    && a instanceof Object
    && a.constructor === Object

export let isEmpty = (a) => (a==null)
    || (a==='')
    || (Array.isArray(a) && a.length===0)
    || (Object.isObject(a) && Object.entries(a).length===0)


// sets response based on response from database
//
export let set = async (ctx, obj) => {
    let res = ctx.response

    // return directly if not an object
    //
    if (!isObject(obj)) {
        res.body = obj
        return
    }

    // collect flags prefixed by '_'
    //
    let { payload, flags } = Object.entries(obj)
    .reduce( (x, [key, val]) => {
        let is_ = key[0] === '_'
        let n = is_ ? key.slice(1) : key
        Object.assign(
            x[is_ ? 'flags' : 'payload'],
            {[n]: val}
        )

        return x
    }, {
        payload: {},
        flags: {}
    })


    // build payload { data, errors } response
    //
    let { data, errors } = ('data' in payload || 'errors' in payload)
        ? payload
        : ({ data: payload })

    res.body = Object.assign({}, errors && { errors }, data && {data})


    // process flags
    //
    if (flags.status) {
        res.status = flags.status
    }

    if (flags.headers) {
        for (let [k,v] of Object.entries(flags.headers)) {
            res.headers.set(k, v)
        }
    }

    if (flags.cookies) {
        for (let [k,v] of Object.entries(flags.cookies)) {
            await ctx.cookies.set(k, v)
        }
    }
}

export default { set, get }


// ref: https://deno.land/x/oak@v10.5.1/examples/echoServer.ts