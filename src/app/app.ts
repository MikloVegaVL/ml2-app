import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { map } from 'rxjs';
import { ExerciseDetail } from './components/exercise-detail/exercise-detail';
import { ExerciseList } from './components/exercise-list/exercise-list';
import type { Exercise, ExerciseGroup } from './models/exercise';
import { ExerciseService } from './services/exercise.service';

const THEME_STORAGE_KEY = 'theme';

@Component({
  selector: 'app-root',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    ExerciseList,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly service = inject(ExerciseService);
  private readonly dialog = inject(MatDialog);
  private readonly breakpoint = inject(BreakpointObserver);

  protected readonly isHandset = toSignal(
    this.breakpoint.observe('(max-width: 959px)').pipe(map((result) => result.matches)),
    { initialValue: typeof window !== 'undefined' && window.innerWidth < 960 },
  );

  protected readonly sidenavOpened = signal(!this.isHandset());
  protected readonly isDark = signal(this.preferredTheme());

  constructor() {
    this.applyTheme(this.isDark());

    effect(() => {
      this.sidenavOpened.set(!this.isHandset());
    });
  }

  protected toggleTheme(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    this.applyTheme(next);
  }

  protected openExercise(exercise: Exercise): void {
    this.dialog.open(ExerciseDetail, {
      data: exercise,
      width: '640px',
      maxWidth: '94vw',
      panelClass: 'exercise-detail-panel',
    });
  }

  protected groupById(groupId: string): ExerciseGroup | undefined {
    return this.service.data()?.groups.find((group) => group.id === groupId);
  }

  protected scrollToGroup(groupId: string): void {
    document.getElementById(`group-${groupId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (this.isHandset()) {
      this.sidenavOpened.set(false);
    }
  }

  private preferredTheme(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved === 'dark';
    }
    if (typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  private applyTheme(dark: boolean): void {
    document.documentElement.classList.toggle('dark-mode', dark);
    localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
  }
}
