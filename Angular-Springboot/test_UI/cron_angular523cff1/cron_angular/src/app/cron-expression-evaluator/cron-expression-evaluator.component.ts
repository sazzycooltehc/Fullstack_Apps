import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cron-expression-evaluator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cron-expression-evaluator.component.html',
  styleUrls: ['./cron-expression-evaluator.component.css']
})
export class CronExpressionEvaluatorComponent {
  cronExpression: string = '';
  cronFields = { seconds: '*', minutes: '*', hours: '*', days: '*', month: '*', dayOfWeek: '*' };
  activeFields = { seconds: false, minutes: false, hours: false, days: false, month: false, dayOfWeek: false };

  // Cron validation
  validateCronParts(parts: string[]): boolean {
    if (parts.length !== 6) {
      return false;
    }

    const ranges = [
      [0, 59], // -> seconds
      [0, 59], // -> minutes
      [0, 23], // -> hours
      [1, 31], // -> days of month
      [1, 12], // -> month
      [0, 6]   // -> day of week
    ];

    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    for (let i = 0; i < 6; i++) {
      const part = parts[i].toUpperCase();
      const [min, max] = ranges[i];

      if (part === '*') {
        continue;
      }

      if (i === 4 && months.includes(part)) {
        continue;
      }
      if (i === 5 && daysOfWeek.includes(part)) {
        continue;
      }

      const num = parseInt(part);
      if (isNaN(num) || num < min || num > max) {
        return false;
      }
    }
    return true;
  }

  onCronChange(value: string | Event) {

    /*
    
    Create Cron Expression Parsing function that has the following functionalities.
    
    1. Renders cron expression input field
    
    2. Parses and displays individual cron fields accurately
    
    Example:
    Input: '0 15 12 1 JAN MON'
    Output:
    Seconds: 0 (active)
    Minutes: 15 (active)
    Hours: 12 (active)
    Days: 1 (active)
    Month: JAN (active)
    Day of Week: MON (active)
    
    3. Handles default values appropriately when * is used
    
    Example:
    Input: '* * * * * *'
    Output:
    Seconds: *
    Minutes: *
    Hours: *
    Days: *
    Month: *
    Day of Week: *
    
    4. Resets all fields gracefully when an invalid cron expression is detected (e.g., incorrect number of parts)
    
    Example:
    Input: '0 15 12 1 JAN'
    Output:
    Seconds: *
    Minutes: *
    Hours: *
    Days: *
    Month: *
    Day of Week: *
    
    5. Trims extra spaces and still parses the expression correctly
    
    Example:
    Input: '    0    15   12    1    JAN    MON   '
    Output:
    Seconds: 0 (active)
    Minutes: 15 (active)
    Hours: 12 (active)
    Days: 1 (active)
    Month: JAN (active)
    Day of Week: MON (active)
    
    NOTE: You are free to implement the task in any other way as well but shouldn't be hardcoded.
    
    */
    const expression = typeof value === 'string' ? value : (value.target as HTMLInputElement).value;
    this.cronExpression = expression;

    const parts = expression.trim().split(/\s+/);
    const valid = this.validateCronParts(parts);

    if (parts.length === 6 && valid) {
      // If valid, parse and assign each part to the corresponding field
      this.cronFields.seconds = parts[0];
      this.cronFields.minutes = parts[1];
      this.cronFields.hours = parts[2];
      this.cronFields.days = parts[3];
      this.cronFields.month = parts[4];
      this.cronFields.dayOfWeek = parts[5];

      // Mark fields as active if their value is not the default '*'
      this.activeFields.seconds = this.cronFields.seconds !== '*';
      this.activeFields.minutes = this.cronFields.minutes !== '*';
      this.activeFields.hours = this.cronFields.hours !== '*';
      this.activeFields.days = this.cronFields.days !== '*';
      this.activeFields.month = this.cronFields.month !== '*';
      this.activeFields.dayOfWeek = this.cronFields.dayOfWeek !== '*';
    } else {
      // If the expression is invalid, reset all fields to their default state
      this.cronFields = { seconds: '*', minutes: '*', hours: '*', days: '*', month: '*', dayOfWeek: '*' };
      this.activeFields = { seconds: false, minutes: false, hours: false, days: false, month: false, dayOfWeek: false };
    }

  }
}
