import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { SpeechService, Speech } from '../../services/speech.service';

export interface EvaluationData {
  cagriId: string;
  degerlendirmeDurumu: string;
  asistanSicil: string;
  asistanAdiSoyadi: string;
  cagriTarihi: Date;
  cagriSuresi: string; // Added Çağrı Süresi
  degerlendireninAdi: string;
  degerlendirmeNo: string;
  degerlendirmePuani: number;
}

const ELEMENT_DATA: EvaluationData[] = [
  {cagriId: '1001', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS123', asistanAdiSoyadi: 'Ahmet Yılmaz', cagriTarihi: new Date('2023-10-26T10:00:00Z'), cagriSuresi: '05:30', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN001', degerlendirmePuani: 85},
  {cagriId: '1002', degerlendirmeDurumu: 'Beklemede', asistanSicil: 'AS124', asistanAdiSoyadi: 'Fatma Demir', cagriTarihi: new Date('2023-10-26T10:15:00Z'), cagriSuresi: '03:45', degerlendireninAdi: 'Mehmet Can', degerlendirmeNo: 'DN002', degerlendirmePuani: 70},
  {cagriId: '1003', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS125', asistanAdiSoyadi: 'Ali Veli', cagriTarihi: new Date('2023-10-26T10:30:00Z'), cagriSuresi: '07:10', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN003', degerlendirmePuani: 92},
  {cagriId: '1004', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS126', asistanAdiSoyadi: 'Canan Er', cagriTarihi: new Date('2023-10-26T10:45:00Z'), cagriSuresi: '04:20', degerlendireninAdi: 'Mehmet Can', degerlendirmeNo: 'DN004', degerlendirmePuani: 78},
  {cagriId: '1005', degerlendirmeDurumu: 'Beklemede', asistanSicil: 'AS127', asistanAdiSoyadi: 'Deniz Ak', cagriTarihi: new Date('2023-10-26T11:00:00Z'), cagriSuresi: '06:00', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN005', degerlendirmePuani: 65},
  {cagriId: '1001', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS123', asistanAdiSoyadi: 'Ahmet Yılmaz', cagriTarihi: new Date('2023-10-26T10:00:00Z'), cagriSuresi: '05:30', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN001', degerlendirmePuani: 85},
  {cagriId: '1002', degerlendirmeDurumu: 'Beklemede', asistanSicil: 'AS124', asistanAdiSoyadi: 'Fatma Demir', cagriTarihi: new Date('2023-10-26T10:15:00Z'), cagriSuresi: '03:45', degerlendireninAdi: 'Mehmet Can', degerlendirmeNo: 'DN002', degerlendirmePuani: 70},
  {cagriId: '1003', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS125', asistanAdiSoyadi: 'Ali Veli', cagriTarihi: new Date('2023-10-26T10:30:00Z'), cagriSuresi: '07:10', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN003', degerlendirmePuani: 92},
  {cagriId: '1004', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS126', asistanAdiSoyadi: 'Canan Er', cagriTarihi: new Date('2023-10-26T10:45:00Z'), cagriSuresi: '04:20', degerlendireninAdi: 'Mehmet Can', degerlendirmeNo: 'DN004', degerlendirmePuani: 78},
  {cagriId: '1005', degerlendirmeDurumu: 'Beklemede', asistanSicil: 'AS127', asistanAdiSoyadi: 'Deniz Ak', cagriTarihi: new Date('2023-10-26T11:00:00Z'), cagriSuresi: '06:00', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN005', degerlendirmePuani: 65},
  {cagriId: '1001', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS123', asistanAdiSoyadi: 'Ahmet Yılmaz', cagriTarihi: new Date('2023-10-26T10:00:00Z'), cagriSuresi: '05:30', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN001', degerlendirmePuani: 85},
  {cagriId: '1002', degerlendirmeDurumu: 'Beklemede', asistanSicil: 'AS124', asistanAdiSoyadi: 'Fatma Demir', cagriTarihi: new Date('2023-10-26T10:15:00Z'), cagriSuresi: '03:45', degerlendireninAdi: 'Mehmet Can', degerlendirmeNo: 'DN002', degerlendirmePuani: 70},
  {cagriId: '1003', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS125', asistanAdiSoyadi: 'Ali Veli', cagriTarihi: new Date('2023-10-26T10:30:00Z'), cagriSuresi: '07:10', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN003', degerlendirmePuani: 92},
  {cagriId: '1004', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS126', asistanAdiSoyadi: 'Canan Er', cagriTarihi: new Date('2023-10-26T10:45:00Z'), cagriSuresi: '04:20', degerlendireninAdi: 'Mehmet Can', degerlendirmeNo: 'DN004', degerlendirmePuani: 78},
  {cagriId: '1005', degerlendirmeDurumu: 'Beklemede', asistanSicil: 'AS127', asistanAdiSoyadi: 'Deniz Ak', cagriTarihi: new Date('2023-10-26T11:00:00Z'), cagriSuresi: '06:00', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN005', degerlendirmePuani: 65},
  {cagriId: '1001', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS123', asistanAdiSoyadi: 'Ahmet Yılmaz', cagriTarihi: new Date('2023-10-26T10:00:00Z'), cagriSuresi: '05:30', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN001', degerlendirmePuani: 85},
  {cagriId: '1002', degerlendirmeDurumu: 'Beklemede', asistanSicil: 'AS124', asistanAdiSoyadi: 'Fatma Demir', cagriTarihi: new Date('2023-10-26T10:15:00Z'), cagriSuresi: '03:45', degerlendireninAdi: 'Mehmet Can', degerlendirmeNo: 'DN002', degerlendirmePuani: 70},
  {cagriId: '1003', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS125', asistanAdiSoyadi: 'Ali Veli', cagriTarihi: new Date('2023-10-26T10:30:00Z'), cagriSuresi: '07:10', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN003', degerlendirmePuani: 92},
  {cagriId: '1004', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS126', asistanAdiSoyadi: 'Canan Er', cagriTarihi: new Date('2023-10-26T10:45:00Z'), cagriSuresi: '04:20', degerlendireninAdi: 'Mehmet Can', degerlendirmeNo: 'DN004', degerlendirmePuani: 78},
  {cagriId: '1005', degerlendirmeDurumu: 'Beklemede', asistanSicil: 'AS127', asistanAdiSoyadi: 'Deniz Ak', cagriTarihi: new Date('2023-10-26T11:00:00Z'), cagriSuresi: '06:00', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN005', degerlendirmePuani: 65},
  {cagriId: '1001', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS123', asistanAdiSoyadi: 'Ahmet Yılmaz', cagriTarihi: new Date('2023-10-26T10:00:00Z'), cagriSuresi: '05:30', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN001', degerlendirmePuani: 85},
  {cagriId: '1002', degerlendirmeDurumu: 'Beklemede', asistanSicil: 'AS124', asistanAdiSoyadi: 'Fatma Demir', cagriTarihi: new Date('2023-10-26T10:15:00Z'), cagriSuresi: '03:45', degerlendireninAdi: 'Mehmet Can', degerlendirmeNo: 'DN002', degerlendirmePuani: 70},
  {cagriId: '1003', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS125', asistanAdiSoyadi: 'Ali Veli', cagriTarihi: new Date('2023-10-26T10:30:00Z'), cagriSuresi: '07:10', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN003', degerlendirmePuani: 92},
  {cagriId: '1004', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS126', asistanAdiSoyadi: 'Canan Er', cagriTarihi: new Date('2023-10-26T10:45:00Z'), cagriSuresi: '04:20', degerlendireninAdi: 'Mehmet Can', degerlendirmeNo: 'DN004', degerlendirmePuani: 78},
  {cagriId: '1005', degerlendirmeDurumu: 'Beklemede', asistanSicil: 'AS127', asistanAdiSoyadi: 'Deniz Ak', cagriTarihi: new Date('2023-10-26T11:00:00Z'), cagriSuresi: '06:00', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN005', degerlendirmePuani: 65},
  {cagriId: '1001', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS123', asistanAdiSoyadi: 'Ahmet Yılmaz', cagriTarihi: new Date('2023-10-26T10:00:00Z'), cagriSuresi: '05:30', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN001', degerlendirmePuani: 85},
  {cagriId: '1002', degerlendirmeDurumu: 'Beklemede', asistanSicil: 'AS124', asistanAdiSoyadi: 'Fatma Demir', cagriTarihi: new Date('2023-10-26T10:15:00Z'), cagriSuresi: '03:45', degerlendireninAdi: 'Mehmet Can', degerlendirmeNo: 'DN002', degerlendirmePuani: 70},
  {cagriId: '1003', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS125', asistanAdiSoyadi: 'Ali Veli', cagriTarihi: new Date('2023-10-26T10:30:00Z'), cagriSuresi: '07:10', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN003', degerlendirmePuani: 92},
  {cagriId: '1004', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS126', asistanAdiSoyadi: 'Canan Er', cagriTarihi: new Date('2023-10-26T10:45:00Z'), cagriSuresi: '04:20', degerlendireninAdi: 'Mehmet Can', degerlendirmeNo: 'DN004', degerlendirmePuani: 78},
  {cagriId: '1005', degerlendirmeDurumu: 'Beklemede', asistanSicil: 'AS127', asistanAdiSoyadi: 'Deniz Ak', cagriTarihi: new Date('2023-10-26T11:00:00Z'), cagriSuresi: '06:00', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN005', degerlendirmePuani: 65},
  {cagriId: '1001', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS123', asistanAdiSoyadi: 'Ahmet Yılmaz', cagriTarihi: new Date('2023-10-26T10:00:00Z'), cagriSuresi: '05:30', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN001', degerlendirmePuani: 85},
  {cagriId: '1002', degerlendirmeDurumu: 'Beklemede', asistanSicil: 'AS124', asistanAdiSoyadi: 'Fatma Demir', cagriTarihi: new Date('2023-10-26T10:15:00Z'), cagriSuresi: '03:45', degerlendireninAdi: 'Mehmet Can', degerlendirmeNo: 'DN002', degerlendirmePuani: 70},
  {cagriId: '1003', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS125', asistanAdiSoyadi: 'Ali Veli', cagriTarihi: new Date('2023-10-26T10:30:00Z'), cagriSuresi: '07:10', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN003', degerlendirmePuani: 92},
  {cagriId: '1004', degerlendirmeDurumu: 'Tamamlandı', asistanSicil: 'AS126', asistanAdiSoyadi: 'Canan Er', cagriTarihi: new Date('2023-10-26T10:45:00Z'), cagriSuresi: '04:20', degerlendireninAdi: 'Mehmet Can', degerlendirmeNo: 'DN004', degerlendirmePuani: 78},
  {cagriId: '1005', degerlendirmeDurumu: 'Beklemede', asistanSicil: 'AS127', asistanAdiSoyadi: 'Deniz Ak', cagriTarihi: new Date('2023-10-26T11:00:00Z'), cagriSuresi: '06:00', degerlendireninAdi: 'Ayşe Kaya', degerlendirmeNo: 'DN005', degerlendirmePuani: 65},
];


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
    MatPaginatorModule,
    MatExpansionModule,
    MatSortModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  dailySpeeches: Speech[] = [];
  weeklySpeeches: Speech[] = [];
  monthlySpeeches: Speech[] = [];

  dailyPageSize = 5;
  dailyPageIndex = 0;
  weeklyPageSize = 5;
  weeklyPageIndex = 0;
  monthlyPageSize = 5;
  monthlyPageIndex = 0;

  displayedColumns: string[] = ['ID', 'Operator', 'Musteri', 'Date', 'Time', 'Puan'];

  selectedSpeech: Speech | null = null;

  evaluationDataSource = new MatTableDataSource(ELEMENT_DATA);
  evaluationDisplayedColumns: string[] = ['cagriId', 'degerlendirmeDurumu', 'asistanSicil', 'asistanAdiSoyadi', 'cagriTarihi', 'cagriSuresi', 'degerlendireninAdi', 'degerlendirmeNo', 'degerlendirmePuani']; // Added cagriSuresi

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private speechService: SpeechService) {}

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    this.evaluationDataSource.sort = this.sort;
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
