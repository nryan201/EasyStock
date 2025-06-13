// src/app/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('token');
  console.log('🛡️ [AuthInterceptor] intercept pour :', req.url);
  console.log('🛡️ token trouvé :', token);

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('🚀 requête clonée avec Authorization :', cloned);
    return next(cloned);
  }

  return next(req);
};
