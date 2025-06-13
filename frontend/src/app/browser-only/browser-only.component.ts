import { Component, inject } from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule], // ✅ ajoute ça
  template: ''
})
export class SuccessComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const userId = sessionStorage.getItem('userId');
      if (userId) {
        this.http.post('http://localhost:5200/api/payment/set-admin', { userId: +userId })
          .subscribe({
            next: () => this.router.navigate(['/admin']),
            error: (err) => {
              console.error('❌ Erreur set-admin :', err);
              this.router.navigate(['/admin']);
            }
          });
      } else {
        this.router.navigate(['/admin']);
      }
    }
  }
}
