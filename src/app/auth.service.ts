import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  login(username: string, password: string): boolean {
    const storedCredentials = localStorage.getItem(username);
    if (storedCredentials) {
      const storedPassword = JSON.parse(storedCredentials).password;
      if (storedPassword === password) {
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
}
