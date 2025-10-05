import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mini-trend-graph',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg height="24" width="60">
      <polyline
        [attr.points]="getPoints()"
        style="fill:none;stroke:#1976d2;stroke-width:2"
      />
      <circle *ngFor="let p of points; let i = index" [attr.cx]="p.x" [attr.cy]="p.y" r="2" fill="#1976d2" />
    </svg>
  `,
  styles: [':host { display: inline-block; vertical-align: middle; }']
})
export class MiniTrendGraphComponent {
  @Input() trend: number[] = [];
  points: {x: number, y: number}[] = [];

  getPoints(): string {
    if (!this.trend || this.trend.length === 0) return '';
    const max = Math.max(...this.trend);
    const min = Math.min(...this.trend);
    const range = max - min || 1;
    const w = 50, h = 18, left = 5, top = 3;
    this.points = this.trend.map((val, i) => ({
      x: left + i * (w / (this.trend.length - 1)),
      y: top + h - ((val - min) / range) * h
    }));
    return this.points.map(p => `${p.x},${p.y}`).join(' ');
  }
}
