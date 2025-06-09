import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-users-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-users-modal-component.component.html',
  styleUrls: ['./manage-users-modal-component.component.scss']
})
export class ManageUsersModalComponent {
  @Input() visible: boolean = false;
  @Input() users: any[] = [];
  @Input() currentUsername: string = '';
  @Output() updateRole = new EventEmitter<{ userId: number; role: string }>();
  @Output() close = new EventEmitter<void>();


  onRoleChange(userId: number, newRole: string) {
    this.updateRole.emit({ userId, role: newRole });
  }

  emitClose() {
    this.close.emit();
  }
  get otherUsers(): any[] {
    return this.users.filter(user => user.username !== this.currentUsername);
  }
  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.emitClose();
    }
  }

  trackByUserId(index: number, user: any): number {
    return user.id;
  }
}
