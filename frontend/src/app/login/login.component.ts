import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form = {
    email: '',
    password: ''
  };

  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    this.http.post<any>('http://localhost:5200/api/auth/login', this.form)
      .subscribe({
        next: (res) => {
          console.log('✅ Réponse reçue du backend :', res);

          if (res.email) {
            sessionStorage.setItem('email', res.email);
            console.log('📥 Email stocké :', res.email);
          } else {
            console.warn('⚠️ Aucun email fourni dans la réponse.');
          }

          if (res.username) sessionStorage.setItem('username', res.username);
          if (res.role) sessionStorage.setItem('role', res.role);
          if (res.createdAt) sessionStorage.setItem('createdAt', res.createdAt);

          this.router.navigate(['/dashboard']); // Redirection après login
        },
        error: (err) => {
          console.error('❌ Erreur lors de la connexion :', err);
          this.errorMessage = err.error?.error || 'Erreur lors de la connexion';
        }
      });
  }

}
