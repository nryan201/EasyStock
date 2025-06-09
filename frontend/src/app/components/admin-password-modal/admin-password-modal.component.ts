import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface PasswordCriteria {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

interface PasswordStrength {
  level: 'weak' | 'fair' | 'good' | 'strong';
  percentage: number;
  text: string;
}

@Component({
  selector: 'app-admin-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-password-modal.component.html',
  styleUrls: ['./admin-password-modal.component.scss']
})
export class AdminPasswordModalComponent {
  @Input() visible: boolean = false;
  @Output() save = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  password = '';
  verificationCode = '';
  showPassword = false;
  passwordHistory: string[] = [];
  showStrengthDetails = false;
  codeSent = false;
  codeValidated = false;
  codeInvalid = true;

  constructor(private http: HttpClient) {}

  emitSave() {
    if (this.codeValidated) {
      this.save.emit(this.password);
    } else {
      alert('Veuillez d’abord valider le code reçu par email.');
    }
  }

  emitClose() {
    this.close.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.emitClose();
    }
  }

  isPasswordValid(): boolean {
    return Object.values(this.criteria).every(Boolean);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  get passwordStrength(): PasswordStrength {
    const criteriaCount = Object.values(this.criteria).filter(Boolean).length;

    if (criteriaCount <= 1) {
      return { level: 'weak', percentage: 25, text: 'Très faible' };
    } else if (criteriaCount <= 2) {
      return { level: 'weak', percentage: 40, text: 'Faible' };
    } else if (criteriaCount <= 3) {
      return { level: 'fair', percentage: 60, text: 'Moyen' };
    } else if (criteriaCount <= 4) {
      return { level: 'good', percentage: 80, text: 'Bon' };
    } else {
      return { level: 'strong', percentage: 100, text: 'Très fort' };
    }
  }

  get criteria(): PasswordCriteria {
    return {
      length: this.password.length >= 8,
      uppercase: /[A-Z]/.test(this.password),
      lowercase: /[a-z]/.test(this.password),
      number: /\d/.test(this.password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(this.password)
    };
  }

  onPasswordChange() {
    this.validatePasswordSecurity();
    this.checkPasswordHistory();
    this.detectUnsafePatterns();
    this.showStrengthDetails = this.password.length > 0;
  }

  private validatePasswordSecurity() {
    const commonPasswords = [
      'password',
      '123456',
      'admin',
      'qwerty',
      'letmein',
      'welcome',
      'monkey',
      '1234567890',
      'password123'
    ];

    if (commonPasswords.includes(this.password.toLowerCase())) {
      console.warn('Mot de passe trop commun détecté');
    }
  }

  private checkPasswordHistory() {
    if (this.passwordHistory.includes(this.password)) {
      console.warn('Ce mot de passe a déjà été utilisé');
    }
  }

  private detectUnsafePatterns() {
    const unsafePatterns = [
      /(.{1})\1{3,}/,
      /123456|654321/,
      /abcdef|qwerty/
    ];

    const hasUnsafePattern = unsafePatterns.some((pattern) =>
      pattern.test(this.password.toLowerCase())
    );

    if (hasUnsafePattern) {
      console.warn('Pattern dangereux détecté dans le mot de passe');
    }
  }

  generateSecurePassword() {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';

    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    this.password = password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
    this.onPasswordChange();
  }

  sendCodeToAdmin() {
    const adminEmail = sessionStorage.getItem('email');

    const payload = {to: adminEmail};
    console.log('📤 Envoi du code à l’adresse suivante :', payload);

    this.http.post('http://localhost:5200/api/admin/send-verification-code',
      payload,
      {headers: {'Content-Type': 'application/json'}}
    ).subscribe({
      next: (res) => {
        console.log('✅ Réponse serveur :', res);
        alert('Code envoyé par mail !');
        this.codeSent = true;
      },
      error: (err) => console.error("❌ Erreur d'envoi du code", err)
    });
  }



  verifyCode() {
    const adminEmail = sessionStorage.getItem('email');

    this.http.post('http://localhost:5200/api/admin/verify-code', {
      email: adminEmail,
      code: this.verificationCode
    }).subscribe({
      next: () => {
        this.codeValidated = true;
        this.codeInvalid = false;
      },
      error: () => {
        this.codeValidated = false;
        this.codeInvalid = true;
      }
    });
  }


}
