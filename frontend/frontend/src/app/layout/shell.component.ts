import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="shell">

      <!-- SIDEBAR -->
      <aside class="sidebar" [class.collapsed]="collapsed()">

        <div class="sidebar-header">
          <span class="sidebar-logo">⚙</span>
          @if (!collapsed()) {
            <span class="sidebar-title">SistemaGov</span>
          }
          <button class="btn-collapse" (click)="toggleSidebar()">
            {{ collapsed() ? '>' : '<' }}
          </button>
        </div>

        <nav class="sidebar-nav">

          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            @if (!collapsed()) { <span class="nav-label">Dashboard</span> }
          </a>

          @if (!collapsed()) {
            <div class="nav-section">Operacion</div>
          }

          <a routerLink="/bienes" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🏛</span>
            @if (!collapsed()) { <span class="nav-label">Bienes Muebles</span> }
          </a>

          <a routerLink="/requisiciones" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📋</span>
            @if (!collapsed()) { <span class="nav-label">Requisiciones</span> }
          </a>

          <a routerLink="/almacen" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📦</span>
            @if (!collapsed()) { <span class="nav-label">Almacen</span> }
          </a>

          @if (esAdmin()) {
            @if (!collapsed()) {
              <div class="nav-section">Administracion</div>
            }
            <a routerLink="/usuarios" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">👥</span>
              @if (!collapsed()) { <span class="nav-label">Usuarios</span> }
            </a>
            <a routerLink="/bitacora" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📒</span>
              @if (!collapsed()) { <span class="nav-label">Bitacora</span> }
            </a>
          }

        </nav>

        <div class="sidebar-footer">
          <button class="nav-item nav-logout" (click)="logout()">
            <span class="nav-icon">🚪</span>
            @if (!collapsed()) { <span class="nav-label">Salir</span> }
          </button>
        </div>

      </aside>

      <!-- CONTENIDO -->
      <div class="main">

        <!-- TOPBAR -->
        <header class="topbar">
          <div class="topbar-left">
            <span class="page-title">Dashboard</span>
          </div>
          <div class="topbar-right">
            <span class="user-info">
              {{ nombreUsuario() }}
              <span class="user-rol">{{ rolUsuario() }}</span>
            </span>
          </div>
        </header>

        <!-- PAGINA -->
        <main class="page-content">
          <router-outlet />
        </main>

      </div>

    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .shell {
      display: flex;
      height: 100vh;
      font-family: Arial, sans-serif;
      background: #F8F9FA;
    }

    .sidebar {
      width: 240px;
      background: #6B0F1A;
      color: white;
      display: flex;
      flex-direction: column;
      transition: width 0.2s ease;
      flex-shrink: 0;
    }
    .sidebar.collapsed { width: 64px; }

    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 16px;
      height: 60px;
      background: #4A0A12;
      flex-shrink: 0;
    }
    .sidebar-logo  { font-size: 22px; }
    .sidebar-title { font-size: 15px; font-weight: 700; flex: 1; }

    .btn-collapse {
      background: none;
      border: none;
      color: rgba(255,255,255,0.7);
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      margin-left: auto;
    }
    .btn-collapse:hover { background: rgba(255,255,255,0.1); }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 12px 0;
    }

    .nav-section {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: rgba(255,255,255,0.45);
      padding: 14px 18px 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 18px;
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      font-size: 14px;
      cursor: pointer;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      transition: background 0.15s;
    }
    .nav-item:hover  { background: rgba(255,255,255,0.1); color: white; }
    .nav-item.active {
      background: rgba(255,255,255,0.15);
      color: white;
      border-left: 3px solid #D4A0A7;
      font-weight: 600;
    }
    .nav-icon  { font-size: 16px; min-width: 20px; text-align: center; }
    .nav-label { white-space: nowrap; }

    .sidebar-footer {
      border-top: 1px solid rgba(255,255,255,0.1);
      padding: 8px 0;
    }
    .nav-logout { color: rgba(255,255,255,0.6); }
    .nav-logout:hover { color: #FF8A80; }

    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .topbar {
      height: 60px;
      background: white;
      border-bottom: 1px solid #E8DDE0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      flex-shrink: 0;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .page-title {
      font-size: 17px;
      font-weight: 700;
      color: #6B0F1A;
    }
    .user-info {
      font-size: 13px;
      color: #666;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .user-rol {
      background: #F5E6E8;
      color: #6B0F1A;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
      text-transform: uppercase;
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }
  `]
})
export class ShellComponent {
  private auth = inject(AuthService);
  collapsed    = signal(false);

  toggleSidebar() {
    this.collapsed.set(!this.collapsed());
  }

  esAdmin() {
    return this.auth.rol() === 'admin';
  }

  logout() {
    this.auth.logout();
  }

  nombreUsuario() {
    return this.auth.usuario()?.nombre ?? '';
  }

  rolUsuario() {
    return this.auth.usuario()?.rol ?? '';
  }
}
