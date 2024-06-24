import HttpError from '../models/httpErrorModel.js';
import pkg from '@grpc/grpc-js';

const { Status } = pkg;

export const notFound = (req, res, next) => {
  next(new HttpError(`Not Found - ${req.originalUrl}`, 404));
};

export const errorHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    res.status(err.code).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  } else {
    if (err.code === Status.NOT_FOUND) {
      err = new HttpError('Resource not found', 404);
    } else if (err.code === Status.INVALID_ARGUMENT) {
      err = new HttpError('Invalid request', 400);
    } else if (!err.statusCode) {
      err = new HttpError(err.message || 'Internal Server Error', 500);
    }

    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  }
};

