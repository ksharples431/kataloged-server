import HttpError from '../models/httpErrorModel.js';
import pkg from '@grpc/grpc-js';

const { Status } = pkg;

export const notFound = (req, res, next) => {
  next(new HttpError(`Not Found - ${req.originalUrl}`, 404));
};

const mapGrpcErrorToHttpError = (err) => {
  const errorMap = {
    [Status.NOT_FOUND]: new HttpError('Resource not found', 404),
    [Status.INVALID_ARGUMENT]: new HttpError('Invalid request', 400),
    [Status.UNAUTHENTICATED]: new HttpError('Unauthenticated', 401),
    [Status.PERMISSION_DENIED]: new HttpError('Permission denied', 403),
    [Status.ALREADY_EXISTS]: new HttpError('Resource already exists', 409),
  };

  return (
    errorMap[err.code] ||
    new HttpError(err.message || 'Internal Server Error', 500)
  );
};

export const errorHandler = (err, req, res, next) => {
  console.error(err); 

  let error =
    err instanceof HttpError ? err : mapGrpcErrorToHttpError(err);

  res.status(error.code).json({
    success: false,
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    requestId: req.id, 
  });
};
