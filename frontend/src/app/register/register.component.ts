import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // pour ngModel
import { CommonModule } from '@angular/common'; // pour *ngIf, *ngFor si tu les utilises

@Component({
  selector: 'app-register',
  standalone: true, // ✅ tu déclares que ce composant est autonome
  imports: [CommonModule, FormsModule], // ✅ tu importes les modules nécessaires
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  form = {
    email: '',
    username: '',
    password: '',
    role: 'admin'
  };

  onSubmit() {
    console.log('Formulaire envoyé :', this.form);
    // ➕ Ici tu pourras appeler l'API avec HttpClient
  }
}
