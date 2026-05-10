import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BienesService } from '../../core/services/bienes.service';
import { UsuariosService } from '../../core/services/usuarios.service';

@Component({
  selector: 'app-bienes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">

      <!-- CABECERA -->
      <div class="page-header">
        <h2 class="page-title">🏛 Bienes Muebles</h2>
        <button class="btn-primary" (click)="toggleForm()">
          {{ mostrarForm() ? 'Cancelar' : '+ Nuevo Bien' }}
        </button>
      </div>

      <!-- FILTROS -->
      <div class="card filtros">
        <input [(ngModel)]="filtros.q"
               (ngModelChange)="buscar()"
               placeholder="Buscar por descripcion o num. inventario..."
               class="input-buscar" />

        <select [(ngModel)]="filtros.estado" (ngModelChange)="buscar()">
          <option value="">Todos los estados</option>
          <option value="bueno">Bueno</option>
          <option value="regular">Regular</option>
          <option value="malo">Malo</option>
        </select>

        <select [(ngModel)]="filtros.area_id" (ngModelChange)="buscar()">
          <option value="">Todas las areas</option>
          @for (a of areas(); track a.id) {
            <option [value]="a.id">{{ a.nombre }}</option>
          }
        </select>
      </div>

      <!-- FORMULARIO -->
      @if (mostrarForm()) {
        <div class="card form-card">
          <h3 class="card-title">
            {{ bienEditando() ? 'Editar Bien' : 'Nuevo Bien' }}
          </h3>

          @if (errorForm()) {
            <div class="alerta-error">{{ errorForm() }}</div>
          }

          <div class="form-grid">
            <div class="field">
              <label>Num. Inventario *</label>
              <input [(ngModel)]="form.numero_inventario"
                     placeholder="Ej. INV-2024-001"
                     [disabled]="bienEditando() !== null" />
            </div>
            <div class="field">
              <label>Estado</label>
              <select [(ngModel)]="form.estado">
                <option value="bueno">Bueno</option>
                <option value="regular">Regular</option>
                <option value="malo">Malo</option>
              </select>
            </div>
            <div class="field campo-ancho">
              <label>Descripcion *</label>
              <input [(ngModel)]="form.descripcion" placeholder="Descripcion del bien" />
            </div>
            <div class="field">
              <label>Marca</label>
              <input [(ngModel)]="form.marca" placeholder="Ej. Dell" />
            </div>
            <div class="field">
              <label>Modelo</label>
              <input [(ngModel)]="form.modelo" placeholder="Ej. Latitude 5420" />
            </div>
            <div class="field">
              <label>Numero de Serie</label>
              <input [(ngModel)]="form.numero_serie" placeholder="Num. serie" />
            </div>
            <div class="field">
              <label>Valor Adquisicion</label>
              <input [(ngModel)]="form.valor_adquisicion" type="number" placeholder="0.00" />
            </div>
            <div class="field">
              <label>Fecha Adquisicion</label>
              <input [(ngModel)]="form.fecha_adquisicion" type="date" />
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
            <button class="btn-secondary" (click)="toggleForm()">Cancelar</button>
            <button class="btn-primary" (click)="guardar()" [disabled]="guardando()">
              {{ guardando() ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      }

      <!-- DETALLE DEL BIEN -->
      @if (bienDetalle()) {
        <div class="card detalle-card">
          <div class="detalle-header">
            <h3 class="card-title">
              Detalle — {{ bienDetalle().numero_inventario }}
            </h3>
            <button class="btn-cerrar" (click)="bienDetalle.set(null)">✕</button>
          </div>
          <div class="detalle-grid">
            <div><strong>Descripcion:</strong> {{ bienDetalle().descripcion }}</div>
            <div><strong>Marca/Modelo:</strong> {{ bienDetalle().marca }} {{ bienDetalle().modelo }}</div>
            <div><strong>Serie:</strong> {{ bienDetalle().numero_serie ?? '—' }}</div>
            <div><strong>Estado:</strong>
              <span class="badge-estado" [class]="'estado-' + bienDetalle().estado">
                {{ bienDetalle().estado }}
              </span>
            </div>
            <div><strong>Area:</strong> {{ bienDetalle().area ?? '—' }}</div>
            <div><strong>Responsable:</strong> {{ bienDetalle().responsable ?? '—' }}</div>
            <div><strong>Valor:</strong> \${{ bienDetalle().valor_adquisicion ?? '—' }}</div>
            <div><strong>Alta:</strong> {{ bienDetalle().created_at | date:'dd/MM/yyyy' }}</div>
          </div>

          @if (bienDetalle().movimientos?.length > 0) {
            <h4 style="margin: 16px 0 10px; color: #6B0F1A;">Historial de movimientos</h4>
            <table class="tabla-mov">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descripcion</th>
                  <th>Usuario</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                @for (m of bienDetalle().movimientos; track m.id) {
                  <tr>
                    <td><span class="badge-tipo">{{ m.tipo }}</span></td>
                    <td>{{ m.descripcion }}</td>
                    <td>{{ m.usuario }}</td>
                    <td>{{ m.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      }

      <!-- TABLA DE BIENES -->
      <div class="card">
        @if (cargando()) {
          <div class="cargando">Cargando bienes...</div>
        } @else if (bienes().length === 0) {
          <div class="vacio">No se encontraron bienes.</div>
        } @else {
          <table class="tabla">
            <thead>
              <tr>
                <th>Num. Inventario</th>
                <th>Descripcion</th>
                <th>Marca</th>
                <th>Estado</th>
                <th>Area</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (b of bienes(); track b.id) {
                <tr>
                  <td><strong>{{ b.numero_inventario }}</strong></td>
                  <td>{{ b.descripcion }}</td>
                  <td>{{ b.marca ?? '—' }}</td>
                  <td>
                    <span class="badge-estado" [class]="'estado-' + b.estado">
                      {{ b.estado }}
                    </span>
                  </td>
                  <td>{{ b.area ?? '—' }}</td>
                  <td>
                    <div class="acciones">
                      <button class="btn-ver"    (click)="verDetalle(b.id)">Ver</button>
                      <button class="btn-editar" (click)="editar(b)">Editar</button>
                      <button class="btn-baja"   (click)="darBaja(b)">Baja</button>
                    </div>
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
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    }
    .card-title {
      margin: 0 0 16px;
      color: #6B0F1A;
      font-size: 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid #F5E6E8;
    }

    .filtros {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      padding: 14px 20px;
    }
    .input-buscar {
      flex: 1;
      min-width: 200px;
      padding: 8px 12px;
      border: 1px solid #DDD;
      border-radius: 6px;
      font-size: 13px;
      outline: none;
    }
    .input-buscar:focus { border-color: #6B0F1A; }
    .filtros select {
      padding: 8px 12px;
      border: 1px solid #DDD;
      border-radius: 6px;
      font-size: 13px;
      outline: none;
      background: white;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .campo-ancho { grid-column: 1 / -1; }
    .field { display: flex; flex-direction: column; gap: 5px; }
    .field label { font-size: 12px; font-weight: 700; color: #555; }
    .field input, .field select {
      padding: 9px 12px;
      border: 1px solid #DDD;
      border-radius: 6px;
      font-size: 13px;
      outline: none;
      font-family: Arial;
    }
    .field input:focus, .field select:focus { border-color: #6B0F1A; }
    .field input:disabled { background: #F5F5F5; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
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

    .btn-primary {
      background: #6B0F1A;
      color: white;
      border: none;
      padding: 9px 18px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary:hover:not(:disabled) { background: #4A0A12; }
    .btn-primary:disabled { opacity: 0.6; cursor: default; }

    .btn-secondary {
      background: white;
      color: #6B0F1A;
      border: 1px solid #D4A0A7;
      padding: 9px 18px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-secondary:hover { background: #F5E6E8; }

    .detalle-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .btn-cerrar {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #888;
      padding: 0 4px;
    }
    .detalle-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      font-size: 13px;
      margin-bottom: 8px;
    }

    .tabla-mov {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .tabla-mov th {
      background: #F5E6E8;
      color: #6B0F1A;
      padding: 8px 12px;
      text-align: left;
      font-size: 11px;
    }
    .tabla-mov td {
      padding: 8px 12px;
      border-bottom: 1px solid #F5F0F0;
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

    .badge-estado {
      padding: 3px 9px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
      text-transform: capitalize;
    }
    .estado-bueno   { background: #E8F5E9; color: #2E7D32; }
    .estado-regular { background: #FFF8E1; color: #F57F17; }
    .estado-malo    { background: #FFEBEE; color: #C62828; }
    .estado-baja    { background: #ECEFF1; color: #546E7A; }

    .badge-tipo {
      background: #F5E6E8;
      color: #6B0F1A;
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
    }

    .acciones { display: flex; gap: 6px; }
    .btn-ver    { background: #E3F2FD; color: #1565C0; border: 1px solid #1565C0; padding: 4px 10px; border-radius: 5px; font-size: 12px; cursor: pointer; }
    .btn-editar { background: #FFF8E1; color: #F57F17; border: 1px solid #F57F17; padding: 4px 10px; border-radius: 5px; font-size: 12px; cursor: pointer; }
    .btn-baja   { background: #FFEBEE; color: #C62828; border: 1px solid #C62828; padding: 4px 10px; border-radius: 5px; font-size: 12px; cursor: pointer; }

    .cargando, .vacio {
      text-align: center;
      padding: 40px;
      color: #888;
      font-size: 14px;
    }
  `]
})
export class BienesComponent implements OnInit {
  private svc     = inject(BienesService);
  private usuSvc  = inject(UsuariosService);

  bienes      = signal<any[]>([]);
  areas       = signal<any[]>([]);
  cargando    = signal(true);
  guardando   = signal(false);
  mostrarForm = signal(false);
  errorForm   = signal('');
  bienEditando = signal<any>(null);
  bienDetalle  = signal<any>(null);

  filtros = { q: '', estado: '', area_id: '' };
  private _timer: any;

  form = this.formVacio();

  formVacio() {
    return {
      numero_inventario: '', descripcion: '', marca: '',
      modelo: '', numero_serie: '', valor_adquisicion: '',
      fecha_adquisicion: '', estado: 'bueno', area_id: ''
    };
  }

  ngOnInit() {
    this.cargarBienes();
    this.usuSvc.areas().subscribe({ next: a => this.areas.set(a) });
  }

  cargarBienes() {
    this.cargando.set(true);
    this.svc.listar(this.filtros).subscribe({
      next:  b => { this.bienes.set(b); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  buscar() {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.cargarBienes(), 400);
  }

  toggleForm() {
    this.mostrarForm.update(v => !v);
    if (!this.mostrarForm()) {
      this.bienEditando.set(null);
      this.form = this.formVacio();
      this.errorForm.set('');
    }
  }

  editar(b: any) {
    this.bienEditando.set(b);
    this.form = {
      numero_inventario: b.numero_inventario,
      descripcion:       b.descripcion,
      marca:             b.marca ?? '',
      modelo:            b.modelo ?? '',
      numero_serie:      b.numero_serie ?? '',
      valor_adquisicion: b.valor_adquisicion ?? '',
      fecha_adquisicion: b.fecha_adquisicion ?? '',
      estado:            b.estado,
      area_id:           b.area_id ?? ''
    };
    this.mostrarForm.set(true);
    this.errorForm.set('');
  }

  guardar() {
    this.errorForm.set('');
    if (!this.form.numero_inventario || !this.form.descripcion) {
      this.errorForm.set('Numero de inventario y descripcion son requeridos');
      return;
    }
    this.guardando.set(true);

    const op = this.bienEditando()
      ? this.svc.actualizar(this.bienEditando().id, this.form)
      : this.svc.crear(this.form);

    op.subscribe({
      next: () => {
        this.guardando.set(false);
        this.toggleForm();
        this.cargarBienes();
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorForm.set(err.error?.error ?? 'Error al guardar');
      }
    });
  }

  verDetalle(id: number) {
    this.svc.obtener(id).subscribe({
      next: b => this.bienDetalle.set(b)
    });
  }

  darBaja(b: any) {
    const motivo = prompt('Motivo de la baja:');
    if (!motivo) return;
    this.svc.darBaja(b.id, motivo).subscribe({
      next: () => this.cargarBienes()
    });
  }
}
