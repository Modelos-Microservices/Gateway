import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const rpcError = exception.getError();

    if (rpcError.toString().includes('Empty response')) {
      return response.status(500).json({
        status: 500,
        message: rpcError.toString().substring(0, rpcError.toString().indexOf('(') - 1),
      });
    }


    if (
      typeof rpcError === 'object' &&
      rpcError !== null &&
      'status' in rpcError &&
      typeof rpcError.status === 'number' &&
      'message' in rpcError
    ) {
      return response.status(rpcError.status).json(rpcError);
    }

    // Respuesta por defecto si no se cumple la condición
    return response.status(401).json({
      status: 401,
      message: 'Bad Request',
    });
  }
}