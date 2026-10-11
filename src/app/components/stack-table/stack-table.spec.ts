import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { StackTable } from './stack-table';

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
});
