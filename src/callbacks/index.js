// a callback service that listens to a pg-channel
//
import sql from '../postgresql.js'
import config from '../config.js'

// various handlers
//
import echo from './echo.js'
import fetch from './fetch.js'
import notify from './notify.js'

let handlers = {
    echo,
    fetch,
    notify,
}
export default handlers


// listens to specified channel
//
;(async () => {
    if (!config.PGCALLBACK_CHANNEL) return

    console.log(`web-dev.js listens to "${config.PGCALLBACK_CHANNEL}"`)

    sql.listen(
        config.PGCALLBACK_CHANNEL,
        async function fn (p) {
            let {
                type,       // type of job
                data,       // data to be passed
                next,       // for passing result
            } = (
                typeof p === 'string'
                ? JSON.parse(p)
                : p
            )

            // call handler
            //
            let h = handlers[type]
            if (!h) {
                console.log('unknown handler for ', type)
                return
            }

            let x = await h(data)
            // call for next
            //
            if (!next) return
            await fn({
                ...next,
                data: x
            })
        }
    )
})()

