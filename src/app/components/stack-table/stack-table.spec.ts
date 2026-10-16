import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { Exercise, ExerciseData } from '../../models/exercise';
import { StackTable } from './stack-table';

function makeExercise(id: string, order: number): Exercise {
  return {
    id,
    name: id,
    baseName: id,
    order,
    description: '',
    functions: [],
    keyPoints: [],
    thumbnail: '',
    sourcePages: [],
  };
}

function makeExercises(prefix: string, count: number): Exercise[] {
  return Array.from({ length: count }, (_, i) => makeExercise(`${prefix}-${i + 1}`, i + 1));
}

// Mirrors the real dataset's proportions: 32 isolated, 16 mobility, 16 integrated.
const mockData: ExerciseData = {
  source: 'test',
  language: 'en',
  excluded: [],
  thumbnailSize: { '1x': 160, '2x': 320 },
  categories: [
    {
      id: 'isolated-floor-exercises',
      name: 'Isolated Floor Exercises',
      description: null,
      groupIds: ['iso-a', 'iso-b'],
    },
    {
      id: 'mobility-floor-exercises',
      name: 'Mobility Floor Exercises',
      description: null,
      groupIds: ['mob'],
    },
    {
      id: 'integrated-standing-exercises',
      name: 'Integrated Standing Exercises',
      description: null,
      groupIds: ['int'],
    },
  ],
  groups: [
    {
      id: 'iso-a',
      name: 'Iso A',
      category: 'Isolated Floor Exercises',
      thumbnail: '',
      exercises: makeExercises('iso-a', 8),
    },
    {
      id: 'iso-b',
      name: 'Iso B',
      category: 'Isolated Floor Exercises',
      thumbnail: '',
      exercises: makeExercises('iso-b', 24),
    },
    {
      id: 'mob',
      name: 'Mobility',
      category: 'Mobility Floor Exercises',
      thumbnail: '',
      exercises: makeExercises('mob', 16),
    },
    {
      id: 'int',
      name: 'Integrated',
      category: 'Integrated Standing Exercises',
      thumbnail: '',
      exercises: makeExercises('int', 16),
    },
  ],
};

describe('StackTable', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StackTable],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should render 8 stack rows', () => {
    const fixture = TestBed.createComponent(StackTable);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('tr.mat-mdc-row').length).toBe(8);
  });

  it('should render 5 column headers', () => {
    const fixture = TestBed.createComponent(StackTable);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const headers = compiled.querySelectorAll('th.mat-mdc-header-cell');
    expect(headers.length).toBe(5);
    expect(headers[0].textContent?.trim()).toBe('Stack');
    expect(headers[1].textContent?.trim()).toBe('Isolated Floor Exercises');
    expect(headers[2].textContent?.trim()).toBe('Mobility Floor Exercises');
    expect(headers[3].textContent?.trim()).toBe('Kneeling transitions');
    expect(headers[4].textContent?.trim()).toBe('Integrated Standing Exercises');
  });

  it('should render a fill button', () => {
    const fixture = TestBed.createComponent(StackTable);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('button')?.textContent).toContain('Fill random');
  });

  it('should fill every stack with one exercise from each category', () => {
    const fixture = TestBed.createComponent(StackTable);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('data/exercises.json').flush(mockData);
    component.generate();

    const byCategory = (name: string) =>
      new Set(
        mockData.groups
          .filter((g) => g.category === name)
          .flatMap((g) => g.exercises.map((e) => e.id)),
      );
    const isolatedIds = byCategory('Isolated Floor Exercises');
    const mobilityIds = byCategory('Mobility Floor Exercises');
    const integratedIds = byCategory('Integrated Standing Exercises');

    const rows = component.rows();
    expect(rows.length).toBe(8);

    for (const row of rows) {
      expect(row.isolated.length).toBe(1);
      expect(row.mobility.length).toBe(1);
      expect(row.integrated.length).toBe(1);

      expect(isolatedIds.has(row.isolated[0].id)).toBe(true);
      expect(mobilityIds.has(row.mobility[0].id)).toBe(true);
      expect(integratedIds.has(row.integrated[0].id)).toBe(true);
    }
  });

  it('should keep the kneeling placeholder filled on every stack', () => {
    const fixture = TestBed.createComponent(StackTable);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('data/exercises.json').flush(mockData);
    component.generate();

    const rows = component.rows();
    for (const row of rows) {
      expect(row.kneeling).toBeTruthy();
    }
  });
});
