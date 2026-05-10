import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../core/services/usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">

      <!-- CABECERA -->
      <div class="page-header">
        <h2 class="page-title">👥 Usuarios</h2>
        <button class="btn-primary" (click)="mostrarForm.set(!mostrarForm())">
          {{ mostrarForm() ? 'Cancelar' : '+ Nuevo Usuario' }}
        </button>
      </div>

      <!-- FORMULARIO NUEVO USUARIO -->
      @if (mostrarForm()) {
        <div class="card form-card">
          <h3 class="card-title">Nuevo Usuario</h3>

          @if (errorForm()) {
            <div class="alerta-error">{{ errorForm() }}</div>
          }
          @if (exitoForm()) {
            <div class="alerta-exito">{{ exitoForm() }}</div>
          }

          <div class="form-grid">
            <div class="field">
              <label>Nombre *</label>
              <input [(ngModel)]="form.nombre" placeholder="Nombre" />
            </div>
            <div class="field">
              <label>Apellidos *</label>
              <input [(ngModel)]="form.apellidos" placeholder="Apellidos" />
            </div>
            <div class="field">
              <label>Correo *</label>
              <input [(ngModel)]="form.email" type="email" placeholder="correo@ejemplo.com" />
            </div>
            <div class="field">
              <label>Contrasena *</label>
              <input [(ngModel)]="form.password" type="password" placeholder="Minimo 6 caracteres" />
            </div>
            <div class="field">
              <label>Rol *</label>
              <select [(ngModel)]="form.rol_id">
                <option value="">Seleccionar rol</option>
                @for (r of roles(); track r.id) {
                  <option [value]="r.id">{{ r.nombre }}</option>
                }
              </select>
            </div>
            <div class="field">
              <label>Area</label>
              <select [(ngModel)]="form.area_id">
                <option value="">Sin area</option>
                @for (a of areas(); track a.id) {
                  <option [value]="a.id">{{ a.nombre }}</option>
                }
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-primary" (click)="crearUsuario()" [disabled]="guardando()">
              {{ guardando() ? 'Guardando...' : 'Crear Usuario' }}
            </button>
          </div>
        </div>
      }

      <!-- TABLA DE USUARIOS -->
      <div class="card">
        @if (cargando()) {
          <div class="cargando">Cargando usuarios...</div>
        } @else {
          <table class="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Area</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (u of usuarios(); track u.id) {
                <tr>
                  <td>{{ u.nombre }}</td>
                  <td>{{ u.email }}</td>
                  <td>
                    <span class="badge-rol">{{ u.rol }}</span>
                  </td>
                  <td>{{ u.area ?? '—' }}</td>
                  <td>
                    @if (u.activo) {
                      <span class="badge-activo">Activo</span>
                    } @else {
                      <span class="badge-inactivo">Inactivo</span>
                    }
                  </td>
                  <td>
                    @if (u.activo) {
                      <button class="btn-desactivar" (click)="desactivar(u)">
                        Desactivar
                      </button>
                    } @else {
                      <button class="btn-activar" (click)="activar(u)">
                        Activar
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 20px; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .page-title { margin: 0; color: #6B0F1A; font-size: 20px; }

    .card {
      background: white;
      border-radius: 10px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    }
    .card-title {
      margin: 0 0 20px;
      color: #6B0F1A;
      font-size: 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid #F5E6E8;
    }

    .alerta-error {
      background: #FFEBEE;
      color: #C62828;
      border-left: 3px solid #C62828;
      padding: 10px 14px;
      border-radius: 4px;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .alerta-exito {
      background: #E8F5E9;
      color: #2E7D32;
      border-left: 3px solid #2E7D32;
      padding: 10px 14px;
      border-radius: 4px;
      font-size: 13px;
      margin-bottom: 16px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
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
    .field input, .field select {
      padding: 9px 12px;
      border: 1px solid #DDD;
      border-radius: 6px;
      font-size: 13px;
      outline: none;
      font-family: Arial;
    }
    .field input:focus, .field select:focus { border-color: #6B0F1A; }

    .form-actions {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }

    .btn-primary {
      background: #6B0F1A;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary:hover:not(:disabled) { background: #4A0A12; }
    .btn-primary:disabled { opacity: 0.6; cursor: default; }

    .cargando {
      text-align: center;
      padding: 40px;
      color: #888;
      font-size: 14px;
    }

    .tabla {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .tabla thead tr { background: #6B0F1A; }
    .tabla th {
      padding: 12px 14px;
      color: white;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
    }
    .tabla td {
      padding: 11px 14px;
      border-bottom: 1px solid #F0E8EA;
    }
    .tabla tbody tr:hover { background: #FDF5F6; }
    .tabla tbody tr:last-child td { border-bottom: none; }

    .badge-rol {
      background: #F5E6E8;
      color: #6B0F1A;
      padding: 3px 9px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-activo {
      background: #E8F5E9;
      color: #2E7D32;
      padding: 3px 9px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
    }
    .badge-inactivo {
      background: #FFEBEE;
      color: #C62828;
      padding: 3px 9px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
    }

    .btn-activar {
      background: #E8F5E9;
      color: #2E7D32;
      border: 1px solid #2E7D32;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 600;
    }
    .btn-desactivar {
      background: #FFEBEE;
      color: #C62828;
      border: 1px solid #C62828;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 600;
    }
  `]
})
export class UsuariosComponent implements OnInit {
  private svc = inject(UsuariosService);

  usuarios   = signal<any[]>([]);
  roles      = signal<any[]>([]);
  areas      = signal<any[]>([]);
  cargando   = signal(true);
  guardando  = signal(false);
  mostrarForm = signal(false);
  errorForm  = signal('');
  exitoForm  = signal('');

  form = {
    nombre: '', apellidos: '', email: '',
    password: '', rol_id: '', area_id: ''
  };

  ngOnInit() {
    this.cargarUsuarios();
    this.svc.roles().subscribe({ next: r => this.roles.set(r) });
    this.svc.areas().subscribe({ next: a => this.areas.set(a) });
  }

  cargarUsuarios() {
    this.cargando.set(true);
    this.svc.listar().subscribe({
      next:  u => { this.usuarios.set(u); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  crearUsuario() {
    this.errorForm.set('');
    this.exitoForm.set('');

    if (!this.form.nombre || !this.form.apellidos ||
        !this.form.email   || !this.form.password || !this.form.rol_id) {
      this.errorForm.set('Completa todos los campos obligatorios');
      return;
    }

    this.guardando.set(true);
    this.svc.crear(this.form).subscribe({
      next: () => {
        this.guardando.set(false);
        this.exitoForm.set('Usuario creado correctamente');
        this.form = { nombre:'', apellidos:'', email:'', password:'', rol_id:'', area_id:'' };
        this.cargarUsuarios();
        setTimeout(() => {
          this.exitoForm.set('');
          this.mostrarForm.set(false);
        }, 2000);
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorForm.set(err.error?.error ?? 'Error al crear usuario');
      }
    });
  }

  activar(u: any) {
    this.svc.activar(u.id).subscribe({
      next: () => this.cargarUsuarios()
    });
  }

  desactivar(u: any) {
    if (!confirm('Desactivar a ' + u.nombre + '?')) return;
    this.svc.desactivar(u.id).subscribe({
      next: () => this.cargarUsuarios()
    });
  }
}
