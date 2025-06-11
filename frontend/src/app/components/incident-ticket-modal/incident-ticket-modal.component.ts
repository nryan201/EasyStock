import { Component, EventEmitter, Input, Output, ViewChild, type ElementRef, type AfterViewInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

@Component({
  selector: "app-incident-ticket-modal",
  standalone: true,
  templateUrl: "./incident-ticket-modal.component.html",
  styleUrls: ["./incident-ticket-modal.component.scss"],
  imports: [CommonModule, FormsModule],
})
export class IncidentTicketModalComponent implements AfterViewInit {
  @Input() visible = false
  @Output() submitTicket = new EventEmitter<any>()
  @Output() close = new EventEmitter<void>()
  @ViewChild("emailInput") emailInput!: ElementRef
  @Input() senderEmail = ""

  problemType = ""
  priority = ""
  message = ""
  isSubmitting = false

  problemTypes: string[] = [
    "🔐 Connexion impossible",
    "🖥️ Problème d'affichage",
    "🗑️ Erreur lors de la suppression",
    "📊 Problème avec les données",
    "⚡ Performance lente",
    "🔄 Synchronisation échouée",
    "🛠️ Autre problème technique",
  ]

  // Informations système
  get browserInfo(): string {
    return navigator.userAgent.split(" ").slice(-2).join(" ")
  }

  get currentDate(): Date {
    return new Date()
  }

  get currentUser(): string {
    return localStorage.getItem("username") || "Utilisateur anonyme"
  }

  ngAfterViewInit() {
    if (this.visible && this.emailInput) {
      setTimeout(() => {
        this.emailInput.nativeElement.focus()
      }, 100)
    }
  }

  onSubmit() {
    if (this.isFormValid() && !this.isSubmitting) {
      this.isSubmitting = true

      const ticketData = {
        sender: this.senderEmail.trim(),
        problemType: this.problemType,
        priority: this.priority,
        message: this.message.trim(),
        systemInfo: {
          browser: this.browserInfo,
          date: this.currentDate,
          user: this.currentUser,
        },
        timestamp: new Date().toISOString(),
      }

      // Simuler un délai d'envoi
      setTimeout(() => {
        this.submitTicket.emit(ticketData)
        this.isSubmitting = false
        this.resetForm()
      }, 1000)
    }
  }

  onCancel() {
    this.close.emit()
    this.resetForm()
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onCancel()
    }
  }

  private resetForm() {
    this.senderEmail = ""
    this.problemType = ""
    this.message = ""
    this.isSubmitting = false
  }

  isFormValid(): boolean {
    return (
      this.senderEmail.trim() !== "" &&
      this.problemType !== "" &&
      this.message.trim() !== "" &&
      this.message.length <= 500
    )
  }
}
