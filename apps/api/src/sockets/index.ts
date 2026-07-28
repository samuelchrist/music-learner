import { Server }     from 'socket.io'
import { Server as Http } from 'http'
import { env }        from '../config/env'
import { logger }     from '../config/logger'

export function initSockets(http: Http) {
  const io = new Server(http, { cors: { origin: env.CLIENT_URL } })
  io.on('connection', socket => {
    logger.info(`Socket: ${socket.id}`)
    socket.on('join-session', (uid: string) => socket.join(`user:${uid}`))
    socket.on('score-submitted', data => io.emit('leaderboard-update', data))
    socket.on('disconnect', () => logger.info(`Disconnected: ${socket.id}`))
  })
  return io
}
