import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosformComponent } from './posform.component';

describe('PosformComponent', () => {
  let component: PosformComponent;
  let fixture: ComponentFixture<PosformComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PosformComponent]
    });
    fixture = TestBed.createComponent(PosformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
