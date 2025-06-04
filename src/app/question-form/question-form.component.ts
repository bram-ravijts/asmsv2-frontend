import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
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

// Custom validator function
export function minSelectedCheckboxesValidator(minRequired = 1): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formArray = control as FormArray;
    const selectedCount = formArray.controls
      .map(ctrl => ctrl.value)
      .reduce((prev, next) => next ? prev + 1 : prev, 0);

    if (formArray.disabled) {
        return null;
    }
    const result = selectedCount >= minRequired ? null : { requiredCheckboxes: true, minRequired };
    return result;
  };
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
export class QuestionFormComponent implements OnInit, OnChanges {
  @Input() question!: Question;
  @Output() answerSubmit = new EventEmitter<{ questionId: string, selectedAnswers: string[] }>();
  questionForm!: FormGroup;
  showCheckboxError = false;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    // Initialize with a default or empty form structure
    this.questionForm = this.fb.group({});
    if (this.question) {
      this.initializeForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['question'] && this.question) {
      // Ensure this.questionForm is initialized, as ngOnChanges can fire before ngOnInit
      if (!this.questionForm) {
        this.questionForm = this.fb.group({});
      }
      this.initializeForm();
    } else if (changes['question']) {
    }
  }

  private initializeForm(): void {
    // Ensure questionForm itself is initialized before trying to access its methods
    if (!this.questionForm) {
      return; // Or throw an error, as this shouldn't happen with current ngOnInit logic
    }

    if (!this.question) {
      return;
    }

    // Clear existing controls to avoid conflicts during re-initialization
    if (this.questionForm.contains('selectedOption')) {
      this.questionForm.removeControl('selectedOption');
    }
    if (this.questionForm.contains('selectedOptions')) {
      this.questionForm.removeControl('selectedOptions');
    }

    if (this.question.answerType === 'radio') {
      this.questionForm.addControl('selectedOption', this.fb.control('', this.question.required ? Validators.required : null));
    } else if (this.question.answerType === 'checkbox') {
      if (!this.question.options || this.question.options.length === 0) {
        // Potentially add an empty FormArray or handle as an error state
      } else {
        const controls = this.question.options.map(() => this.fb.control(false));
        // Revert to just our custom validator if it's working
        this.questionForm.addControl('selectedOptions', this.fb.array(controls, minSelectedCheckboxesValidator(1)));
      }
    }
    this.questionForm.updateValueAndValidity();
  }

  get selectedOptionsArray(): FormArray {
    return this.questionForm.get('selectedOptions') as FormArray;
  }

  onSubmit(): void {
    if (this.questionForm.get('selectedOptions')) {
      const selectedOptionsCtrl = this.questionForm.get('selectedOptions') as FormArray;
    }

    // Reset the flags at the beginning of each submission attempt
    this.showCheckboxError = false;

    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched(); // Mark all as touched to show other potential errors

      const selectedOptionsArray = this.questionForm.get('selectedOptions') as FormArray;
      if (selectedOptionsArray && selectedOptionsArray.hasError('requiredCheckboxes')) {
        this.showCheckboxError = true;
      } else {
        // If the form is invalid for reasons other than checkbox selection
        // No specific action needed here now for generic errors, markAllAsTouched handles visibility for standard errors
      }
      // Explicitly mark the FormArray and its controls as touched to ensure standard error styling applies if needed elsewhere
      if (this.questionForm.get('selectedOptions')) {
        const selectedOptionsCtrl = this.questionForm.get('selectedOptions') as FormArray;
        selectedOptionsCtrl.markAsTouched();
        selectedOptionsCtrl.controls.forEach(control => control.markAsTouched());
      }
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
  }
}
