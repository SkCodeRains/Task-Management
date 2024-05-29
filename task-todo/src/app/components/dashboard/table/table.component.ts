import { Component, Input, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TasksService } from '../../../services/tasks.service';
import { MatDialog } from '@angular/material/dialog';
import { RestService } from '../../../services/rest.service';
import { Itask } from '../../interfaces/interface';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DeleteDialogComponent } from '../../dialogs/delete-dialog/delete-dialog.component';
import { EditDialogComponent } from '../../dialogs/edit-dialog/edit-dialog.component';
import { AddtaskDialogComponent } from '../../dialogs/add-task-dialog/add-task-dialog.component';
/**
 * @title Styling columns using their auto-generated column names
 */
@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {
  displayedColumns: string[] = ['task_name', 'status', 'action'];


  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private _dataSource!: MatTableDataSource<Itask>;
  @Input()
  public set dataSource(value: Itask[]) {
    if (value) {
      this._dataSource = new MatTableDataSource(value);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.paginator._intl.itemsPerPageLabel = ""
    }
  }
  public get dataSource(): MatTableDataSource<Itask> {
    return this._dataSource;
  }

  pageSizeOptions = [5, 10, 25];

  pageEvent!: PageEvent;

  defaulttask: Itask = {
    _id: '',
    task_name: '',
    status: 0,
    description: ''
  }

  get status() {
    return this.taskService.status;
  }

  constructor(private taskService: TasksService, private dialog: MatDialog, private rest: RestService) { }


  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openEditDialog(element: any, enterAnimationDuration: string, exitAnimationDuration: string): void {
    let subs = this.dialog.open(EditDialogComponent, {
      enterAnimationDuration,
      exitAnimationDuration,
      panelClass: "update-task",
      data: element,
      autoFocus: false
    }).afterClosed().subscribe({
      next: (res: Itask) => {
        if (res) {
          this.updateTask(element, res);
        }
        subs.unsubscribe();
      },
      complete: () => {
        subs.unsubscribe();
      }
    });
  }
  updateTask(element: Itask, res: Itask) {
    let subs = this.rest.updateTask(res).subscribe({
      next: (res) => {
        console.log(res);
        if (res.success) {
          element.task_name = res.task.task_name;
          element.status = res.task.status;
        }
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        subs.unsubscribe();
      }
    })
  }

  openDeleteDialog(element: any, enterAnimationDuration: string, exitAnimationDuration: string): void {
    let ref = this.dialog.open(DeleteDialogComponent, {
      enterAnimationDuration,
      exitAnimationDuration,
      panelClass: "update-task",
    });

    let subs = ref.afterClosed().subscribe({
      next: (res) => {
        if (res.delete) {
          this.deleteTask(element);
        }
      },
      complete: () => {
        subs.unsubscribe();
      }
    })
  }
  deleteTask(task: Itask) {
    let subs = this.rest.deleteTask(task).subscribe({
      next: (res) => {
        if (res.success) {
          const index = this._dataSource.data.findIndex(item => item._id === task._id);
          if (index !== -1) {
            this._dataSource.data.splice(index, 1);
            this._dataSource.data = [...this._dataSource.data]; // Trigger change detection (optional)
          }
        }
      },
      complete: () => {
        subs.unsubscribe();
      }
    })
  }

  openAddtaskDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    let subs = this.dialog.open(AddtaskDialogComponent, {
      enterAnimationDuration,
      exitAnimationDuration,
      panelClass: "update-task",
      autoFocus: false
    }).afterClosed().subscribe({
      next: (task: Itask) => {
        if (task) {
          this.addtask(task);
        }
      },
      complete: () => {
        subs.unsubscribe();
      }
    });
  }
  addtask(task: Itask) {
    task = { ...this.defaulttask, ...task };
    let subs = this.rest.createTask(task).subscribe({
      next: (res) => {
        if (res.success) {
          this.addNewtask(res.task);
        } else if (res.message) {
          this.taskService.showMessage(res.message);
        }
      },
      complete: () => {
        subs.unsubscribe();
      }
    })

  }
  addNewtask(task: any) {
    this._dataSource.data = [...this._dataSource.data, task];
  }
}
