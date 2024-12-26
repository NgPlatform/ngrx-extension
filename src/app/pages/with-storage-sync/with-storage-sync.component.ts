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
              <div class="border border-slate-300 rounded-2xl p-5 w-96">
                <p>user:{{ todo.user }}</p>
                <p>body:{{ todo.task }}</p>
              </div>
              <button class="border rounded-lg p-3" (click)="clickRemoveTask(i)">
                <p class="text-red-500">削除</p>
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
  private readonly todoSignalStore = inject(TodoSignalStore);
  $todos = this.todoSignalStore.todos;

  clickAddTask(): void {
    this.todoSignalStore.addTask({todo: {user: this.$user(), task: this.$task()}});

    this.$user.set('');
    this.$task.set('');
  }

  clickRemoveTask(idx: number): void {
    this.todoSignalStore.removeTodo({idx})
  }
}
