import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">

        <div class="login-brand">
          <span class="login-icon">⚙</span>
          <h1>Sistema Institucional</h1>
          <p>Gestion Administrativa</p>
        </div>

        @if (error()) {
          <div class="login-error">{{ error() }}</div>
        }

        <div class="login-form">
          <div class="field">
            <label>Correo</label>
            <input type="email" [(ngModel)]="email"
                   placeholder="usuario@sistema.com" />
          </div>
          <div class="field">
            <label>Contrasena</label>
            <input type="password" [(ngModel)]="password"
                   placeholder="••••••••"
                   (keyup.enter)="onLogin()" />
          </div>
          <button class="btn-login" (click)="onLogin()" [disabled]="cargando()">
            {{ cargando() ? 'Ingresando...' : 'Iniciar Sesion' }}
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #4A0A12 0%, #6B0F1A 100%);
    }
    .login-card {
      background: white;
      border-radius: 12px;
      padding: 40px 36px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }
    .login-brand {
      text-align: center;
      margin-bottom: 28px;
    }
    .login-icon {
      font-size: 40px;
      display: block;
      margin-bottom: 8px;
    }
    .login-brand h1 {
      margin: 0 0 4px;
      font-size: 20px;
      color: #6B0F1A;
    }
    .login-brand p {
      margin: 0;
      font-size: 13px;
      color: #888;
    }
    .login-error {
      background: #FFEBEE;
      color: #C62828;
      border-left: 3px solid #C62828;
      padding: 10px 14px;
      border-radius: 4px;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .field label {
      font-size: 12px;
      font-weight: 700;
      color: #555;
    }
    .field input {
      padding: 10px 12px;
      border: 1px solid #DDD;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
    }
    .field input:focus {
      border-color: #6B0F1A;
    }
    .btn-login {
      background: #6B0F1A;
      color: white;
      border: none;
      padding: 12px;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 4px;
    }
    .btn-login:hover:not(:disabled) {
      background: #4A0A12;
    }
    .btn-login:disabled {
      opacity: 0.6;
      cursor: default;
    }
  `]
})
export class LoginComponent {
  email    = '';
  password = '';
  error    = signal('');
  cargando = signal(false);

  private auth   = inject(AuthService);
  private router = inject(Router);

  onLogin() {
    if (!this.email || !this.password) {
      this.error.set('Ingresa tu correo y contrasena');
      return;
    }
    this.error.set('');
    this.cargando.set(true);

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.error?.error ?? 'Error al iniciar sesion');
      }
    });
  }
}
