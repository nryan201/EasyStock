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
          console.log(res);
          localStorage.setItem('username', res.username);
          localStorage.setItem('role', res.role);
          this.router.navigate(['/dashboard']); // 🔁 Redirection vers page de stock
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Erreur lors de la connexion';
        }
      });
  }
}
