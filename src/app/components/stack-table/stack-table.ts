import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import type { Exercise, ExerciseGroup } from '../../models/exercise';
import { ExerciseService } from '../../services/exercise.service';

interface StackRow {
  stack: number;
  isolated: Exercise[];
  mobility: Exercise[];
  kneeling: Exercise[];
  integrated: Exercise[];
}

@Component({
  selector: 'app-stack-table',
  imports: [MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './stack-table.html',
  styleUrl: './stack-table.scss',
})
export class StackTable {
  protected readonly service = inject(ExerciseService);

  readonly columns: string[] = ['stack', 'isolated', 'mobility', 'kneeling', 'integrated'];

  readonly rows = signal<StackRow[]>(this.emptyRows());

  /** Fill every cell with a balanced, randomized mix drawn from each category's sub-groups. */
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

    const isolated = this.distribute(groupsByCategory.get('Isolated Floor Exercises') ?? []);
    const mobility = this.distribute(groupsByCategory.get('Mobility Floor Exercises') ?? []);
    const integrated = this.distribute(groupsByCategory.get('Integrated Standing Exercises') ?? []);

    this.rows.set(
      Array.from({ length: 8 }, (_, index) => ({
        stack: index + 1,
        isolated: isolated[index],
        mobility: mobility[index],
        kneeling: [],
        integrated: integrated[index],
      })),
    );
  }

  /**
   * Spread a category's exercises evenly across the 8 stacks, favoring a mix of
   * sub-groups: each exercise goes to the least-loaded stack that has the fewest
   * entries from its own sub-group (ties broken randomly).
   */
  private distribute(groups: ExerciseGroup[]): Exercise[][] {
    const stacks: Exercise[][] = Array.from({ length: 8 }, () => []);
    const groupCounts: Array<Map<string, number>> = Array.from({ length: 8 }, () => new Map());

    for (const group of groups) {
      const shuffled = this.shuffle(group.exercises);
      for (const exercise of shuffled) {
        const minTotal = Math.min(...stacks.map((stack) => stack.length));
        const candidates = stacks.map((_, i) => i).filter((i) => stacks[i].length === minTotal);
        const minGroup = Math.min(...candidates.map((i) => groupCounts[i].get(group.id) ?? 0));
        const finalists = candidates.filter((i) => (groupCounts[i].get(group.id) ?? 0) === minGroup);
        const target = finalists[Math.floor(Math.random() * finalists.length)];

        stacks[target].push(exercise);
        groupCounts[target].set(group.id, (groupCounts[target].get(group.id) ?? 0) + 1);
      }
    }

    return stacks;
  }

  private emptyRows(): StackRow[] {
    return Array.from({ length: 8 }, (_, index) => ({
      stack: index + 1,
      isolated: [],
      mobility: [],
      kneeling: [],
      integrated: [],
    }));
  }

  private shuffle<T>(items: T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
