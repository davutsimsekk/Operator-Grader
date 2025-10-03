import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
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
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    FormsModule
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
    ]),
    trigger('filterAnimation', [
      transition(':enter', [
        style({ opacity: 0, maxHeight: '0', overflow: 'hidden' }),
        animate('300ms ease-out', 
          style({ opacity: 1, maxHeight: '300px' })
        )
      ]),
      transition(':leave', [
        style({ opacity: 1, maxHeight: '300px', overflow: 'hidden' }),
        animate('200ms ease-in', 
          style({ opacity: 0, maxHeight: '0' })
        )
      ])
    ])
  ]
})
export class MukerrerComponent implements OnInit {
  // Original data from API
  originalDuplicates: DuplicateCall[] = [];
  // Filtered data for display
  duplicates: DuplicateCall[] = [];
  
  loading = true;
  totalDuplicateGroups = 0;
  totalDuplicateCalls = 0;
  expandedDetails: { [key: string]: CallDetail[] } = {};
  loadingDetails: { [key: string]: boolean } = {};

  // Filter properties
  showFilters = false;
  filterValues = {
    operatorName: '',
    minOccurrences: null as number | null,
    maxOccurrences: null as number | null,
    minScore: null as number | null,
    maxScore: null as number | null,
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
    minDuration: null as number | null, // Min duration in seconds
    maxDuration: null as number | null  // Max duration in seconds
  };

  // Unique operators list for dropdown
  uniqueOperators: string[] = [];

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
        this.originalDuplicates = response.duplicates;
        this.duplicates = [...this.originalDuplicates];
        this.totalDuplicateGroups = response.totalDuplicateGroups;
        this.totalDuplicateCalls = response.totalDuplicateCalls;
        this.extractUniqueOperators();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading duplicate calls:', error);
        this.loading = false;
      }
    });
  }

  extractUniqueOperators(): void {
    this.uniqueOperators = [...new Set(this.originalDuplicates.map(d => d.operatorName))].sort();
  }

  getDuplicateCalls(): Observable<DuplicateCallsResponse> {
    return this.http.get<DuplicateCallsResponse>(`${this.API_URL}/duplicate_calls`);
  }

  getDuplicateCallDetails(operatorName: string, duration: string): Observable<CallDetail[]> {
    const encodedOperatorName = encodeURIComponent(operatorName);
    const encodedDuration = encodeURIComponent(duration);
    return this.http.get<CallDetail[]>(`${this.API_URL}/duplicate_calls/${encodedOperatorName}/${encodedDuration}`);
  }

  // Helper function to convert duration string (e.g., "0:05", "1:23") to seconds
  durationToSeconds(duration: string): number {
    if (!duration) return 0;
    
    const parts = duration.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10) || 0;
      const seconds = parseInt(parts[1], 10) || 0;
      return minutes * 60 + seconds;
    }
    
    // If it's just seconds (fallback)
    return parseInt(duration, 10) || 0;
  }

  // Filter methods
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    let filtered = [...this.originalDuplicates];

    // Operator name filter
    if (this.filterValues.operatorName) {
      filtered = filtered.filter(d => 
        d.operatorName.toLowerCase().includes(this.filterValues.operatorName.toLowerCase())
      );
    }

    // Occurrence count filters
    if (this.filterValues.minOccurrences !== null) {
      filtered = filtered.filter(d => d.occurrenceCount >= this.filterValues.minOccurrences!);
    }
    if (this.filterValues.maxOccurrences !== null) {
      filtered = filtered.filter(d => d.occurrenceCount <= this.filterValues.maxOccurrences!);
    }

    // Score filters
    if (this.filterValues.minScore !== null) {
      filtered = filtered.filter(d => d.averageScore >= this.filterValues.minScore!);
    }
    if (this.filterValues.maxScore !== null) {
      filtered = filtered.filter(d => d.averageScore <= this.filterValues.maxScore!);
    }

    // Date filters
    if (this.filterValues.dateFrom) {
      filtered = filtered.filter(d => 
        new Date(d.firstOccurrence) >= this.filterValues.dateFrom! ||
        new Date(d.lastOccurrence) >= this.filterValues.dateFrom!
      );
    }
    if (this.filterValues.dateTo) {
      const dateTo = new Date(this.filterValues.dateTo);
      dateTo.setHours(23, 59, 59, 999); // Include the entire day
      filtered = filtered.filter(d => 
        new Date(d.firstOccurrence) <= dateTo ||
        new Date(d.lastOccurrence) <= dateTo
      );
    }

    // Duration range filters
    if (this.filterValues.minDuration !== null) {
      filtered = filtered.filter(d => this.durationToSeconds(d.duration) >= this.filterValues.minDuration!);
    }
    if (this.filterValues.maxDuration !== null) {
      filtered = filtered.filter(d => this.durationToSeconds(d.duration) <= this.filterValues.maxDuration!);
    }

    this.duplicates = filtered;
    this.updateFilteredStats();
  }

  updateFilteredStats(): void {
    this.totalDuplicateGroups = this.duplicates.length;
    this.totalDuplicateCalls = this.duplicates.reduce((sum, d) => sum + d.occurrenceCount, 0);
  }

  clearFilters(): void {
    this.filterValues = {
      operatorName: '',
      minOccurrences: null,
      maxOccurrences: null,
      minScore: null,
      maxScore: null,
      dateFrom: null,
      dateTo: null,
      minDuration: null,
      maxDuration: null
    };
    this.applyFilters();
  }

  // Quick filter methods
  filterByOperator(operatorName: string): void {
    this.filterValues.operatorName = operatorName;
    this.showFilters = true;
    this.applyFilters();
  }

  filterByHighOccurrence(): void {
    this.filterValues.minOccurrences = 5;
    this.showFilters = true;
    this.applyFilters();
  }

  filterByLowScore(): void {
    this.filterValues.maxScore = 70;
    this.showFilters = true;
    this.applyFilters();
  }

  filterByLastWeek(): void {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    this.filterValues.dateFrom = oneWeekAgo;
    this.showFilters = true;
    this.applyFilters();
  }

  filterByLastMonth(): void {
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    this.filterValues.dateFrom = oneMonthAgo;
    this.showFilters = true;
    this.applyFilters();
  }

  // Duration-based quick filters
  filterByShortCalls(): void {
    this.filterValues.maxDuration = 5; // 5 seconds or less
    this.showFilters = true;
    this.applyFilters();
  }

  filterByMediumCalls(): void {
    this.filterValues.minDuration = 6; // 6 seconds or more
    this.filterValues.maxDuration = 30; // 30 seconds or less
    this.showFilters = true;
    this.applyFilters();
  }

  filterByLongCalls(): void {
    this.filterValues.minDuration = 31; // More than 30 seconds
    this.showFilters = true;
    this.applyFilters();
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

  hasActiveFilters(): boolean {
    return !!(
      this.filterValues.operatorName ||
      this.filterValues.minOccurrences !== null ||
      this.filterValues.maxOccurrences !== null ||
      this.filterValues.minScore !== null ||
      this.filterValues.maxScore !== null ||
      this.filterValues.dateFrom ||
      this.filterValues.dateTo ||
      this.filterValues.minDuration !== null ||
      this.filterValues.maxDuration !== null
    );
  }
}