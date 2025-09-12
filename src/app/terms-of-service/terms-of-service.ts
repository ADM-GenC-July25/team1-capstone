import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms-of-service.html',
  styleUrl: './terms-of-service.css'
})
export class TermsOfServiceComponent {
  constructor(private themeService: ThemeService) {}

  protected get isDarkMode() {
    return this.themeService.isDarkMode;
  }
}
