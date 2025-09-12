import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-customer-service',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-service.html',
  styleUrl: './customer-service.css'
})
export class CustomerServiceComponent {
  constructor(private themeService: ThemeService) {}

  protected get isDarkMode() {
    return this.themeService.isDarkMode;
  }
}
