// fetch from url
//
export default async ([url, option]) => {
    let res = await fetch(url, option)

    let ct = res.headers.get('content-type')
    return ct && ct.indexOf('application/json')>=0
        ? await res.json()
        : await res.text()
}

// example:
//
// import sql from '../postgresql.js'
// import config from '../config.js'
//
// setTimeout(function() {
//     sql.notify(config.PGCALLBACK_CHANNEL,
//         JSON.stringify({
//             type: 'fetch',
//             data: [
//                 'http://localhost:8000/api/example/foo/bar?x=1',
//                 {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({ a:123 }),
//                 }
//             ],
//             next: {
//                 type: 'echo'
//             }
//         }))
// }, 10)

