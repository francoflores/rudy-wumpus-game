import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellGameComponent } from './cell-game.component';

describe('CellGameComponent', () => {
  let component: CellGameComponent;
  let fixture: ComponentFixture<CellGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CellGameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CellGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
