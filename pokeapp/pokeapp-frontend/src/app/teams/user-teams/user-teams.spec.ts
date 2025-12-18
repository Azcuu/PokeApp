import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTeams } from './user-teams';

describe('UserTeams', () => {
  let component: UserTeams;
  let fixture: ComponentFixture<UserTeams>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTeams]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserTeams);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
