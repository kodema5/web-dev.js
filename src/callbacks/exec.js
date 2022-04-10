// calls pg function
//
import { callFn } from '../postgresql.js'

export default async ([fn, ...args]) => {
    return await callFn.call(null, fn, ...args)
}

// example:
//
// import sql from '../postgresql.js'
// import config from '../config.js'

// setTimeout(function() {
//     sql.notify(config.PGCALLBACK_CHANNEL,
//         JSON.stringify({
//             type: 'exec',
//             data: [
//                 'jsonb_build_object',
//                 'a', { a:1, b:new Date(), d:'hello-world' },
//                 'b', new Date(),
//                 'c', 123,
//                 'd', 'hello-world',
//                 'e', true,
//                 // 'f', [1,2,3], -- not supported
//             ],
//             next: {
//                 type: 'echo',
//             }
//         }))
// }, 10)

