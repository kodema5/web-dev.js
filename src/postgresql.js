import postgres from 'https://deno.land/x/postgresjs/mod.js'
import config from './config.js'

const sql = postgres({
    host: config.PGHOST,
    port: config.PGPORT,
    user: config.PGUSER,
    pass: config.PGPASSWORD,
    database: config.PGDATABASE,

    max: config.PGPOOLSIZE,
    idle_timeout: config.PGIDLE_TIMEOUT,
    connect_timeout: config.PGCONNECT_TIMEOUT,
})

export default sql

// calls schema.funcs(param::jsonb)
//
export let webFn = async (schema, funcs, param, {
    payload=true,   // interogate for 'data' | 'errors'
                    // otherwise wraps as {data}
                    // see payload.js
} = {}) => {
    try {
        let fn = `${schema}.${funcs.join('_')}`
        let rs = await sql`select ${sql(fn)}(${sql.json(param)}) as a`

        let val = rs[0].a
        if (!payload) return val

        // checks if it is a payload-type
        //
        if ('data' in val || 'errors' in val) return val

        return { data:val }

    } catch(e) {
        let n = e.name
        let errors =
            n === 'ConnectionRefused' ? 'error.database_not_available' :
            n === 'PostgresError' ? e.message : // to capture raise exceptions
            e
        return { errors }
    }
}


// refs:
// https://deno.land/x/postgresjs
