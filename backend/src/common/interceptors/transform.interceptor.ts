import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    
    // Kita men-set default message berdasarkan status code
    let message = 'Success';
    if (response.statusCode === 201) {
      message = 'Data berhasil dibuat';
    } else if (response.statusCode === 200) {
      message = 'Permintaan berhasil';
    }

    return next.handle().pipe(
      map(data => ({
        success: true,
        message: data?.message || message, // bisa di-override dari controller
        data: data?.data ? data.data : data, // handle nested data
      })),
    );
  }
}
