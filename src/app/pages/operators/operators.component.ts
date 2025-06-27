import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MiniTrendGraphComponent } from './mini-trend-graph.component';
import { EvaluationService, EvaluationData } from '../../services/evaluation.service';

interface Operator {
  id: number;
  name: string;
  sicil: string;
  averageScore: number;
  callCount: number;
  totalDuration: number; // in seconds
  lastCallDate: Date;
  trend: number[]; // last 5 call scores
}

@Component({
  selector: 'app-operators',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MiniTrendGraphComponent
  ],
  templateUrl: './operators.component.html',
  styleUrls: ['./operators.component.css']
})
export class OperatorsComponent implements OnInit {
  operators: Operator[] = [];
  filteredOperators: Operator[] = [];
  searchQuery: string = '';

  constructor(private router: Router, private evaluationService: EvaluationService) {}

  ngOnInit() {
    this.evaluationService.getEvaluations().subscribe((data: EvaluationData[]) => {
      const operatorMap = new Map<string, Operator & { trendArr: number[] }>();
      data.forEach(ev => {
        const key = ev.asistanSicil + '|' + ev.asistanAdiSoyadi;
        if (!operatorMap.has(key)) {
          operatorMap.set(key, {
            id: operatorMap.size + 1,
            name: ev.asistanAdiSoyadi,
            sicil: ev.asistanSicil,
            averageScore: ev.degerlendirmePuani,
            callCount: 1,
            totalDuration: this.parseDuration(ev.cagriSuresi),
            lastCallDate: new Date(ev.cagriTarihi),
            trend: [ev.degerlendirmePuani],
            trendArr: [ev.degerlendirmePuani]
          });
        } else {
          const op = operatorMap.get(key)!;
          op.callCount++;
          op.totalDuration += this.parseDuration(ev.cagriSuresi);
          op.averageScore = ((op.averageScore * (op.callCount - 1)) + ev.degerlendirmePuani) / op.callCount;
          if (new Date(ev.cagriTarihi) > op.lastCallDate) op.lastCallDate = new Date(ev.cagriTarihi);
          op.trendArr.push(ev.degerlendirmePuani);
          op.trend = op.trendArr.slice(-5);
        }
      });
      this.operators = Array.from(operatorMap.values()).map(op => ({ ...op, averageScore: Math.round(op.averageScore), trend: op.trend.slice(-5) }));
      this.filteredOperators = this.operators;
    });
  }

  parseDuration(duration: string): number {
    // "mm:ss" veya "m:ss" formatını saniyeye çevirir
    if (!duration) return 0;
    const parts = duration.split(':');
    if (parts.length !== 2) return 0;
    const min = parseInt(parts[0], 10);
    const sec = parseInt(parts[1], 10);
    return (isNaN(min) ? 0 : min) * 60 + (isNaN(sec) ? 0 : sec);
  }

  applySearch() {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredOperators = this.operators;
      return;
    }
    this.filteredOperators = this.operators.filter(op =>
      op.name.toLowerCase().includes(q) ||
      op.sicil.includes(q)
    );
  }

  formatDuration(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min} dk ${sec} sn`;
  }

  goToOperatorDetail(operator: Operator) {
    this.router.navigate(['/asistanlar', operator.id]);
  }
}
