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
})

export default sql

// calls schema.funcs(param::jsonb)
//
export let webFn = async (schema, funcs, param) => {
    try {
        // web-function's prefixed with web_*
        //
        let fn = `${schema}.web_${funcs.join('_')}`

        let rs = await sql`select ${sql(fn)}(${sql.json(param)}) as a`
        return (rs[0] || {}).a

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
