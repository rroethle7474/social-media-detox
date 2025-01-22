import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { UserService } from '../services/user.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.userService.currentUser$.pipe(
      map(user => {
        if (user?.isAdmin) {
          return true;
        }

        this.toastr.error('Access denied. Admin privileges required.', 'Unauthorized');
        return this.router.createUrlTree(['/']);
      })
    );
  }
}
