import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Footer } from './footer';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the company title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('ByteBazaar');
  });

  it('should have footer navigation links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('.footer-section-links a');
    expect(links.length).toBe(4);
  });

  it('should contain About Us link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('.footer-section-links a')).map(link => link.textContent);
    expect(links).toContain('About Us');
  });

  it('should contain Customer Service link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('.footer-section-links a')).map(link => link.textContent);
    expect(links).toContain('Customer Service');
  });

  it('should contain Privacy Policy link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('.footer-section-links a')).map(link => link.textContent);
    expect(links).toContain('Privacy Policy');
  });

  it('should contain Terms of Service link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('.footer-section-links a')).map(link => link.textContent);
    expect(links).toContain('Terms of Service');
  });
});
