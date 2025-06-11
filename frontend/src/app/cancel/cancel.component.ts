import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cancel',
  standalone: true,
  template: '' // Pas besoin d'affichage
})
export class CancelComponent {
  constructor(private router: Router) {}

  ngOnInit(): void {
    console.warn('❌ Paiement annulé ou échoué');
    // Redirection discrète vers dashboard ou autre
    this.router.navigate(['/admin']);
  }
}
