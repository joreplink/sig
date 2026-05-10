import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const API = 'http://localhost:5000/api';

@Injectable({ providedIn: 'root' })
export class BienesService {
  private http = inject(HttpClient);

  listar(filtros: any = {}) {
    let params = new HttpParams();
    if (filtros.q)       params = params.set('q',       filtros.q);
    if (filtros.area_id) params = params.set('area_id', filtros.area_id);
    if (filtros.estado)  params = params.set('estado',  filtros.estado);
    return this.http.get<any[]>(`${API}/bienes/`, { params });
  }

  obtener(id: number)  { return this.http.get<any>(`${API}/bienes/${id}`); }
  crear(data: any)     { return this.http.post<any>(`${API}/bienes/`, data); }
  actualizar(id: number, data: any) { return this.http.patch(`${API}/bienes/${id}`, data); }
  darBaja(id: number, motivo: string) {
    return this.http.patch(`${API}/bienes/${id}/baja`, { motivo });
  }
}
