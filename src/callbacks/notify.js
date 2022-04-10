import sql from '../postgresql.js'


// sends notification to specified channel
//
export default async ([channel, payload]) => {
    let p = typeof payload === 'string'
        ? payload
        : JSON.stringify(payload)

    sql.notify(channel, p)
}

// example:
//
// import config from '../config.js'
// setTimeout(function() {
//     sql.notify(config.PGCALLBACK_CHANNEL,
//         JSON.stringify({
//             type: 'notify',
//             data: [
//                 config.PGCALLBACK_CHANNEL,
//                 {
//                     type:'echo',
//                     data: 'hello-notify'
//                 },
//             ],
//         }))
// }, 10)

