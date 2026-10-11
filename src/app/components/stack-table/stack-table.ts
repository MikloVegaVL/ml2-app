import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

interface StackRow {
  stack: number;
  isolated: string;
  mobility: string;
  kneeling: string;
  integrated: string;
}

@Component({
  selector: 'app-stack-table',
  imports: [MatTableModule],
  templateUrl: './stack-table.html',
  styleUrl: './stack-table.scss',
})
export class StackTable {
  readonly columns: string[] = ['stack', 'isolated', 'mobility', 'kneeling', 'integrated'];

  readonly rows: StackRow[] = Array.from({ length: 8 }, (_, index) => ({
    stack: index + 1,
    isolated: '',
    mobility: '',
    kneeling: '',
    integrated: '',
  }));
}
