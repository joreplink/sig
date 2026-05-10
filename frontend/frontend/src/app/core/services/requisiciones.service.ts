import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const API = 'http://localhost:5000/api';

@Injectable({ providedIn: 'root' })
export class RequisicionesService {
  private http = inject(HttpClient);

  listar(filtros: any = {}) {
    let params = new HttpParams();
    if (filtros.estatus) params = params.set('estatus', filtros.estatus);
    return this.http.get<any[]>(`${API}/requisiciones/`, { params });
  }

  obtener(id: number)  { return this.http.get<any>(`${API}/requisiciones/${id}`); }
  crear(data: any)     { return this.http.post<any>(`${API}/requisiciones/`, data); }

  cambiarEstatus(id: number, estatus: string, observaciones: string) {
    return this.http.patch(`${API}/requisiciones/${id}/estatus`, { estatus, observaciones });
  }
}
