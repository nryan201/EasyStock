import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // ✅
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule,HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form = {
    email: '',
    username: '',
    password: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    console.log('Formulaire soumis :', this.form);

    this.http.post('http://localhost:5200/api/auth/register', this.form)
      .subscribe({
        next: (res) => {
          console.log('Inscription réussie', res);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Erreur API', err);
          alert('Erreur lors de l’inscription');
        }
      });
  }
}
