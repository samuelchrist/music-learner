import express    from 'express'
import cors       from 'cors'
import helmet     from 'helmet'
import morgan     from 'morgan'
import { corsOptions }  from './config/cors'
import { apiLimiter }   from './middleware/rateLimit.middleware'
import { errorHandler } from './middleware/errorHandler.middleware'
import routes           from './routes'

const app = express()
app.use(helmet(), cors(corsOptions), apiLimiter)
app.use(express.json({ limit: '10mb' }), express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.get('/health', (_, res) => res.json({ status: 'ok' }))
app.use('/api/v1', routes)
app.use(errorHandler)
export default app
