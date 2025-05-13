import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRadioComponent } from './user-radio.component';

describe('UserRadioComponent', () => {
  let component: UserRadioComponent;
  let fixture: ComponentFixture<UserRadioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserRadioComponent]
    });
    fixture = TestBed.createComponent(UserRadioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
