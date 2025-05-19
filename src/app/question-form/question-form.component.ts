import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Correctly import ReactiveFormsModule
import { CommonModule } from '@angular/common'; // Import CommonModule

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field'; // Import MatFormFieldModule for mat-error

export interface AnswerOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  text: string;
  answerType: 'radio' | 'checkbox';
  options: AnswerOption[];
  required?: boolean; // Optional: to indicate if an answer is mandatory
}

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatRadioModule,
    MatCheckboxModule,
    MatButtonModule,
    MatFormFieldModule // Add MatFormFieldModule here for mat-error
  ]
})
export class QuestionFormComponent implements OnInit {
  @Input() question!: Question;
  @Output() answerSubmit = new EventEmitter<{ questionId: string, selectedAnswers: string[] }>();

  questionForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(): void {
    // Re-initialize form if question changes
    if (this.question && this.questionForm) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    if (!this.question) {
      return;
    }

    let formControls: any = {};

    if (this.question.answerType === 'radio') {
      formControls['selectedOption'] = [null, this.question.required ? Validators.required : null];
    } else if (this.question.answerType === 'checkbox') {
      const checkboxArray = this.fb.array(
        this.question.options.map(() => this.fb.control(false)),
        this.question.required ? [Validators.required, Validators.minLength(1)] : []
      );
      formControls['selectedOptions'] = checkboxArray;
    }

    this.questionForm = this.fb.group(formControls);
  }

  get selectedOptionsArray(): FormArray {
    return this.questionForm.get('selectedOptions') as FormArray;
  }

  onSubmit(): void {
    console.log('QuestionFormComponent: onSubmit() called. Form valid:', !this.questionForm.invalid, 'Form value:', this.questionForm.value);
    if (this.questionForm.invalid) {
      // Mark all fields as touched to display validation errors
      this.questionForm.markAllAsTouched();
      return;
    }

    let selectedAnswers: string[] = [];
    if (this.question.answerType === 'radio') {
      const selectedValue = this.questionForm.get('selectedOption')?.value;
      if (selectedValue) {
        selectedAnswers.push(selectedValue);
      }
    } else if (this.question.answerType === 'checkbox') {
      this.selectedOptionsArray.controls.forEach((control, index) => {
        if (control.value) {
          selectedAnswers.push(this.question.options[index].value);
        }
      });
    }

    this.answerSubmit.emit({ questionId: this.question.id, selectedAnswers });
    // Optionally, reset the form after submission if needed
    // this.questionForm.reset();
    // this.initializeForm(); // Re-initialize for the next question if the same component instance is used
  }

  // New method for direct button click logging
  onButtonClick(): void {
    console.log('QuestionFormComponent: Submit Answer button clicked directly.');
  }
}
