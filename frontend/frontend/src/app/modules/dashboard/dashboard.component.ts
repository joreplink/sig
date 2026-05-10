import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div>
      <h2 style="color:#6B0F1A; margin-bottom:20px">
        Bienvenido, {{ auth.usuario()?.nombre }}
      </h2>

      <div style="display:grid; grid-template-columns: repeat(3,1fr); gap:16px">

        <div class="card">
          <div class="card-icon">🏛</div>
          <div class="card-label">Bienes Muebles</div>
          <div class="card-val">—</div>
        </div>

        <div class="card">
          <div class="card-icon">📋</div>
          <div class="card-label">Requisiciones</div>
          <div class="card-val">—</div>
        </div>

        <div class="card">
          <div class="card-icon">📦</div>
          <div class="card-label">Productos en Almacen</div>
          <div class="card-val">—</div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border-radius: 10px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      border-left: 4px solid #6B0F1A;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .card-icon  { font-size: 28px; }
    .card-label { font-size: 13px; color: #888; }
    .card-val   { font-size: 28px; font-weight: 800; color: #2C2C2C; }
  `]
})
export class DashboardComponent {
  auth = inject(AuthService);
}
