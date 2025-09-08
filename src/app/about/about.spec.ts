import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutComponent } from './about';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('About ByteBazaar');
  });

  it('should have mission, values, and team sections', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.mission-section')).toBeTruthy();
    expect(compiled.querySelector('.values-section')).toBeTruthy();
    expect(compiled.querySelector('.team-section')).toBeTruthy();
  });

  it('should display value cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const valueCards = compiled.querySelectorAll('.value-card');
    expect(valueCards.length).toBe(4);
  });
});
