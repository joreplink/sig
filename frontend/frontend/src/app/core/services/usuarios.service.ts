import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API = 'http://localhost:5000/api';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);

  listar()          { return this.http.get<any[]>(`${API}/usuarios/`); }
  roles()           { return this.http.get<any[]>(`${API}/usuarios/roles`); }
  areas()           { return this.http.get<any[]>(`${API}/usuarios/areas`); }
  crear(data: any)  { return this.http.post(`${API}/usuarios/`, data); }
  activar(id: number)    { return this.http.patch(`${API}/usuarios/${id}/activar`, {}); }
  desactivar(id: number) { return this.http.patch(`${API}/usuarios/${id}/desactivar`, {}); }
}
