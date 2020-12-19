const { exec } = require('child_process')
const { Client } = require('@sakuraapp/service-client')

function xdotool(...args) {
    return new Promise((resolve, reject) => {
        args.unshift('xdotool')

        exec(args.join(' '), (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}

async function handle(packet) {
    if (!packet.type) {
        return
    }

    if (packet.type.startsWith('mouse')) {
        packet.data.x = Math.round(packet.data.x)
        packet.data.y = Math.round(packet.data.y)
    }

    switch (packet.type) {
        case 'mousemove':
            await xdotool(packet.type, packet.data.x, packet.data.y)
        break
        case 'mousedown':
        case 'mouseup':
            await xdotool('mousemove', packet.data.x, packet.data.y, packet.type, packet.data.type)
        break
        case 'keydown':
        case 'keyup':
            await xdotool(packet.type, packet.data.key)
    }
}

module.exports = async () => {
    const host = process.env.MASTER_SERVER_HOST || '127.0.0.1'
    const port = process.env.MASTER_SERVER_PORT || 9998
    const name = process.env.CONTROLLER_SERVICE

    const client = new Client({
        host,
        port,
        name,
    })

    client.handle = (packet) => {
        let handler
        let index = -1
    
        if (packet.data.t === 'callback') {
            handler = client.findHandler(String(packet.data.i), 'callback')
            index = client.handlers.indexOf(handler)
        } else {
            handler = client.findHandler(packet.data.n, packet.data.t)
        }

        if (!handler) {
            return client.emit('error', new Error('Invalid packet'))
        }

        handler.handler(packet)

        if (index > -1) {
            client.handlers.splice(index, 1)
        }
    }

    client.registerMethod('dispatch', async (packet) => {
        try {
            await handle(packet.data.d)
        } catch(err) {
            console.error(err)
            packet.respond({ status: 500 })
        }
    })

    await client.connect()
}
