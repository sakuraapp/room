const { spawn } = require('child_process')
const { env } = process

const processes = []
const cleanExit = () => {
    for (const proc of processes) {
        proc.kill()
    }

    process.exit()
}

const create = (opts) => {
    const params = [
        '-f', 'x11grab',
        '-s', opts.resolution,
        '-r', opts.fps,
        '-i', env.DISPLAY || ':0',
        /* '-f', 'alsa',
        '-i', 'pulse',
        '-ac', 2,
        '-ar', opts.audioBitrate, */
        '-vcodec', opts.videoCodec,
        //'-acodec', opts.audioCodec,
        '-g', opts.fps * 2,
        '-keyint_min', opts.fps,
        '-b:v', opts.bitrate,
        '-minrate', opts.bitrate,
        '-maxrate', opts.bitrate,
        '-pix_fmt', 'yuv420p',
        '-s', opts.resolution,
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        //'-acodec', 'libmp3lame',
        '-f', opts.format,
        //'-threads', 1,
        //'-rtbufsize', opts.bufferSize,
    ]

    //params.push('pipe:1')
    params.push(`${env.STREAMING_URL}?t=${env.STREAMING_TOKEN}`)

    const proc = spawn('ffmpeg', params)
    const { stdout, stderr } = proc

    processes.push(proc)

    /* stdout.on('data', (data) => {
        //console.log(data.toString())
    }) */

    stderr.on('data', (data) => {
        console.log(data.toString())
    })

    proc.on('error', (err) => {
        console.log('error', err)
    })

    proc.on('exit', (code) => {
        console.log('exit code', code)
    })

    process.on('exit', () => cleanExit)
    process.on('SIGINT', cleanExit)
    process.on('SIGTERM', cleanExit)
}

module.exports = () => {
    const streams = JSON.parse(process.env.STREAMS)

    for (const stream of streams) {
        create(stream)
    }
}