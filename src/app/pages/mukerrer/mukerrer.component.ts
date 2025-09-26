import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';

export interface DuplicateCall {
  operatorName: string;
  duration: string;  // Changed from number to string (e.g., "0:02")
  occurrenceCount: number;
  callIds: string[];
  firstOccurrence: string;
  lastOccurrence: string;
  averageScore: number;
}

export interface DuplicateCallsResponse {
  duplicates: DuplicateCall[];
  totalDuplicateGroups: number;
  totalDuplicateCalls: number;
}

export interface CallDetail {
  cagriId: string;
  degerlendirmeDurumu: string;
  asistanSicil: string;
  asistanAdiSoyadi: string;
  cagriTarihi: string;
  cagriSuresi: string;  // Changed from number to string
  degerlendireninAdi: string;
  degerlendirmeNo: string;
  degerlendirmePuani: number;
  sesDosyasi?: string;
  transkript?: string;
  filtreliKelimeler?: string;
  puanKirmaSebepleri?: string;
}

@Component({
  selector: 'app-mukerrer',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatExpansionModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './mukerrer.component.html',
  styleUrls: ['./mukerrer.component.css'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, height: '0px', overflow: 'hidden' }),
        animate('300ms ease-in-out', style({ opacity: 1, height: '*' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in-out', style({ opacity: 0, height: '0px' }))
      ])
    ])
  ]
})
export class MukerrerComponent implements OnInit {
  duplicates: DuplicateCall[] = [];
  loading = true;
  totalDuplicateGroups = 0;
  totalDuplicateCalls = 0;
  expandedDetails: { [key: string]: CallDetail[] } = {};
  loadingDetails: { [key: string]: boolean } = {};

  displayedColumns: string[] = [
    'operatorName',
    'duration', 
    'occurrenceCount',
    'averageScore',
    'dateRange',
    'actions'
  ];

  private readonly API_URL = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDuplicateCalls();
  }

  loadDuplicateCalls(): void {
    this.loading = true;
    this.getDuplicateCalls().subscribe({
      next: (response) => {
        this.duplicates = response.duplicates;
        this.totalDuplicateGroups = response.totalDuplicateGroups;
        this.totalDuplicateCalls = response.totalDuplicateCalls;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading duplicate calls:', error);
        this.loading = false;
      }
    });
  }

  getDuplicateCalls(): Observable<DuplicateCallsResponse> {
    return this.http.get<DuplicateCallsResponse>(`${this.API_URL}/duplicate_calls`);
  }

  getDuplicateCallDetails(operatorName: string, duration: string): Observable<CallDetail[]> {
    const encodedOperatorName = encodeURIComponent(operatorName);
    const encodedDuration = encodeURIComponent(duration);
    return this.http.get<CallDetail[]>(`${this.API_URL}/duplicate_calls/${encodedOperatorName}/${encodedDuration}`);
  }

  toggleDetails(duplicate: DuplicateCall): void {
    const key = `${duplicate.operatorName}-${duplicate.duration}`;
    
    if (this.expandedDetails[key]) {
      // Already expanded, collapse it
      delete this.expandedDetails[key];
      return;
    }

    // Load details
    this.loadingDetails[key] = true;
    this.getDuplicateCallDetails(duplicate.operatorName, duplicate.duration).subscribe({
      next: (details) => {
        this.expandedDetails[key] = details;
        this.loadingDetails[key] = false;
      },
      error: (error) => {
        console.error('Error loading call details:', error);
        this.loadingDetails[key] = false;
      }
    });
  }

  getKey(duplicate: DuplicateCall): string {
    return `${duplicate.operatorName}-${duplicate.duration}`;
  }

  isExpanded(duplicate: DuplicateCall): boolean {
    const key = this.getKey(duplicate);
    return !!this.expandedDetails[key];
  }

  isLoadingDetails(duplicate: DuplicateCall): boolean {
    const key = this.getKey(duplicate);
    return !!this.loadingDetails[key];
  }

  formatDuration(duration: string): string {
    // Duration is already in "M:SS" format from database
    return duration;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getScoreColor(score: number): string {
    if (score >= 85) return 'success';
    if (score >= 70) return 'warning';
    return 'danger';
  }

  getOccurrenceColor(count: number): string {
    if (count >= 5) return 'danger';
    if (count >= 3) return 'warning';
    return 'primary';
  }

  getOverallAverageScore(): string {
    if (this.duplicates.length === 0) return '0';
    const totalScore = this.duplicates.reduce((sum, d) => sum + d.averageScore, 0);
    const average = totalScore / this.duplicates.length;
    return average.toFixed(1);
  }
}