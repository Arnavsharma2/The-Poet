import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle network errors (status 0) - no connection to server
      if (error.status === 0) {
        return throwError(() => new Error('Network error: Unable to connect to the server. Please check your internet connection.'));
      }
      
      // Requirement: Throw error if a 200 response is not received
      // HttpClient automatically treats non-2xx status codes as errors
      // When we catch an error here, status will never be 200 (it's 4xx, 5xx, etc.)
      const statusText = error.statusText || 'Unknown Error';
      const errorMessage = error.error?.message || error.message || 'Request failed';
      return throwError(() => new Error(
        `HTTP Error ${error.status}: ${statusText}. ${errorMessage}`
      ));
    })
  );
};

