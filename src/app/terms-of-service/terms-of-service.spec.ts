import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsOfServiceComponent } from './terms-of-service';

describe('TermsOfServiceComponent', () => {
  let component: TermsOfServiceComponent;
  let fixture: ComponentFixture<TermsOfServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsOfServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsOfServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Terms of Service');
  });

  it('should have last updated date', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.last-updated')).toBeTruthy();
  });

  it('should have terms sections', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const termsSections = compiled.querySelectorAll('.terms-section');
    expect(termsSections.length).toBeGreaterThan(0);
  });

  it('should include agreement to terms section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headings = Array.from(compiled.querySelectorAll('h2')).map(h => h.textContent);
    expect(headings).toContain('Agreement to Terms');
  });

  it('should include use license section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headings = Array.from(compiled.querySelectorAll('h2')).map(h => h.textContent);
    expect(headings).toContain('Use License');
  });

  it('should include limitation of liability section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headings = Array.from(compiled.querySelectorAll('h2')).map(h => h.textContent);
    expect(headings).toContain('Limitation of Liability');
  });
});
