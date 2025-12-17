import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamEdit } from './team-edit';

describe('TeamEdit', () => {
  let component: TeamEdit;
  let fixture: ComponentFixture<TeamEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
