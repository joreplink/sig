import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

const API = 'http://localhost:5000/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _token   = signal<string | null>(localStorage.getItem('token'));
  private _usuario = signal<any>(
    JSON.parse(localStorage.getItem('usuario') || 'null')
  );

  token    = this._token.asReadonly();
  usuario  = this._usuario.asReadonly();
  logueado = computed(() => !!this._token());
  rol      = computed(() => this._usuario()?.rol ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${API}/auth/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('token',   res.access_token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
        this._token.set(res.access_token);
        this._usuario.set(res.usuario);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this._token.set(null);
    this._usuario.set(null);
    this.router.navigate(['/login']);
  }
}
