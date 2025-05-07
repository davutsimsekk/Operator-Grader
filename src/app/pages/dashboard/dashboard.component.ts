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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { EvaluationService, EvaluationData } from '../../services/evaluation.service';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AudioVisualizerComponent } from '../../audio-visualizer/audio-visualizer.component';

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
    MatSortModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule, // Required for date picker
    MatButtonModule,
    MatTooltipModule,
    AudioVisualizerComponent // Audio visualizer bileşenini import ediyoruz
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  animations: [
    trigger('filterAnimation', [
      transition(':enter', [
        style({ opacity: 0, maxHeight: '0', overflow: 'hidden' }),
        animate('300ms ease-out', 
          style({ opacity: 1, maxHeight: '1000px' })
        )
      ]),
      transition(':leave', [
        style({ opacity: 1, maxHeight: '1000px', overflow: 'hidden' }),
        animate('200ms ease-in', 
          style({ opacity: 0, maxHeight: '0' })
        )
      ])
    ]),
    // Arama kutusu için animasyon eklendi
    trigger('searchAnimation', [
      transition(':enter', [
        style({ opacity: 0, width: '0', overflow: 'hidden' }),
        animate('200ms ease-out', 
          style({ opacity: 1, width: '250px' })
        )
      ]),
      transition(':leave', [
        style({ opacity: 1, width: '250px', overflow: 'hidden' }),
        animate('150ms ease-in', 
          style({ opacity: 0, width: '0' })
        )
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  speechDuration: number = 0;
  wordCount: number = 0;
  averageWordLength: number = 0;
  mostFrequentWords: string = '';

  // Filtrelenmiş kelimeleri saklamak için dizi
  filteredWords: any[] = [];

  // Audio visualizer bileşeni referansını ekliyoruz
  @ViewChild('audioVisualizer') audioVisualizer!: AudioVisualizerComponent;
  
  // Ses durumunu takip etmek için yeni değişkenler
  isPlaying: boolean = false;
  audioReady: boolean = false;
  
  dailySpeeches: EvaluationData[] = [];
  weeklySpeeches: EvaluationData[] = [];
  monthlySpeeches: EvaluationData[] = [];

  // Pagination settings
  readonly MAIN_TABLE_ITEMS = 10;
  readonly RANKING_TABLE_ITEMS = 7;
  currentMainPage = 0;
  currentRankingPage = 0;

  displayedColumns: string[] = ['cagriId', 'asistanAdiSoyadi', 'cagriTarihi', 'cagriSuresi', 'degerlendirmePuani'];

  selectedSpeech: EvaluationData | null = null;
  selectedEvaluation: EvaluationData | null = null;
  showSpeechDetail: boolean = false;
  
  // Arama kutusu görünürlüğü için yeni değişken
  searchVisible: boolean = false;

  evaluationDataSource = new MatTableDataSource<EvaluationData>();
  evaluationDisplayedColumns: string[] = [
    'cagriId',
    'degerlendirmeDurumu',
    'asistanSicil',
    'asistanAdiSoyadi',
    'cagriTarihi',
    'cagriSuresi',
    'degerlendireninAdi',
    'degerlendirmeNo',
    'degerlendirmePuani'
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Expansion panel states
  dailyPanelExpanded = true;
  weeklyPanelExpanded = false;
  monthlyPanelExpanded = false;

  filterValues: any = {
    asistanAdiSoyadi: '',
    asistanSicil: '',
    cagriId: '',
    degerlendireninAdi: '',
    degerlendirmeDurumu: '',
    puanMin: null,
    puanMax: null,
    tarihMin: null,
    tarihMax: null
  };
  filteredData: EvaluationData[] = [];
  
  // Arama özelliği için yeni değişken
  searchQuery: string = '';
  allData: EvaluationData[] = []; // Orijinal veri kaynağı

  // Add property to control filter visibility
  showFilters: boolean = false;

  // Page transition animation flag
  isPageTransitioning: boolean = false;

  constructor(
    private evaluationService: EvaluationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    this.evaluationDataSource.sort = this.sort;
    this.evaluationDataSource.paginator = this.paginator;
    
    // Configure sorting
    this.evaluationDataSource.sortingDataAccessor = (item, property) => {
      switch(property) {
        case 'cagriTarihi': return new Date(item.cagriTarihi).getTime();
        case 'degerlendirmePuani': return item.degerlendirmePuani;
        case 'cagriSuresi': return Number(item.cagriSuresi);
        default: return String(item[property as keyof EvaluationData]);
      }
    };
  }

  loadData() {
    this.evaluationService.getEvaluations().subscribe(data => {
      this.evaluationDataSource.data = data;
      this.filteredData = data;
      this.allData = data; // Orijinal veriyi sakla
      this.applyFilters();
      
      // Get daily, weekly, monthly data without sorting again
      // (Backend already returns data in the desired sort order)
      // Filter and sort data for daily rankings (last 24 hours)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      this.dailySpeeches = data
        .filter(evaluation => new Date(evaluation.cagriTarihi) >= oneDayAgo);
        // No longer sorting here as backend returns in the desired order

      // Filter and sort data for weekly rankings (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      this.weeklySpeeches = data
        .filter(evaluation => new Date(evaluation.cagriTarihi) >= oneWeekAgo);
        // No longer sorting here as backend returns in the desired order

      // Filter and sort data for monthly rankings (last 30 days)
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      this.monthlySpeeches = data
        .filter(evaluation => new Date(evaluation.cagriTarihi) >= oneMonthAgo);
        // No longer sorting here as backend returns in the desired order
    });
  }

  applyFilters() {
    console.log('applyFilters called', this.filterValues);
    let data = this.evaluationDataSource.data;
    this.filteredData = data.filter(item => {
      const matchesOperator = !this.filterValues.asistanAdiSoyadi || (item.asistanAdiSoyadi || '').toLowerCase().includes(this.filterValues.asistanAdiSoyadi.toLowerCase());
      const matchesSicil = !this.filterValues.asistanSicil || (item.asistanSicil || '').toString().includes(this.filterValues.asistanSicil);
      const matchesCagriId = !this.filterValues.cagriId || (item.cagriId || '').toString().includes(this.filterValues.cagriId);
      const matchesDegerlendiren = !this.filterValues.degerlendireninAdi || (item.degerlendireninAdi || '').toLowerCase().includes(this.filterValues.degerlendireninAdi.toLowerCase());
      const matchesDurum = !this.filterValues.degerlendirmeDurumu || (item.degerlendirmeDurumu || '').toLowerCase().includes(this.filterValues.degerlendirmeDurumu.toLowerCase());
      const matchesPuanMin = this.filterValues.puanMin == null || item.degerlendirmePuani >= this.filterValues.puanMin;
      const matchesPuanMax = this.filterValues.puanMax == null || item.degerlendirmePuani <= this.filterValues.puanMax;
      const matchesTarihMin = !this.filterValues.tarihMin || new Date(item.cagriTarihi) >= new Date(this.filterValues.tarihMin);
      const matchesTarihMax = !this.filterValues.tarihMax || new Date(item.cagriTarihi) <= new Date(this.filterValues.tarihMax);
      return matchesOperator && matchesSicil && matchesCagriId && matchesDegerlendiren && matchesDurum && matchesPuanMin && matchesPuanMax && matchesTarihMin && matchesTarihMax;
    });
    this.currentMainPage = 0;
  }

  clearFilters() {
    this.filterValues = {
      asistanAdiSoyadi: '',
      asistanSicil: '',
      cagriId: '',
      degerlendireninAdi: '',
      degerlendirmeDurumu: '',
      puanMin: null,
      puanMax: null,
      tarihMin: null,
      tarihMax: null
    };
    this.applyFilters();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  onRowClick(speech: EvaluationData) {
    this.selectedSpeech = speech;
    // Fetch detailed evaluation data to ensure transkript is loaded
    this.evaluationService.getEvaluationById(speech.cagriId).subscribe(detailedEvaluation => {
      this.selectedEvaluation = detailedEvaluation;
      this.showSpeechDetail = true;
    }, error => {
      console.error('Error fetching detailed evaluation data:', error);
      // Fallback to the initially loaded data if detail fetch fails
      this.selectedEvaluation = speech; 
      this.showSpeechDetail = true;
    });
  }

  onEvaluationRowClick(evaluation: EvaluationData) {
    // Fetch detailed evaluation data to ensure transkript is loaded
    this.evaluationService.getEvaluationById(evaluation.cagriId).subscribe(detailedEvaluation => {
      console.log("Selected evaluation - FULL DATA:", JSON.stringify(detailedEvaluation));
      console.log("Audio path type:", typeof detailedEvaluation.sesDosyasi);
      console.log("Audio file path:", detailedEvaluation.sesDosyasi);
      
      this.selectedEvaluation = detailedEvaluation;
      this.showSpeechDetail = true;
      
      // Parse filtered words if they exist
      this.parseFilteredWords(detailedEvaluation);
    }, error => {
      console.error('Error fetching detailed evaluation data:', error);
      // Fallback to the initially loaded data if detail fetch fails
      this.selectedEvaluation = evaluation;
      this.showSpeechDetail = true;
    });
  }

  // Parse filtered profanity words from JSON data
  parseFilteredWords(evaluation: EvaluationData) {
    this.filteredWords = [];
    
    if (evaluation && evaluation.filtrelihKelimeler) {
      try {
        // Parse the JSON string into an object
        const filteredWordsData = JSON.parse(evaluation.filtrelihKelimeler);
        
        // Transform the object into a format that's easier to display
        this.filteredWords = Object.keys(filteredWordsData).map(word => {
          const wordData = filteredWordsData[word];
          return {
            word: word,
            count: wordData.count, // Artık doğrudan count değerini alıyoruz
            occurrences: wordData.occurrences // Occurrences dizisini doğrudan alıyoruz
          };
        });
        
        console.log('Parsed filtered words:', this.filteredWords);
      } catch (e) {
        console.error('Error parsing filtered words JSON:', e);
        this.filteredWords = [];
      }
    }
  }

  // Format seconds to MM:SS format
  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;
    
    return `${formattedMinutes}:${formattedSeconds}`;
  }

  goBackToList() {
    this.selectedEvaluation = null;
    this.showSpeechDetail = false;
    
    // Reinitialize sorting after returning to list view
    setTimeout(() => {
      this.evaluationDataSource.sort = this.sort;
      this.evaluationDataSource.paginator = this.paginator;
      
      // Reconfigure sorting
      this.evaluationDataSource.sortingDataAccessor = (item, property) => {
        switch(property) {
          case 'cagriTarihi': return new Date(item.cagriTarihi).getTime();
          case 'degerlendirmePuani': return item.degerlendirmePuani;
          case 'cagriSuresi': return Number(item.cagriSuresi);
          default: return String(item[property as keyof EvaluationData]);
        }
      };
    });
  }

  // Pagination handlers
  onMainPageChange(event: PageEvent) {
    // Apply animation when page changes via paginator
    if (this.currentMainPage !== event.pageIndex) {
      this.isPageTransitioning = true;
      // Reset animation state after animation completes
      setTimeout(() => {
        this.isPageTransitioning = false;
      }, 500); // Allow time for the animation to complete
    }
    
    this.currentMainPage = event.pageIndex;
  }

  onRankingPageChange(event: PageEvent) {
    this.currentRankingPage = event.pageIndex;
  }

  // Get paginated data for each table
  getMainTableData() {
    // Make sure we're working with the filtered data
    console.log('Getting table data - filtered count:', this.filteredData.length);
    console.log('Current filter values:', this.filterValues);
    
    let data = this.filteredData.slice();
    // Apply sorting manually if sort is active
    if (this.sort && this.sort.active && this.sort.direction !== '') {
      const active = this.sort.active;
      const direction = this.sort.direction;
      data = data.sort((a, b) => {
        let valueA = this.evaluationDataSource.sortingDataAccessor(a, active);
        let valueB = this.evaluationDataSource.sortingDataAccessor(b, active);
        if (valueA == null) valueA = '';
        if (valueB == null) valueB = '';
        const comparatorResult = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        return direction === 'asc' ? comparatorResult : -comparatorResult;
      });
    }
    const start = this.currentMainPage * this.MAIN_TABLE_ITEMS;
    return data.slice(start, start + this.MAIN_TABLE_ITEMS);
  }

  getDailyPaginatedData() {
    const start = this.currentRankingPage * this.RANKING_TABLE_ITEMS;
    return this.dailySpeeches.slice(start, start + this.RANKING_TABLE_ITEMS);
  }

  getWeeklyPaginatedData() {
    const start = this.currentRankingPage * this.RANKING_TABLE_ITEMS;
    return this.weeklySpeeches.slice(start, start + this.RANKING_TABLE_ITEMS);
  }

  getMonthlyPaginatedData() {
    const start = this.currentRankingPage * this.RANKING_TABLE_ITEMS;
    return this.monthlySpeeches.slice(start, start + this.RANKING_TABLE_ITEMS);
  }

  // Expansion panel event handlers
  onDailyPanelChange(event: any) {
    this.dailyPanelExpanded = event.expanded;
  }

  onWeeklyPanelChange(event: any) {
    this.weeklyPanelExpanded = event.expanded;
  }

  onMonthlyPanelChange(event: any) {
    this.monthlyPanelExpanded = event.expanded;
  }

  // Pagination methods
  getLastPage(): number {
    return Math.ceil(this.filteredData.length / this.MAIN_TABLE_ITEMS) - 1;
  }

  getPageNumbersDropdown(): number[] {
    return Array.from({ length: this.getLastPage() + 1 }, (_, i) => i);
  }

  goToPage(page: number) {
    if (page >= 0 && page <= this.getLastPage()) {
      // Apply animation when page changes
      if (this.currentMainPage !== page) {
        this.isPageTransitioning = true;
        // Reset animation state after animation completes
        setTimeout(() => {
          this.isPageTransitioning = false;
        }, 500); // Allow time for the animation to complete
      }
      
      this.currentMainPage = page;
      this.onMainPageChange({ pageIndex: page, pageSize: this.MAIN_TABLE_ITEMS, length: this.filteredData.length } as PageEvent);
    }
  }

  // Get visible page numbers for pagination
  getVisiblePageNumbers(): number[] {
    const totalPages = this.getLastPage() + 1;
    
    // If we have 7 or fewer pages, show all of them
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    
    // Otherwise, show a window of pages around the current page
    let startPage = Math.max(0, this.currentMainPage - 2);
    let endPage = Math.min(totalPages - 1, this.currentMainPage + 2);
    
    // Adjust start and end to always show 5 numbers if possible
    if (startPage === 0) {
      endPage = Math.min(4, totalPages - 1);
    }
    if (endPage === totalPages - 1) {
      startPage = Math.max(0, totalPages - 5);
    }

    // Create array with page numbers
    const visiblePages = [];
    
    // Always include first page
    if (startPage > 0) {
      visiblePages.push(0);
      if (startPage > 1) {
        visiblePages.push(-1); // -1 represents ellipsis
      }
    }
    
    // Add pages from start to end
    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }
    
    // Always include last page
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        visiblePages.push(-1); // -1 represents ellipsis
      }
      visiblePages.push(totalPages - 1);
    }
    
    return visiblePages;
  }

  // Arama işlevleri
  applySearch() {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      // Eğer arama sorgusu yoksa, filtreleri uygula
      this.loadData();
      this.applyFilters();
      return;
    }

    const query = this.searchQuery.toLowerCase();
    
    // Tüm alanlarda arama yap
    this.filteredData = this.allData.filter(item => {
      return (
        (item.asistanAdiSoyadi?.toLowerCase().includes(query)) || 
        (item.asistanSicil?.toString().includes(query)) || 
        (item.cagriId?.toString().includes(query)) || 
        (item.degerlendireninAdi?.toLowerCase().includes(query)) || 
        (item.degerlendirmeDurumu?.toLowerCase().includes(query)) ||
        (item.degerlendirmeNo?.toString().includes(query)) ||
        (item.degerlendirmePuani?.toString().includes(query)) ||
        (item.cagriSuresi?.toString().includes(query)) ||
        (new Date(item.cagriTarihi).toLocaleString().toLowerCase().includes(query))
      );
    });
    
    this.currentMainPage = 0; // İlk sayfaya dön
  }

  clearSearch() {
    this.searchQuery = '';
    this.loadData();
    this.applyFilters();
  }
  
  // Arama kutusu görünürlüğünü kontrol eden metot
  toggleSearch() {
    this.searchVisible = !this.searchVisible;
    if (!this.searchVisible && this.searchQuery) {
      // Arama kutusu kapandığında aramayı temizle
      this.clearSearch();
    }
  }
  
  // Audio visualizer kontrolü için eklenen metod
  playPauseAudio() {
    if (this.audioVisualizer && this.selectedEvaluation) {
      this.audioVisualizer.playPause();
      // Görsel durum güncellemesi için oynatma durumunu senkronize et
      this.isPlaying = this.audioVisualizer.isPlaying;
    }
  }
  
  // Ses dosyasının hazır olma durumunu takip etmek için
  onAudioReadyChange(value: boolean) {
    console.log('Audio ready state changed:', value);
    this.audioReady = value;
    
    // Ses dosyasının oynatma durumunu senkronize et
    if (this.audioVisualizer) {
      this.isPlaying = this.audioVisualizer.isPlaying;
    }
  }
}
