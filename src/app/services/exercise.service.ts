import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';
import type { Category, Exercise, ExerciseData, ExerciseGroup } from '../models/exercise';

@Injectable({ providedIn: 'root' })
export class ExerciseService {
  private readonly http = inject(HttpClient);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly data = toSignal(
    this.http.get<ExerciseData>('data/exercises.json').pipe(
      tap(() => this.loading.set(false)),
      catchError(() => {
        this.loading.set(false);
        this.error.set('Failed to load exercise data.');
        return of(undefined);
      }),
    ),
    { initialValue: undefined },
  );

  /** Absolute URL for a thumbnail path stored relative to the app root. */
  thumbnailUrl(path: string): string {
    return path.startsWith('/') ? path : `/${path}`;
  }

  /** `srcset` value: 1x (160px) and 2x (@2x, 320px) variants. */
  thumbnailSrcset(path: string): string {
    const dot = path.lastIndexOf('.');
    const base = dot === -1 ? path : path.slice(0, dot);
    const ext = dot === -1 ? '' : path.slice(dot);
    const url1x = this.thumbnailUrl(path);
    const url2x = this.thumbnailUrl(`${base}@2x${ext}`);
    return `${url1x} 1x, ${url2x} 2x`;
  }

  groupsForCategory(data: ExerciseData, category: Category): ExerciseGroup[] {
    const byId = new Map(data.groups.map((g) => [g.id, g]));
    return category.groupIds.map((id) => byId.get(id)).filter((g): g is ExerciseGroup => !!g);
  }

  totalExercises(data: ExerciseData): number {
    return data.groups.reduce((sum, g) => sum + g.exercises.length, 0);
  }

  matches(exercise: Exercise, term: string): boolean {
    const t = term.trim().toLowerCase();
    if (!t) {
      return true;
    }
    return (
      exercise.name.toLowerCase().includes(t) || exercise.baseName.toLowerCase().includes(t)
    );
  }
}
