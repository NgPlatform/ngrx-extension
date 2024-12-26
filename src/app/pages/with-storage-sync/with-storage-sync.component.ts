import {Component, inject, signal} from '@angular/core';
import {TodoSignalStore} from './todo.signal-store';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-with-storage-sync',
  providers: [TodoSignalStore],
  template: `
    <div class="flex gap-4 flex-col p-3">
      <h1 class="text-3xl">With Storage Sync</h1>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          @for (todo of $todos(); track i; let i = $index) {
            <div class="flex gap-2 items-center">
              <div class="flex gap-2 flex-col border border-slate-300 rounded-2xl p-5 w-96">
                @if ($editTodo() === i) {
                  <input placeholder="user" [(ngModel)]="$editUser" class="p-2 rounded-2xl">
                  <input placeholder="task" [(ngModel)]="$editTask" class="p-2 rounded-2xl">
                } @else {
                  <p>user:{{ todo.user }}</p>
                  <p>body:{{ todo.task }}</p>
                }
              </div>
              <button class="border rounded-lg p-3" (click)="clickRemoveTask(i)">
                <p class="text-red-500">削除</p>
              </button>
              <button class="border rounded-lg p-3" (click)="clickEditMode({idx:i})">
                <p class="text-green-500">編集</p>
              </button>
            </div>
          }

          <div class="flex gap-2 flex-col">
            <h2 class="text-2xl">Add Task</h2>
            <div class="flex gap-2 items-center">
              <div class="flex gap-2 border border-slate-300 rounded-2xl p-5 flex-col w-96">
                <input placeholder="user" [(ngModel)]="$user" class="p-2 rounded-2xl">
                <input placeholder="task" [(ngModel)]="$task" class="p-2 rounded-2xl">
              </div>
              <button
                class="border rounded-lg p-3" (click)="clickAddTask()" [disabled]="$task() === '' || $user() === ''"
              >
                <p class="text-blue-500">追加</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  imports: [
    FormsModule
  ]
})
export class WithStorageSyncComponent {

  $user = signal<string>('');
  $task = signal<string>('');
  $editTodo = signal<number>(-1);
  $editUser = signal<string>('');
  $editTask = signal<string>('');
  private readonly todoSignalStore = inject(TodoSignalStore);
  $todos = this.todoSignalStore.todos;

  clickAddTask(): void {
    this.todoSignalStore.addTask({todo: {user: this.$user(), task: this.$task()}});

    this.$user.set('');
    this.$task.set('');
  }

  clickEditMode({idx}: { idx: number }): void {
    if (this.$editTodo() === -1) {
      this.$editTodo.set(idx);

      this.$editUser.set(this.$todos()[idx].user)
      this.$editTask.set(this.$todos()[idx].task)
    } else {
      this.todoSignalStore.editTask({idx, editTodo: {user: this.$editUser(), task: this.$editTask()}})

      this.$editTodo.set(-1);

      this.$editUser.set('')
      this.$editTask.set('')
    }
  }

  clickRemoveTask(idx: number): void {
    this.todoSignalStore.removeTodo({idx})
  }
}
