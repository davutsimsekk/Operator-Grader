import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserKey = 'currentUser';

  constructor(private router: Router) { }

  login(username: string, password: string): boolean {
    const storedCredentials = localStorage.getItem(username);
    if (storedCredentials) {
      const storedPassword = JSON.parse(storedCredentials).password;
      if (storedPassword === password) {
        localStorage.setItem(this.currentUserKey, username);
        return true;
      }
    }
    return false;
  }

  register(username: string, password: string): boolean {
    if (localStorage.getItem(username)) {
      return false; // Username already exists
    }
    localStorage.setItem(username, JSON.stringify({ password }));
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.currentUserKey);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.currentUserKey) !== null;
  }
  
  getCurrentUsername(): string {
    return localStorage.getItem(this.currentUserKey) || 'Kullanıcı';
  }
}
