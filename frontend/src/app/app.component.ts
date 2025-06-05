import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // ✅ ici

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule], // ✅ ajoute CommonModule
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public router: Router) {}

  onLogin() {
    this.router.navigate(['/register']);
  }

  onStartFree() {
    console.log('Démarrage gratuit demandé');
  }

  isHomePage(): boolean {
    return this.router.url === '/' || this.router.url === '/login';
  }
}
