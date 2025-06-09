import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AdminPasswordModalComponent } from '../components/admin-password-modal/admin-password-modal.component';
import { ManageUsersModalComponent } from '../components/manage-users-modal-component/manage-users-modal-component.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    HttpClientModule,
    AdminPasswordModalComponent,
    ManageUsersModalComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  standalone: true,
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  username = '';
  passwordModalVisible = false;
  userModalVisible = false;
  users: any[] = [];
  role = 'user';
  currentUsername = '';
  createdAt!: Date
  daysRemaining = 30;
  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.username = sessionStorage.getItem('username') || 'Admin';
      this.role = sessionStorage.getItem('role') || 'user';
      const createdAtStr = sessionStorage.getItem('createdAt');
      console.log('createdAtStr', createdAtStr);
      this.currentUsername = this.username;
      if (createdAtStr) {
        this.createdAt = new Date(createdAtStr);
        const now = new Date();
        const diff = Math.floor((now.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        this.daysRemaining = 30 - diff;
        console.log('daysRemaining', this.daysRemaining);
      }

    } else {
      this.username = 'Admin';
      this.currentUsername = 'Admin';
    }

    this.loadUsers();
  }

  openPasswordModal() {
    this.passwordModalVisible = true;
  }

  closePasswordModal() {
    this.passwordModalVisible = false;
  }

  saveAdminPassword(newPassword: string) {
    this.http.post('http://localhost:5200/api/admin/set-password', { password: newPassword })
      .subscribe({
        next: () => {
          alert('Mot de passe admin mis à jour !');
          this.passwordModalVisible = false;
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour du mot de passe', err);
          alert('Erreur lors de la mise à jour du mot de passe');
        }
      });
  }

  openUserManagement() {
    this.userModalVisible = true;
  }

  closeUserModal() {
    this.userModalVisible = false;
  }

  loadUsers() {
    this.http.get<any[]>('http://localhost:5200/api/users')
      .subscribe({
        next: (data) => {
          this.users = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des utilisateurs', err);
        }
      });
  }

  updateUserRole(update: { userId: number, role: string }) {
    this.http.post('http://localhost:5200/api/users/update-role', update)
      .subscribe({
        next: () => {
          this.loadUsers(); // refresh
          alert('Rôle utilisateur mis à jour !');
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour du rôle', err);
          alert('Erreur lors de la mise à jour du rôle');
        }
      });
  }

  logout() {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('role');
    this.router.navigate(['/home']);
  }
  get adminCount(): number {
    return this.users.filter(u => u.role === 'admin').length;
  }

}
