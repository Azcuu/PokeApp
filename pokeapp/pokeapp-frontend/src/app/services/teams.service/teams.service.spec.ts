import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsService } from './teams.service';

describe('TeamsService', () => {
  let component: TeamsService;
  let fixture: ComponentFixture<TeamsService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamsService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamsService);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
