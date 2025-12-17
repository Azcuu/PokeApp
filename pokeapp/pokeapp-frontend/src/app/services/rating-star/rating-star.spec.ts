import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingStar } from './rating-star';

describe('RatingStar', () => {
  let component: RatingStar;
  let fixture: ComponentFixture<RatingStar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingStar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RatingStar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
