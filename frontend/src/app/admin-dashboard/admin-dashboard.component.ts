import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AdminPasswordModalComponent } from '../components/admin-password-modal/admin-password-modal.component';
import { ManageUsersModalComponent } from '../components/manage-users-modal-component/manage-users-modal-component.component';
import { IncidentTicketModalComponent } from '../components/incident-ticket-modal/incident-ticket-modal.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    AdminPasswordModalComponent,
    ManageUsersModalComponent,
    IncidentTicketModalComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  standalone: true,
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  username = '';
  role = 'user';
  isAdmin = false;
  createdAt!: Date;
  daysRemaining = 30;
  users: any[] = [];
  currentUsername = '';
  passwordModalVisible = false;
  userModalVisible = false;
  ticketModalVisible = false;
  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.username = sessionStorage.getItem('username') || 'Admin';
      this.role = sessionStorage.getItem('role') || 'user';
      this.isAdmin = sessionStorage.getItem('isAdmin') === 'true';
      this.currentUsername = this.username;
      console.log(this.isAdmin)
      const createdAtStr = sessionStorage.getItem('createdAt');
      console.log('createdAtStr', createdAtStr);

      if (createdAtStr) {
        this.createdAt = new Date(createdAtStr);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        this.daysRemaining = 30 - diffInDays;
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
  openTicketModal() {
    this.ticketModalVisible = true;
  }

  closeTicketModal() {
    this.ticketModalVisible = false;
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
          this.loadUsers();
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
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('is_admin');
    sessionStorage.removeItem('createdAt');
    this.router.navigate(['/home']);
  }

  get adminCount(): number {
    return this.users.filter(u => u.role === 'admin').length;
  }

  goToPayment() {
    const body = {
      userId: Number(sessionStorage.getItem('userId')),
      email: sessionStorage.getItem('email')
    };

    console.log('🔁 Demande de paiement :', body);

    this.http.post<any>('http://localhost:5200/api/payment/create-checkout-session', body)
      .subscribe({
        next: res => {
          if (res && res.url) {
            window.location.href = res.url;
          } else {
            alert('Erreur : URL de redirection manquante.');
          }
        },
        error: err => {
          console.error('Erreur de paiement :', err);
          alert("Erreur de paiement : " + err.message);
        }
      });
  }
  handleSubmitTicket(ticket: { sender: string, problemType: string, message: string }) {
    this.http.post('http://localhost:5200/api/email/send-incident', ticket).subscribe({
      next: () => {
        alert("✅ Ticket envoyé au responsable réseaux.");
        this.closeTicketModal();
      },
      error: (err) => {
        console.error("❌ Erreur envoi ticket :", err);
        alert("Erreur lors de l'envoi du ticket.");
      }
    });
  }
}
