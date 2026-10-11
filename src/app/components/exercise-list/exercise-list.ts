import { Component, computed, inject, input, output, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import type { Exercise, ExerciseData } from '../../models/exercise';
import { ExerciseService } from '../../services/exercise.service';
import { ExerciseCard } from '../exercise-card/exercise-card';

interface CategoryView {
  id: string;
  name: string;
  description: string | null;
  groups: { id: string; name: string; thumbnail: string; exercises: Exercise[] }[];
}

@Component({
  selector: 'app-exercise-list',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ExerciseCard,
  ],
  templateUrl: './exercise-list.html',
  styleUrl: './exercise-list.scss',
})
export class ExerciseList {
  readonly data = input<ExerciseData>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly openExercise = output<Exercise>();

  readonly searchTerm = signal('');

  protected readonly service = inject(ExerciseService);

  protected readonly view = computed<CategoryView[]>(() => {
    const data = this.data();
    if (!data) {
      return [];
    }
    const term = this.searchTerm();
    return data.categories
      .map((category) => {
        const groups = this.service
          .groupsForCategory(data, category)
          .map((group) => ({
            id: group.id,
            name: group.name,
            thumbnail: group.thumbnail,
            exercises: group.exercises.filter((ex) => this.service.matches(ex, term)),
          }))
          .filter((group) => group.exercises.length > 0);
        return {
          id: category.id,
          name: category.name,
          description: category.description,
          groups,
        };
      })
      .filter((category) => category.groups.length > 0);
  });

  protected readonly totalExercises = computed(() =>
    this.data() ? this.service.totalExercises(this.data()!) : 0,
  );

  protected readonly totalGroups = computed(() => this.data()?.groups.length ?? 0);

  protected readonly excludedText = computed(() => this.data()?.excluded.join(', ') ?? '');
}
