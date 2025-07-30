import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Initialize auth status on app start
    this.authService.checkAuthStatus();
  }
}
