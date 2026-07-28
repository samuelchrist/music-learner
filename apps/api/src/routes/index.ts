import { Router } from 'express'
import auth        from './auth.routes'
import users       from './user.routes'
import lessons     from './lesson.routes'
import progress    from './progress.routes'
import scores      from './score.routes'
import leaderboard from './leaderboard.routes'
const r = Router()
r.use('/auth',        auth)
r.use('/users',       users)
r.use('/lessons',     lessons)
r.use('/progress',    progress)
r.use('/scores',      scores)
r.use('/leaderboard', leaderboard)
export default r
