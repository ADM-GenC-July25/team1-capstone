import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchedItems } from './searched-items';

describe('SearchedItems', () => {
  let component: SearchedItems;
  let fixture: ComponentFixture<SearchedItems>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchedItems]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchedItems);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
