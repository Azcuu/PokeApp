import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokeappService } from './pokeapp-service';

describe('PokeappService', () => {
  let component: PokeappService;
  let fixture: ComponentFixture<PokeappService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokeappService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokeappService);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
