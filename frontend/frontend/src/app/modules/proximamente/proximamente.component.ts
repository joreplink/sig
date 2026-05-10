import { Component } from '@angular/core';

@Component({
  selector: 'app-proximamente',
  standalone: true,
  template: `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60vh;
      color: #888;
      font-family: Arial;
    ">
      <div style="font-size: 48px; margin-bottom: 16px">🚧</div>
      <h2 style="color: #6B0F1A; margin-bottom: 8px">Modulo en construccion</h2>
      <p style="font-size: 14px">Este modulo estara disponible en una proxima fase.</p>
    </div>
  `
})
export class ProximamenteComponent {}
