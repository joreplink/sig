import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequisicionesService } from '../../core/services/requisiciones.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-requisiciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">

      <!-- CABECERA -->
      <div class="page-header">
        <h2 class="page-title">📋 Requisiciones</h2>
        <button class="btn-primary" (click)="toggleForm()">
          {{ mostrarForm() ? 'Cancelar' : '+ Nueva Requisicion' }}
        </button>
      </div>

      <!-- FILTRO POR ESTATUS -->
      <div class="card filtros">
        <span class="filtro-label">Filtrar por estatus:</span>
        @for (e of estatusOpciones; track e.valor) {
          <button class="btn-estatus"
                  [class.activo]="filtroEstatus() === e.valor"
                  (click)="filtrarPor(e.valor)">
            {{ e.etiqueta }}
          </button>
        }
      </div>

      <!-- FORMULARIO NUEVA REQUISICION -->
      @if (mostrarForm()) {
        <div class="card form-card">
          <h3 class="card-title">Nueva Requisicion</h3>

          @if (errorForm()) {
            <div class="alerta-error">{{ errorForm() }}</div>
          }

          <!-- Datos generales -->
          <div class="form-grid">
            <div class="field campo-ancho">
              <label>Titulo *</label>
              <input [(ngModel)]="form.titulo" placeholder="Ej. Adquisicion de papeleria" />
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
            <div class="field">
              <label>Periodo</label>
              <input [(ngModel)]="form.periodo" type="month" />
            </div>
            <div class="field campo-ancho">
              <label>Descripcion</label>
              <textarea [(ngModel)]="form.descripcion" rows="2"
                        placeholder="Descripcion o justificacion..."></textarea>
            </div>
          </div>

          <!-- Partidas -->
          <div class="partidas-header">
            <h4 class="partidas-titulo">Conceptos / Partidas</h4>
            <button class="btn-agregar" (click)="agregarPartida()">+ Agregar concepto</button>
          </div>

          @for (p of form.partidas; track $index) {
            <div class="partida-row">
              <div class="field" style="flex:3">
                <label>Concepto *</label>
                <input [(ngModel)]="p.concepto" placeholder="Descripcion del concepto" />
              </div>
              <div class="field" style="flex:1">
                <label>Cantidad</label>
                <input [(ngModel)]="p.cantidad" type="number" min="1"
                       (ngModelChange)="calcularSubtotal(p)" />
              </div>
              <div class="field" style="flex:1">
                <label>Unidad</label>
                <input [(ngModel)]="p.unidad" placeholder="pieza" />
              </div>
              <div class="field" style="flex:1">
                <label>Precio Unit.</label>
                <input [(ngModel)]="p.precio_unitario" type="number" min="0"
                       (ngModelChange)="calcularSubtotal(p)" />
              </div>
              <div class="field" style="flex:1">
                <label>Subtotal</label>
                <input [value]="p.subtotal | number:'1.2-2'" readonly class="input-readonly" />
              </div>
              <button class="btn-quitar" (click)="quitarPartida($index)"
                      [disabled]="form.partidas.length === 1">✕</button>
            </div>
          }

          <div class="total-row">
            <span>TOTAL:</span>
            <strong>\${{ totalGeneral() | number:'1.2-2' }}</strong>
          </div>

          <div class="form-actions">
            <button class="btn-secondary" (click)="toggleForm()">Cancelar</button>
            <button class="btn-primary" (click)="guardar()" [disabled]="guardando()">
              {{ guardando() ? 'Guardando...' : 'Crear Requisicion' }}
            </button>
          </div>
        </div>
      }

      <!-- DETALLE -->
      @if (detalle()) {
        <div class="card detalle-card">
          <div class="detalle-header">
            <div>
              <h3 class="card-title" style="margin-bottom:4px">
                {{ detalle().folio }} — {{ detalle().titulo }}
              </h3>
              <span class="badge-estatus" [class]="'estatus-' + detalle().estatus">
                {{ detalle().estatus }}
              </span>
            </div>
            <button class="btn-cerrar" (click)="detalle.set(null)">✕</button>
          </div>

          <!-- Info general -->
          <div class="detalle-info">
            <div><strong>Solicitante:</strong> {{ detalle().solicitante }}</div>
            <div><strong>Area:</strong> {{ detalle().area ?? '—' }}</div>
            <div><strong>Periodo:</strong> {{ detalle().periodo ?? '—' }}</div>
            <div><strong>Total:</strong> \${{ detalle().total }}</div>
          </div>

          <!-- Partidas -->
          @if (detalle().partidas?.length > 0) {
            <h4 class="subtitulo">Conceptos</h4>
            <table class="tabla-sm">
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Cantidad</th>
                  <th>Unidad</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                @for (p of detalle().partidas; track p.id) {
                  <tr>
                    <td>{{ p.concepto }}</td>
                    <td>{{ p.cantidad }}</td>
                    <td>{{ p.unidad }}</td>
                    <td>\${{ p.precio_unitario }}</td>
                    <td><strong>\${{ p.subtotal }}</strong></td>
                  </tr>
                }
              </tbody>
            </table>
          }

          <!-- Cambiar estatus -->
          @if (puedeGestionar()) {
            <h4 class="subtitulo">Cambiar Estatus</h4>
            <div class="cambio-estatus">
              <select [(ngModel)]="nuevoEstatus">
                <option value="">Seleccionar estatus</option>
                @for (e of estatusCambio; track e) {
                  <option [value]="e">{{ e }}</option>
                }
              </select>
              <input [(ngModel)]="observaciones" placeholder="Observaciones (opcional)" />
              <button class="btn-primary" (click)="cambiarEstatus()"
                      [disabled]="!nuevoEstatus">
                Aplicar
              </button>
            </div>
          }

          <!-- Historial -->
          @if (detalle().historial?.length > 0) {
            <h4 class="subtitulo">Historial</h4>
            <div class="historial">
              @for (h of detalle().historial; track h.id) {
                <div class="historial-item">
                  <span class="badge-estatus" [class]="'estatus-' + h.estatus">
                    {{ h.estatus }}
                  </span>
                  <span class="hist-obs">{{ h.observaciones }}</span>
                  <span class="hist-fecha">
                    {{ h.created_at | date:'dd/MM/yyyy HH:mm' }}
                  </span>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- TABLA -->
      <div class="card">
        @if (cargando()) {
          <div class="cargando">Cargando requisiciones...</div>
        } @else if (requisiciones().length === 0) {
          <div class="vacio">No se encontraron requisiciones.</div>
        } @else {
          <table class="tabla">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Titulo</th>
                <th>Solicitante</th>
                <th>Area</th>
                <th>Total</th>
                <th>Estatus</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (r of requisiciones(); track r.id) {
                <tr>
                  <td><strong>{{ r.folio }}</strong></td>
                  <td>{{ r.titulo }}</td>
                  <td>{{ r.solicitante }}</td>
                  <td>{{ r.area ?? '—' }}</td>
                  <td>\${{ r.total }}</td>
                  <td>
                    <span class="badge-estatus" [class]="'estatus-' + r.estatus">
                      {{ r.estatus }}
                    </span>
                  </td>
                  <td>{{ r.created_at | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <button class="btn-ver" (click)="verDetalle(r.id)">Ver</button>
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
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      padding: 12px 20px;
    }
    .filtro-label { font-size: 13px; color: #666; font-weight: 600; }
    .btn-estatus {
      padding: 5px 14px;
      border-radius: 16px;
      border: 1px solid #DDD;
      background: white;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-estatus:hover { border-color: #6B0F1A; color: #6B0F1A; }
    .btn-estatus.activo { background: #6B0F1A; color: white; border-color: #6B0F1A; }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 20px;
    }
    .campo-ancho { grid-column: 1 / -1; }
    .field { display: flex; flex-direction: column; gap: 5px; }
    .field label { font-size: 12px; font-weight: 700; color: #555; }
    .field input, .field select, .field textarea {
      padding: 9px 12px;
      border: 1px solid #DDD;
      border-radius: 6px;
      font-size: 13px;
      outline: none;
      font-family: Arial;
    }
    .field input:focus, .field select:focus,
    .field textarea:focus { border-color: #6B0F1A; }
    .input-readonly { background: #F5F5F5; font-weight: 700; }

    .partidas-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .partidas-titulo { margin: 0; color: #6B0F1A; font-size: 14px; }
    .btn-agregar {
      background: #E3F2FD;
      color: #1565C0;
      border: 1px solid #1565C0;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 600;
    }

    .partida-row {
      display: flex;
      gap: 10px;
      align-items: flex-end;
      margin-bottom: 10px;
      padding: 12px;
      background: #FDF5F6;
      border-radius: 8px;
    }
    .btn-quitar {
      background: #FFEBEE;
      color: #C62828;
      border: 1px solid #C62828;
      padding: 8px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      margin-bottom: 0;
      align-self: flex-end;
    }
    .btn-quitar:disabled { opacity: 0.3; cursor: default; }

    .total-row {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #6B0F1A;
      border-radius: 8px;
      color: white;
      margin: 12px 0;
      font-size: 15px;
    }
    .total-row strong { font-size: 20px; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
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

    .detalle-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .btn-cerrar {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #888;
    }
    .detalle-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .subtitulo {
      margin: 16px 0 10px;
      color: #6B0F1A;
      font-size: 14px;
    }

    .tabla-sm {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 16px;
    }
    .tabla-sm th {
      background: #F5E6E8;
      color: #6B0F1A;
      padding: 8px 12px;
      text-align: left;
      font-size: 11px;
    }
    .tabla-sm td { padding: 8px 12px; border-bottom: 1px solid #F5F0F0; }

    .cambio-estatus {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    .cambio-estatus select, .cambio-estatus input {
      padding: 8px 12px;
      border: 1px solid #DDD;
      border-radius: 6px;
      font-size: 13px;
      outline: none;
      font-family: Arial;
    }
    .cambio-estatus input { flex: 1; min-width: 200px; }

    .historial { display: flex; flex-direction: column; gap: 8px; }
    .historial-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
    }
    .hist-obs   { flex: 1; color: #555; }
    .hist-fecha { color: #888; white-space: nowrap; }

    .badge-estatus {
      padding: 3px 10px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
      text-transform: capitalize;
      white-space: nowrap;
    }
    .estatus-borrador    { background: #ECEFF1; color: #546E7A; }
    .estatus-pendiente   { background: #FFF8E1; color: #F57F17; }
    .estatus-en_revision { background: #E3F2FD; color: #1565C0; }
    .estatus-aprobada    { background: #E8F5E9; color: #2E7D32; }
    .estatus-rechazada   { background: #FFEBEE; color: #C62828; }
    .estatus-completada  { background: #E0F2F1; color: #00695C; }
    .estatus-cancelada   { background: #F5F5F5; color: #888; }

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

    .btn-ver {
      background: #E3F2FD;
      color: #1565C0;
      border: 1px solid #1565C0;
      padding: 4px 12px;
      border-radius: 5px;
      font-size: 12px;
      cursor: pointer;
    }

    .cargando, .vacio {
      text-align: center;
      padding: 40px;
      color: #888;
      font-size: 14px;
    }
  `]
})
export class RequisicionesComponent implements OnInit {
  private svc    = inject(RequisicionesService);
  private usuSvc = inject(UsuariosService);
  private auth   = inject(AuthService);

  requisiciones = signal<any[]>([]);
  areas         = signal<any[]>([]);
  cargando      = signal(true);
  guardando     = signal(false);
  mostrarForm   = signal(false);
  errorForm     = signal('');
  detalle       = signal<any>(null);
  filtroEstatus = signal('');

  nuevoEstatus  = '';
  observaciones = '';

  estatusOpciones = [
    { valor: '',           etiqueta: 'Todos'       },
    { valor: 'borrador',   etiqueta: 'Borrador'    },
    { valor: 'pendiente',  etiqueta: 'Pendiente'   },
    { valor: 'en_revision',etiqueta: 'En revision' },
    { valor: 'aprobada',   etiqueta: 'Aprobada'    },
    { valor: 'rechazada',  etiqueta: 'Rechazada'   },
    { valor: 'completada', etiqueta: 'Completada'  },
  ];

  estatusCambio = [
    'pendiente','en_revision','aprobada','rechazada','completada','cancelada'
  ];

  form = this.formVacio();

  formVacio() {
    return {
      titulo: '', descripcion: '', area_id: '', periodo: '',
      partidas: [this.partidaVacia()]
    };
  }

  partidaVacia() {
    return { concepto: '', cantidad: 1, unidad: 'pieza', precio_unitario: 0, subtotal: 0 };
  }

  ngOnInit() {
    this.cargar();
    this.usuSvc.areas().subscribe({ next: a => this.areas.set(a) });
  }

  cargar() {
    this.cargando.set(true);
    const filtros = this.filtroEstatus() ? { estatus: this.filtroEstatus() } : {};
    this.svc.listar(filtros).subscribe({
      next:  r => { this.requisiciones.set(r); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  filtrarPor(estatus: string) {
    this.filtroEstatus.set(estatus);
    this.cargar();
  }

  toggleForm() {
    this.mostrarForm.update(v => !v);
    if (!this.mostrarForm()) {
      this.form = this.formVacio();
      this.errorForm.set('');
    }
  }

  agregarPartida()         { this.form.partidas.push(this.partidaVacia()); }
  quitarPartida(i: number) { this.form.partidas.splice(i, 1); }

  calcularSubtotal(p: any) {
    p.subtotal = (parseFloat(p.cantidad) || 0) * (parseFloat(p.precio_unitario) || 0);
  }

  totalGeneral() {
    return this.form.partidas.reduce((acc, p) => acc + (p.subtotal || 0), 0);
  }

  guardar() {
    this.errorForm.set('');
    if (!this.form.titulo) {
      this.errorForm.set('El titulo es requerido');
      return;
    }
    if (this.form.partidas.some(p => !p.concepto)) {
      this.errorForm.set('Todos los conceptos deben tener descripcion');
      return;
    }
    this.guardando.set(true);
    this.svc.crear(this.form).subscribe({
      next: () => {
        this.guardando.set(false);
        this.toggleForm();
        this.cargar();
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorForm.set(err.error?.error ?? 'Error al crear requisicion');
      }
    });
  }

  verDetalle(id: number) {
    this.nuevoEstatus  = '';
    this.observaciones = '';
    this.svc.obtener(id).subscribe({ next: r => this.detalle.set(r) });
  }

  puedeGestionar() {
    const rol = this.auth.rol();
    return rol === 'admin' || rol === 'supervisor';
  }

  cambiarEstatus() {
    if (!this.nuevoEstatus || !this.detalle()) return;
    this.svc.cambiarEstatus(this.detalle().id, this.nuevoEstatus, this.observaciones)
      .subscribe({
        next: () => {
          this.verDetalle(this.detalle().id);
          this.nuevoEstatus  = '';
          this.observaciones = '';
          this.cargar();
        }
      });
  }
}
