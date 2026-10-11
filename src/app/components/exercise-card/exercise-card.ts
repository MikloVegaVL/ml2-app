import { Component, inject, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import type { Exercise } from '../../models/exercise';
import { ExerciseService } from '../../services/exercise.service';

@Component({
  selector: 'app-exercise-card',
  imports: [MatCardModule],
  templateUrl: './exercise-card.html',
  styleUrl: './exercise-card.scss',
})
export class ExerciseCard {
  readonly exercise = input.required<Exercise>();
  readonly open = output<Exercise>();

  protected readonly service = inject(ExerciseService);
}
