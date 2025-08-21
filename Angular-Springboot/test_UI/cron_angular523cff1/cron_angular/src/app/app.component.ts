import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CronExpressionEvaluatorComponent } from './cron-expression-evaluator/cron-expression-evaluator.component';
import { RecurrencePatternGeneratorComponent } from './recurrence-pattern-generator/recurrence-pattern-generator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CronExpressionEvaluatorComponent, RecurrencePatternGeneratorComponent],
  template: `
    <div className="App">
    <header className="App-header" style="display: flex; justify-content: center; background-color: #282C34; color: #FFFFFF;">
      <h1>Cron Expression Visualizer</h1>
    </header>
    <main>
      <div className="container">
        <h2 style="text-align: center;">Part 1: Cron Expression Evaluator</h2>
        <app-cron-expression-evaluator></app-cron-expression-evaluator>
        
        <h2 style="text-align: center;">Part 2: Recurrence Pattern Generator</h2>
        <app-recurrence-pattern-generator></app-recurrence-pattern-generator>
      </div>
    </main>
  </div>
  `
})
export class AppComponent {
  title = 'cron_angular';
}
