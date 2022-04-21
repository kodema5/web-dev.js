import postgres from 'https://deno.land/x/postgresjs/mod.js'
import config from './config.js'

console.log(`web-dev.js connects to postgres://${config.PGHOST}:${config.PGPORT}/${config.PGDATABASE}`)

const sql = postgres({
    host: config.PGHOST,
    port: config.PGPORT,
    user: config.PGUSER,
    pass: config.PGPASSWORD,
    database: config.PGDATABASE,

    max: config.PGPOOLSIZE,
    idle_timeout: config.PGIDLE_TIMEOUT,
    connect_timeout: config.PGCONNECT_TIMEOUT,

    debug: config.PGDEBUG && ((cconn, query, params, types) => {
        console.debug(
            'debug>',
            query,
            '\ninput:', params)
    }),

})

export default sql

// calls schema.funcs(param::jsonb)
// pass --debug=true to see debug> in console
//
export let callFn = async (fn, ...params) => {
    try {
        // transform to parameters
        //
        let ps = params.map((p) => {
            return sql.typed(p, getType(p))
        })

        // sql to execute
        //
        let s = `select ${fn}(${
            ps.map( (p,i) => `$${i+1}`).join(',')
        }) as a`

        // use unsafe call to pass the ps
        //
        let rs = await sql.unsafe(s, ps)
        let r = (rs[0] || {}).a
        if (config.PGDEBUG) {
            console.debug('output:', r, '\n')
        }
        return r

    } catch(e) {

        let n = e.name
        let errors =
            n === 'ConnectionRefused' ? 'error.database_not_available' :
            n === 'PostgresError' ? e.message : // to capture raise exceptions
            e

        if (config.PGDEBUG) {
            console.error('error:', e, '\n')
        }

        return { errors }
    }
}

export let isObject = (a) => a !== null
    && a instanceof Object
    && a.constructor === Object


// see inferType in https://deno.land/x/postgresjs@v3.0.5/src/types.js
// this by no means complete
// most use case is expected to pass jsonb instead
//
export let getType = (a) =>
    typeof(a) === 'number' ? 1700 :     // numeric
    a instanceof Date ? 1184 :          // date
    a instanceof Uint8Array ? 17 :      // bytea
    (a === true || a === false ) ? 16 : // boolean
    isObject(a) ? 3802 :                // jsonb
    // Array.isArray(a) ? getType(a[0]) :  // array not supported
    25                                  // text


// refs:
// https://deno.land/x/postgresjs

// q: how to check if arg is a string template?
// export let isTag = (a, ...rest) => !!(
//     a
//     && a.length > 0
//     && a.raw
//     && a.raw.length === a.length
//     && Object.isFrozen( a )
//     && rest.length + 1 === a.length)


// q: how to retrieve pg-type oid?
// select a.typname, b.oid, b.typarray from pg_catalog.pg_type a
// left join pg_catalog.pg_type b on b.oid = a.typelem
// where a.typcategory = 'A'
// group by a.typname, b.oid, b.typarray
// order by b.oid;