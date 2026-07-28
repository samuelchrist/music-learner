import { Request, Response, NextFunction } from 'express'
import { logger }       from '../config/logger'
import { sendError }    from '../utils/apiResponse'

export function errorHandler(err: Error, req: Request, res: Response, _: NextFunction) {
  logger.error(err.message)
  return sendError(res, err.message || 'Internal server error', 500)
}
