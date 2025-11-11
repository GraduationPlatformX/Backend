import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => this.transformResponse(data)),
      catchError((error) => throwError(() => this.transformError(error))),
    );
  }

  private transformResponse(data: any): ApiResponse<T> {
    if (data?.message) {
      const { message, ...rest } = data;
      const hasData = Object.keys(rest).length > 0;
      
      return {
        success: true,
        message,
        data: hasData ? rest : null,
      };
    }

    return {
      success: true,
      message: 'completed successfully',
      data: data || null,
    };
  }

  private transformError(error: any): HttpException {
    if (error instanceof HttpException) {
      const errorResponse = error.getResponse();
      
      const response = {
        success: false,
        message: typeof errorResponse === 'string' 
          ? errorResponse 
          : errorResponse?.['message'] || 'An error occurred',
        data: null,
      };

      return new HttpException(response, error.getStatus());
    }

    const response = {
      success: false,
      message: error?.message || 'Internal server error',
      data: null,
    };

    return new HttpException(response, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}