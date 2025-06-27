import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MiniTrendGraphComponent } from './mini-trend-graph.component';
import { EvaluationService, EvaluationData } from '../../services/evaluation.service';

interface OperatorDetail {
  id: number;
  name: string;
  sicil: string;
  averageScore: number;
  callCount: number;
  totalDuration: number;
  lastCallDate: Date;
  trend: number[];
  calls: Array<{
    id: string;
    date: Date;
    score: number;
    duration: number;
    transcript: string;
  }>;
}

@Component({
  selector: 'app-operator-detail',
  templateUrl: './operator-detail.component.html',
  styleUrls: ['./operator-detail.component.css'],
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
    MatTooltipModule,
    MiniTrendGraphComponent
  ],
})
export class OperatorDetailComponent implements OnInit {
  operator: OperatorDetail | null = null;

  constructor(private route: ActivatedRoute, private evaluationService: EvaluationService, private router: Router) {}

  ngOnInit() {
    // Route param ile asistan id'sini al
    const id = Number(this.route.snapshot.paramMap.get('id'));
    // Tüm değerlendirmeleri çekip ilgili asistanı bul
    this.evaluationService.getEvaluations().subscribe((data: EvaluationData[]) => {
      // id, asistanlar sayfasındaki sıralama id'siyle eşleşiyor
      // O yüzden aynı mantıkla asistanları grupla
      const operatorMap = new Map<string, OperatorDetail & { trendArr: number[] }>();
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
            trendArr: [ev.degerlendirmePuani],
            calls: [{
              id: ev.cagriId,
              date: new Date(ev.cagriTarihi),
              score: ev.degerlendirmePuani,
              duration: this.parseDuration(ev.cagriSuresi),
              transcript: ev.transkript || ''
            }]
          });
        } else {
          const op = operatorMap.get(key)!;
          op.callCount++;
          op.totalDuration += this.parseDuration(ev.cagriSuresi);
          op.averageScore = ((op.averageScore * (op.callCount - 1)) + ev.degerlendirmePuani) / op.callCount;
          if (new Date(ev.cagriTarihi) > op.lastCallDate) op.lastCallDate = new Date(ev.cagriTarihi);
          op.trendArr.push(ev.degerlendirmePuani);
          op.trend = op.trendArr.slice(-5);
          op.calls.push({
            id: ev.cagriId,
            date: new Date(ev.cagriTarihi),
            score: ev.degerlendirmePuani,
            duration: this.parseDuration(ev.cagriSuresi),
            transcript: ev.transkript || ''
          });
        }
      });
      // id ile eşleşen asistanı bul
      const found = Array.from(operatorMap.values()).find(op => op.id === id);
      if (found) {
        this.operator = { ...found, averageScore: Math.round(found.averageScore), trend: found.trend.slice(-5) };
      } else {
        this.router.navigate(['/asistanlar']); // bulunamazsa geri dön
      }
    });
  }

  parseDuration(duration: string): number {
    if (!duration) return 0;
    const parts = duration.split(':');
    if (parts.length !== 2) return 0;
    const min = parseInt(parts[0], 10);
    const sec = parseInt(parts[1], 10);
    return (isNaN(min) ? 0 : min) * 60 + (isNaN(sec) ? 0 : sec);
  }

  formatDuration(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min} dk ${sec} sn`;
  }

  goToEvaluation(call: { id: string }) {
    // Değerlendirme detayına yönlendir (dashboard'da ilgili çağrıyı açacak şekilde)
    this.router.navigate(['/dashboard'], { queryParams: { cagriId: call.id, showDetail: true } });
  }
}
