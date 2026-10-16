import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { map } from 'rxjs';
import type { Exercise, ExerciseGroup } from '../../models/exercise';
import { ExerciseService } from '../../services/exercise.service';

interface StackRow {
  stack: number;
  isolated: Exercise[];
  mobility: Exercise[];
  kneeling: string;
  integrated: Exercise[];
}

const KNEELING_OPTIONS = ['Short kneeling', 'Long kneeling', 'Side kneeling'];

@Component({
  selector: 'app-stack-table',
  imports: [MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './stack-table.html',
  styleUrl: './stack-table.scss',
})
export class StackTable {
  protected readonly service = inject(ExerciseService);
  private readonly breakpoint = inject(BreakpointObserver);

  /** On phones render a stacked card list instead of the wide table. */
  protected readonly isCompact = toSignal(
    this.breakpoint.observe('(max-width: 599.98px)').pipe(map((result) => result.matches)),
    { initialValue: typeof window !== 'undefined' && window.innerWidth < 600 },
  );

  readonly columns: string[] = ['stack', 'isolated', 'mobility', 'kneeling', 'integrated'];

  readonly rows = signal<StackRow[]>(this.emptyRows());

  /** Fill every stack with one randomly-chosen exercise from each category. */
  generate(): void {
    const data = this.service.data();
    if (!data) {
      return;
    }

    const groupsByCategory = new Map<string, ExerciseGroup[]>();
    for (const group of data.groups) {
      const list = groupsByCategory.get(group.category) ?? [];
      list.push(group);
      groupsByCategory.set(group.category, list);
    }

    const isolated = this.pickOnePerStack(groupsByCategory.get('Isolated Floor Exercises') ?? []);
    const mobility = this.pickOnePerStack(groupsByCategory.get('Mobility Floor Exercises') ?? []);
    const integrated = this.pickOnePerStack(groupsByCategory.get('Integrated Standing Exercises') ?? []);

    this.rows.set(
      Array.from({ length: 8 }, (_, index) => ({
        stack: index + 1,
        isolated: [isolated[index]],
        mobility: [mobility[index]],
        kneeling: KNEELING_OPTIONS[Math.floor(Math.random() * KNEELING_OPTIONS.length)],
        integrated: [integrated[index]],
      })),
    );
  }

  /**
   * Return one randomly-selected exercise per stack (8 total), shuffling the
   * category's exercises so each fill produces a different selection.
   */
  private pickOnePerStack(groups: ExerciseGroup[]): Exercise[] {
    const shuffled = this.shuffle(groups.flatMap((group) => group.exercises));
    return Array.from({ length: 8 }, (_, index) => shuffled[index % shuffled.length]);
  }

  private shuffle<T>(items: T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private emptyRows(): StackRow[] {
    return Array.from({ length: 8 }, (_, index) => ({
      stack: index + 1,
      isolated: [],
      mobility: [],
      kneeling: '',
      integrated: [],
    }));
  }
}
