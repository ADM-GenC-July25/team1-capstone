import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyPolicyComponent } from './privacy-policy';

describe('PrivacyPolicyComponent', () => {
  let component: PrivacyPolicyComponent;
  let fixture: ComponentFixture<PrivacyPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyPolicyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivacyPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Privacy Policy');
  });

  it('should have last updated date', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.last-updated')).toBeTruthy();
  });

  it('should have policy sections', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const policySections = compiled.querySelectorAll('.policy-section');
    expect(policySections.length).toBeGreaterThan(0);
  });

  it('should include information collection section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headings = Array.from(compiled.querySelectorAll('h2')).map(h => h.textContent);
    expect(headings).toContain('Information We Collect');
  });

  it('should include data security section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headings = Array.from(compiled.querySelectorAll('h2')).map(h => h.textContent);
    expect(headings).toContain('Data Security');
  });
});
