import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CronExpressionEvaluatorComponent } from './cron-expression-evaluator.component';

describe('CronExpressionEvaluatorComponent', () => {
  let component: CronExpressionEvaluatorComponent;
  let fixture: ComponentFixture<CronExpressionEvaluatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CronExpressionEvaluatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CronExpressionEvaluatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
