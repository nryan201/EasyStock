import { Component, inject, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserOnlyService } from '../browser-only/browser-only.service';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: ''
})
export class SuccessComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private browserService = inject(BrowserOnlyService);

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const userId = sessionStorage.getItem('userId');
      if (userId) {
        this.http.post('http://localhost:5200/api/payment/set-admin', { userId: +userId })
          .subscribe({
            next: () => {
              sessionStorage.setItem('isAdmin', 'true');// 🔥 Mise à jour locale
              this.router.navigate(['/admin']);
            },
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
