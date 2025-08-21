import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurrencePatternGeneratorComponent } from './recurrence-pattern-generator.component';

describe('RecurrencePatternGeneratorComponent', () => {
  let component: RecurrencePatternGeneratorComponent;
  let fixture: ComponentFixture<RecurrencePatternGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecurrencePatternGeneratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecurrencePatternGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
