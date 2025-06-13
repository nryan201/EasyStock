import { Component, EventEmitter, Input, Output } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import {HttpClient, HttpClientModule} from '@angular/common/http';


@Component({
  selector: "app-password-check-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./app-password-check-modal.component.html",
  styleUrls: ["./app-password-check-modal.component.scss"],
})
export class PasswordCheckModalComponent {
  @Input() visible = false
  @Output() confirm = new EventEmitter<string>()
  @Output() cancelModal = new EventEmitter<void>()
  @Output() close = new EventEmitter<void>();
  password = ""
  errorMessage = ""
  successMessage = ""
  showPassword = false
  isSubmitting = false
  attempts = 0
  maxAttempts = 5

  constructor(private http: HttpClient) {}

  validatePassword() {
    if (!this.password) {
      this.errorMessage = "Veuillez entrer un mot de passe"
      return
    }

    this.isSubmitting = true
    this.errorMessage = ""
    this.successMessage = ""

    this.http.get(`http://localhost:5200/api/admin/verify-admin-password?password=${this.password}`).subscribe({
      next: () => {
        this.successMessage = "Mot de passe validé"
        this.isSubmitting = false
        this.attempts = 0

        // Délai court pour montrer le message de succès avant de fermer
        setTimeout(() => {
          this.confirm.emit(this.password)
          this.resetForm()
        }, 800)
      },
      error: () => {
        this.attempts++
        this.isSubmitting = false

        if (this.attempts >= this.maxAttempts) {
          this.errorMessage = `Trop de tentatives échouées (${this.attempts}/${this.maxAttempts})`
          // Ici vous pourriez ajouter une logique de blocage temporaire
        } else {
          this.errorMessage = `Mot de passe incorrect (tentative ${this.attempts}/${this.maxAttempts})`
        }
      },
    })
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }

  cancel() {
    this.cancelModal.emit()
    this.resetForm()
  }

  resetForm() {
    this.password = ""
    this.errorMessage = ""
    this.successMessage = ""
    this.showPassword = false
    this.isSubmitting = false
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.cancel()
    }
  }
}
