// to get all parameters from one place
//
// where:
// - application default values
// - overridden by .env/.env.default
// - overridden by command line arguments
//
import { config } from "https://deno.land/x/dotenv/mod.ts"
import { parse } from "https://deno.land/std@0.134.0/flags/mod.ts";

let flags = {
    p: 'PORT',
}

let values = Object.assign(
    // application default values
    //
    {
        PORT: 8000,             // listens to

        PGHOST: 'localhost',    // pg connections
        PGPORT: 5432,
        PGDATABASE: 'web',
        PGUSER: 'web',
        PGPASSWORD: 'rei',
        PGPOOLSIZE: 10,
        PGIDLE_TIMEOUT: 0,      // in s
        PGCONNECT_TIMEOUT: 30,  // in s

        PGCALLBACK_CHANNEL:     // callback channel
            'web-dev-callback',
    },

    // read from .env / .env.defaults
    //
    config(),

    // command line arguments
    //
    Object.entries(parse(Deno.args))
        .map( ([k,v]) => ({
            [flags[k] || k.toUpperCase().replaceAll('-','_')] : v
        }))
        .reduce((x,a) => Object.assign(x,a), {})
)

export default values