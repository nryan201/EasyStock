import { Component } from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'EasyStock';
  constructor(private router: Router) {}
  onLogin() {
    this.router.navigate(['/register']);
    console.log('Connexion demandée');
  }

  onStartFree() {
    // Logique pour commencer gratuitement
    console.log('Démarrage gratuit demandé');
  }
}
