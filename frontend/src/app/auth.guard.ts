import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (typeof window === 'undefined') return false;

    const username = sessionStorage.getItem('username');
    const role = sessionStorage.getItem('role');

    if (!username) {
      this.router.navigate(['/login']);
      return false;
    }

    // Vérifie un rôle si précisé dans la route
    const expectedRole = route.data['role'];
    if (expectedRole && role !== expectedRole) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
