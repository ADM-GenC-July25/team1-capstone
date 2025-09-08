import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerServiceComponent } from './customer-service';

describe('CustomerServiceComponent', () => {
  let component: CustomerServiceComponent;
  let fixture: ComponentFixture<CustomerServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Customer Service');
  });

  it('should have contact information section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.contact-section')).toBeTruthy();
  });

  it('should display contact cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const contactCards = compiled.querySelectorAll('.contact-card');
    expect(contactCards.length).toBe(3);
  });

  it('should have FAQ section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.faq-section')).toBeTruthy();
  });

  it('should display FAQ items', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const faqItems = compiled.querySelectorAll('.faq-item');
    expect(faqItems.length).toBeGreaterThan(0);
  });
});
