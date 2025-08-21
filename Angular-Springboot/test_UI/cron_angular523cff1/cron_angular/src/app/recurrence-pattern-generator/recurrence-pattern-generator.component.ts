import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-recurrence-pattern-generator',
  standalone: true,
  imports: [FormsModule, CommonModule, MatCardModule],
  templateUrl: './recurrence-pattern-generator.component.html',
  styleUrls: ['./recurrence-pattern-generator.component.css']
})
export class RecurrencePatternGeneratorComponent {
  // Add this line to expose Object to the template
  Object = Object;

  weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  pattern: string = 'daily';
  time: string = '12:00';
  formattedTime: string = '12:00 pm'; // 12-hr format e.g. "02:30 PM"
  date: string = '1';
  selectedDays: { [key: string]: boolean } = {
    monday: false, tuesday: false, wednesday: false,
    thursday: false, friday: false, saturday: false, sunday: false
  };
  description: string = '';

  constructor() { }

  ngOnInit() {
    this.formattedTime = this.formatTo12Hour(this.time); // from default 24-hr
    this.generateDescription();
  }

  /*
  
  Create Recurrence Pattern Description Module that has the following functionalities
  Complete the following functionalities.
  
  1 .Renders recurrence pattern select field
  
  2 .Shows daily pattern description with the selected time
  
  Example:
  Input:
  Pattern: Daily
  Time: 10:30 AM
  Output: Runs every day at 10:30.
  
  3. Displays weekly pattern description with selected days and time
  
  Example:
  Input:
  Pattern: Weekly
  Days Selected: Monday, Friday
  Time: 08:30 AM
  Output: Runs every week on Monday, Friday at 08:30.
  
  4. Falls back to a generic weekly description when no days are selected
  
  Example:
  Input:
  Pattern: Weekly
  Days Selected: 'None'
  Time: 06:30 PM
  Output: Runs every week at 18:30.
  
  5. Shows monthly pattern description with selected date and time
  
  Example:
  Input:
  Pattern: Monthly
  Date Selected: 15
  Time: 09:00 AM
  Output: Runs every month on the 15th day at 09:00.
  
  6. Handles ordinal suffixes correctly (e.g., 1st, 2nd, 3rd, 11th, etc.)
  
  NOTE: You are free to implement the task in any other way as well but shouldn't be hardcoded.
  
  */

  // time functions 

  onTimeBlur() {
    try {
      this.time = this.convertTo24Hour(this.formattedTime);
    } catch (err) {
      console.error('Invalid time format');
      this.time = '00:00'; // fallback
    }
  }
  formatTo12Hour(time24: string): string {
    const [hours, minutes] = time24.split(':').map(Number);
    const suffix = hours >= 12 ? 'pm' : 'am';
    const hours12 = ((hours + 11) % 12 + 1);
    return `${this.padZero(hours12)}:${this.padZero(minutes)} ${suffix}`;
  }

  convertTo24Hour(time12: string): string {
    const cleaned = time12.trim().toLowerCase();
    const match = cleaned.match(/^(\d{1,2}):(\d{2})\s?(am|pm)$/);

    if (!match) throw new Error('Invalid time format');

    let [, hourStr, minuteStr, modifier] = match;
    let hours = parseInt(hourStr, 10);
    const minutes = parseInt(minuteStr, 10);

    if (modifier === 'pm' && hours !== 12) hours += 12;
    if (modifier === 'am' && hours === 12) hours = 0;

    return `${this.padZero(hours)}:${this.padZero(minutes)}`;
  }

  padZero(n: number): string {
    return n < 10 ? '0' + n : '' + n;
  }

  onPatternChange(value: string) {
    this.pattern = value;
    this.generateDescription();
  }

  onTimeChange(value: string) {
    this.time = value;
    this.generateDescription();
  }

  toggleDay(day: string) {
    this.selectedDays[day] = !this.selectedDays[day];
    this.generateDescription();
  }

  onDateChange(value: string) {
    this.date = value;
    this.generateDescription();
  }

  generateDescription() {
    let desc = '';
    const formattedTime = this.time;

    switch (this.pattern) {
      case 'daily':
        desc = `Runs every day at ${formattedTime}.`;
        break;

      case 'weekly':
        const selectedDays = this.getDaysKeys().filter(day => this.selectedDays[day]);
        if (selectedDays.length > 0) {
          const capitalizedDays = selectedDays.map(day => this.capitalize(day));
          desc = `Runs every week on ${capitalizedDays.join(', ')} at ${formattedTime}.`;
        } else {
          desc = `Runs every week at ${formattedTime}.`;
        }
        break;

      case 'monthly':
        const dayWithSuffix = this.ordinalSuffix(this.date);
        desc = `Runs every month on the ${dayWithSuffix} day at ${formattedTime}.`;
        break;
    }
    this.description = desc;
  }

  capitalize(day: string): string { return day.charAt(0).toUpperCase() + day.slice(1); }

  ordinalSuffix(day: string): string {
    const d = parseInt(day, 10);
    const s = ['th', 'st', 'nd', 'rd'];
    const v = d % 100;
    return d + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  getDaysKeys() {
    return Object.keys(this.selectedDays);
  }

}
