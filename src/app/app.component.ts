import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavComponent } from './components/nav/nav.component';
import { AuthService } from './auth.service';
import { CommonModule } from '@angular/common'; // Added CommonModule import

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, CommonModule], // Added CommonModule to imports
  template: `
    <app-nav *ngIf="showNav"></app-nav>
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'auth-demo';
  showNav = false;

  constructor(private router: Router, private authService: AuthService) {
    // Show nav only on authenticated routes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      this.showNav = !url.includes('/login') && !url.includes('/register');
      console.log('Navigation visibility:', this.showNav, 'Current URL:', url);
    });
  }
  
  ngOnInit() {
    // Set initial navigation bar visibility based on current route
    const currentUrl = this.router.url;
    this.showNav = !currentUrl.includes('/login') && !currentUrl.includes('/register') && this.authService.isLoggedIn();
    console.log('Initial navigation visibility:', this.showNav, 'Current URL:', currentUrl);
  }
}
