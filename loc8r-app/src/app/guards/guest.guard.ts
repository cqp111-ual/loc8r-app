import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanMatch,
  Route,
  UrlSegment,
  Router,
  UrlTree
} from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate, CanMatch {
  constructor(private authService: AuthService, private router: Router) {}

  private checkAccess(): Observable<boolean | UrlTree> {
    return this.authService.userObservable$.pipe(
      
      take(1),

      map(user => {
        console.log('[AuthService] Usuario inicial detectado:', user);

        if (user) {
          return this.router.createUrlTree(['/profile']);
        }
        return true;
      })
    );
  }

  canActivate(): Observable<boolean | UrlTree> {
    return this.checkAccess();
  }

  canMatch(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean | UrlTree> {
    return this.checkAccess();
  }
}
