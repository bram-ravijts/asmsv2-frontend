import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

// Import the QuestionFormComponent and the Question interface
import { QuestionFormComponent, Question } from './question-form/question-form.component';

@Component({
  selector: 'app-root',
  standalone: true, // Explicitly mark as standalone if it is, or ensure it's declared in an NgModule
  imports: [
    RouterOutlet, 
    MatSelectModule, 
    MatInputModule, 
    MatFormFieldModule,
    QuestionFormComponent // Add QuestionFormComponent here
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'] // Fix styleUrl to styleUrls
})
export class AppComponent {
  title = 'front-end';

  // Sample question data
  currentQuestion: Question = {
    id: 'q1',
    text: 'What is your favorite color?',
    answerType: 'radio',
    options: [
      { value: 'red', label: 'Red' },
      { value: 'blue', label: 'Blue' },
      { value: 'green', label: 'Green' }
    ],
    required: true
  };

  // Sample question data for checkboxes
  // currentQuestion: Question = {
  //   id: 'q2',
  //   text: 'Which of these anmials are mammals? (Select all that apply)',
  //   answerType: 'checkbox',
  //   options: [
  //     { value: 'dog', label: 'Dog' },
  //     { value: 'shark', label: 'Shark' },
  //     { value: 'cat', label: 'Cat' },
  //     { value: 'eagle', label: 'Eagle' }
  //   ],
  //   required: true
  // };

  handleAnswer(submission: { questionId: string, selectedAnswers: string[] }): void {
    const questionText = this.currentQuestion.text; // Or fetch question by ID if managing multiple
    const answersText = submission.selectedAnswers.join(', ');
    alert(`Question: "${questionText}" (ID: ${submission.questionId})\nAnswer(s): ${answersText}`);

    // Here you would typically fetch the next question from a service
    // For now, we can just log or do nothing further
    console.log('Answer submitted:', submission);
  }
}
