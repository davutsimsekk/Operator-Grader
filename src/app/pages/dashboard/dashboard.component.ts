import { Component, OnInit, ViewChild } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SpeechService, Speech } from '../../services/speech.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatGridListModule, 
    MatCardModule, 
    MatListModule, 
    CommonModule, 
    MatTableModule,
    MatIconModule,
    MatPaginatorModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  dailySpeeches: Speech[] = [];
  weeklySpeeches: Speech[] = [];
  monthlySpeeches: Speech[] = [];

  dailyPageSize = 5;
  dailyPageIndex = 0;
  weeklyPageSize = 5;
  weeklyPageIndex = 0;
  monthlyPageSize = 5;
  monthlyPageIndex = 0;

  displayedColumns: string[] = ['ID', 'Operator', 'Musteri', 'Puan'];

  selectedSpeech: Speech | null = null;

  constructor(private speechService: SpeechService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.speechService.getDailySorted().subscribe(data => {
      this.dailySpeeches = data;
    });

    this.speechService.getWeeklySorted().subscribe(data => {
      this.weeklySpeeches = data;
    });

    this.speechService.getMonthlySorted().subscribe(data => {
      this.monthlySpeeches = data;
    });
  }

  onRowClick(speech: Speech) {
    this.selectedSpeech = speech;
    console.log('Selected Speech:', this.selectedSpeech);
  }

  // Pagination handlers
  onDailyPageChange(event: PageEvent) {
    this.dailyPageIndex = event.pageIndex;
    this.dailyPageSize = event.pageSize;
  }

  onWeeklyPageChange(event: PageEvent) {
    this.weeklyPageIndex = event.pageIndex;
    this.weeklyPageSize = event.pageSize;
  }

  onMonthlyPageChange(event: PageEvent) {
    this.monthlyPageIndex = event.pageIndex;
    this.monthlyPageSize = event.pageSize;
  }

  // Get paginated data for each table
  getDailyPaginatedData() {
    const start = this.dailyPageIndex * this.dailyPageSize;
    return this.dailySpeeches.slice(start, start + this.dailyPageSize);
  }

  getWeeklyPaginatedData() {
    const start = this.weeklyPageIndex * this.weeklyPageSize;
    return this.weeklySpeeches.slice(start, start + this.weeklyPageSize);
  }

  getMonthlyPaginatedData() {
    const start = this.monthlyPageIndex * this.monthlyPageSize;
    return this.monthlySpeeches.slice(start, start + this.monthlyPageSize);
  }
}
