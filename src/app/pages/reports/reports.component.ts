import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { EvaluationService, EvaluationData } from '../../services/evaluation.service';

// Interface for Call Data
interface CallData {
  id: string;
  operatorId: string;
  operatorName: string;
  timestamp: Date;
  duration: number; // in seconds
  score: number; // 0-100
  satisfaction: number; // 0-100 percentage
}

// Interface for Operator Performance Data
interface OperatorPerformance {
  id: string;
  name: string;
  averageScore: number;
  callsHandled: number;
  customerSatisfaction: number;
  responseTime: number; // in seconds
  trend: number; // percentage change
}

// Interface for Summary Data
interface SummaryData {
  totalCalls: number;
  totalCallsChange: number;
  averageCallTime: string;
  averageCallTimeChange: number;
  customerSatisfaction: number;
  customerSatisfactionChange: number;
  averageScore: number;
  averageScoreChange: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    NgChartsModule
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  // Expose Math to template
  Math = Math;

  // Time period selection
  periods: string[] = ['day', 'week', 'month', 'quarter', 'year'];
  selectedPeriod: string = 'week';
  
  // Date range
  startDate: Date = new Date();
  endDate: Date = new Date();
  
  // Data
  callData: CallData[] = [];
  filteredData: CallData[] = [];
  comparisonData: CallData[] = []; // Data from previous period
  
  // Loading state
  isLoading: boolean = true;
  
  // Summary data
  summary: SummaryData = {
    totalCalls: 0,
    totalCallsChange: 0,
    averageCallTime: '0:00',
    averageCallTimeChange: 0,
    customerSatisfaction: 0,
    customerSatisfactionChange: 0,
    averageScore: 0,
    averageScoreChange: 0
  };
  
  // Operator performance table
  operatorPerformanceData: OperatorPerformance[] = [];
  displayedColumns: string[] = ['name', 'averageScore', 'callsHandled', 'customerSatisfaction', 'responseTime', 'trend'];
  
  // Performance Chart
  performanceChartType: ChartType = 'line';
  performanceChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      { 
        data: [], 
        label: 'Ortalama Puan',
        borderColor: 'rgb(63, 81, 181)',
        backgroundColor: 'rgba(63, 81, 181, 0.2)'
      },
      { 
        data: [], 
        label: 'Müşteri Memnuniyeti',
        borderColor: 'rgb(76, 175, 80)',
        backgroundColor: 'rgba(76, 175, 80, 0.2)'
      }
    ]
  };
  
  performanceChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(0,0,0,0.05)',
          display: true
        },
        ticks: {
          color: '#7f8c8d',
          padding: 10,
          font: {
            size: 14
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#7f8c8d',
          padding: 10,
          font: {
            size: 14
          },
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
    layout: {
      padding: {
        left: 20,
        right: 30,
        top: 30,
        bottom: 20
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'center',
        labels: {
          boxWidth: 16,
          padding: 25,
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: {
          size: 15
        },
        bodyFont: {
          size: 14
        },
        padding: 15,
        cornerRadius: 4
      }
    }
  };
  
  constructor(private evaluationService: EvaluationService) {
    // Initialize dates
    this.setDefaultDates();
  }
  
  ngOnInit(): void {
    this.fetchData();
  }
  
  // Initialize dates based on current period
  setDefaultDates(): void {
    this.startDate = new Date();
    
    // Set start date based on selected period
    switch (this.selectedPeriod) {
      case 'day':
        // Today
        this.startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        // Beginning of current week (Monday)
        const day = this.startDate.getDay();
        const diff = this.startDate.getDate() - day + (day === 0 ? -6 : 1);
        this.startDate = new Date(this.startDate.setDate(diff));
        this.startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        // Beginning of current month
        this.startDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), 1);
        break;
      case 'quarter':
        // Beginning of current quarter
        const quarter = Math.floor(this.startDate.getMonth() / 3);
        this.startDate = new Date(this.startDate.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        // Beginning of current year
        this.startDate = new Date(this.startDate.getFullYear(), 0, 1);
        break;
    }
    
    // Set end date to today
    this.endDate = new Date();
    this.endDate.setHours(23, 59, 59, 999);
  }
  
  // Fetch data from API
  fetchData(): void {
    this.isLoading = true;
    
    this.evaluationService.getEvaluations().subscribe(
      (data: EvaluationData[]) => {
        this.callData = data.map(item => ({
          id: item.cagriId,
          operatorId: item.asistanSicil,
          operatorName: item.asistanAdiSoyadi,
          timestamp: new Date(item.cagriTarihi),
          // Convert HH:MM format to seconds
          duration: this.timeToSeconds(item.cagriSuresi),
          score: item.degerlendirmePuani,
          // For now, use the score as satisfaction since we don't have separate satisfaction data
          satisfaction: item.degerlendirmePuani
        }));
        
        // Apply date filter
        this.applyDateFilter();
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error fetching evaluation data:', error);
        // Use mock data in case of error
        this.callData = this.generateMockData();
        this.applyDateFilter();
        this.isLoading = false;
      }
    );
  }

  // Helper function to convert HH:MM format to seconds
  private timeToSeconds(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60 * 60) + (minutes * 60);
  }
  
  // Update period and recalculate dates
  updatePeriod(period: string): void {
    this.selectedPeriod = period;
    this.setDefaultDates();
    this.applyDateFilter();
  }
  
  // When start date changed, update end date based on period
  onStartDateChanged(): void {
    // Calculate end date based on period
    this.endDate = new Date(this.startDate);
    
    switch (this.selectedPeriod) {
      case 'day':
        this.endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        this.endDate = new Date(this.startDate);
        this.endDate.setDate(this.endDate.getDate() + 6);
        this.endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        this.endDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 1, 0);
        this.endDate.setHours(23, 59, 59, 999);
        break;
      case 'quarter':
        this.endDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 3, 0);
        this.endDate.setHours(23, 59, 59, 999);
        break;
      case 'year':
        this.endDate = new Date(this.startDate.getFullYear(), 11, 31);
        this.endDate.setHours(23, 59, 59, 999);
        break;
    }
    
    this.applyDateFilter();
  }
  
  // Apply date filter to data
  applyDateFilter(): void {
    // Filter data based on date range
    this.filteredData = this.callData.filter(item => 
      item.timestamp >= this.startDate && item.timestamp <= this.endDate
    );
    
    // Get comparison data from previous period
    const periodLength = this.endDate.getTime() - this.startDate.getTime();
    const prevStartDate = new Date(this.startDate.getTime() - periodLength);
    const prevEndDate = new Date(this.startDate.getTime() - 1);
    
    this.comparisonData = this.callData.filter(item => 
      item.timestamp >= prevStartDate && item.timestamp <= prevEndDate
    );
    
    // Update summary
    this.updateSummary(this.filteredData, this.comparisonData);
    
    // Update operator performance table
    this.updateOperatorPerformance();
    
    // Update chart
    this.updatePerformanceChart();
  }

  // Update summary cards with real data
  updateSummary(filteredData: CallData[], comparisonData: CallData[]): void {
    // Total calls
    const totalCalls = filteredData.length;
    const previousTotalCalls = comparisonData.length;
    const totalCallsChange = previousTotalCalls > 0 
      ? Math.round(((totalCalls - previousTotalCalls) / previousTotalCalls) * 100) 
      : 0;
    
    // Average call time (in seconds)
    const totalDuration = filteredData.reduce((sum, item) => sum + item.duration, 0);
    const averageCallTime = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;
    
    const previousTotalDuration = comparisonData.reduce((sum, item) => sum + item.duration, 0);
    const previousAverageCallTime = previousTotalCalls > 0 ? Math.round(previousTotalDuration / previousTotalCalls) : 0;
    const averageCallTimeChange = previousAverageCallTime > 0 
      ? Math.round(((averageCallTime - previousAverageCallTime) / previousAverageCallTime) * 100) 
      : 0;
    
    // Format average call time as MM:SS
    const averageCallTimeFormatted = `${Math.floor(averageCallTime / 60)}:${(averageCallTime % 60).toString().padStart(2, '0')}`;
    
    // Customer satisfaction
    const totalSatisfaction = filteredData.reduce((sum, item) => sum + item.satisfaction, 0);
    const customerSatisfaction = totalCalls > 0 ? Math.round(totalSatisfaction / totalCalls) : 0;
    
    const previousTotalSatisfaction = comparisonData.reduce((sum, item) => sum + item.satisfaction, 0);
    const previousCustomerSatisfaction = previousTotalCalls > 0 ? Math.round(previousTotalSatisfaction / previousTotalCalls) : 0;
    const customerSatisfactionChange = previousCustomerSatisfaction > 0 
      ? Math.round(((customerSatisfaction - previousCustomerSatisfaction) / previousCustomerSatisfaction) * 100) 
      : 0;
    
    // Average score
    const totalScore = filteredData.reduce((sum, item) => sum + item.score, 0);
    const averageScore = totalCalls > 0 ? Math.round(totalScore / totalCalls) : 0;
    
    const previousTotalScore = comparisonData.reduce((sum, item) => sum + item.score, 0);
    const previousAverageScore = previousTotalCalls > 0 ? Math.round(previousTotalScore / previousTotalCalls) : 0;
    const averageScoreChange = previousAverageScore > 0 
      ? Math.round(((averageScore - previousAverageScore) / previousAverageScore) * 100) 
      : 0;
    
    // Update summary object
    this.summary = {
      totalCalls,
      totalCallsChange,
      averageCallTime: averageCallTimeFormatted,
      averageCallTimeChange,
      customerSatisfaction,
      customerSatisfactionChange,
      averageScore,
      averageScoreChange
    };
  }
  
  // Update operator performance table
  updateOperatorPerformance(): void {
    // Group data by operator
    const operatorMap = new Map<string, CallData[]>();
    
    this.filteredData.forEach(call => {
      if (!operatorMap.has(call.operatorId)) {
        operatorMap.set(call.operatorId, []);
      }
      operatorMap.get(call.operatorId)?.push(call);
    });
    
    // Calculate performance metrics for each operator
    this.operatorPerformanceData = Array.from(operatorMap.entries()).map(([operatorId, calls]) => {
      const totalCalls = calls.length;
      const totalScore = calls.reduce((sum, call) => sum + call.score, 0);
      const averageScore = Math.round(totalScore / totalCalls);
      
      const totalSatisfaction = calls.reduce((sum, call) => sum + call.satisfaction, 0);
      const customerSatisfaction = Math.round(totalSatisfaction / totalCalls);
      
      const totalResponseTime = calls.reduce((sum, call) => sum + call.duration, 0);
      const responseTime = Math.round(totalResponseTime / totalCalls);
      
      // Calculate trend by comparing with previous period
      const previousCalls = this.comparisonData.filter(call => call.operatorId === operatorId);
      const previousTotalScore = previousCalls.reduce((sum, call) => sum + call.score, 0);
      const previousAverageScore = previousCalls.length > 0 ? Math.round(previousTotalScore / previousCalls.length) : 0;
      
      const trend = previousAverageScore > 0 
        ? Math.round(((averageScore - previousAverageScore) / previousAverageScore) * 100)
        : 0;
      
      return {
        id: operatorId,
        name: calls[0].operatorName,
        averageScore,
        callsHandled: totalCalls,
        customerSatisfaction,
        responseTime,
        trend
      };
    });
    
    // Sort by average score (highest first)
    this.operatorPerformanceData.sort((a, b) => b.averageScore - a.averageScore);
  }
  
  // Update performance chart
  updatePerformanceChart(): void {
    // Group data by date
    const dateMap = new Map<string, CallData[]>();
    
    // Determine the date format and grouping based on period
    let dateFormat: (date: Date) => string;
    let labelFormat: (dateStr: string) => string;
    
    switch (this.selectedPeriod) {
      case 'day':
        // Group by hour
        dateFormat = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}`;
        labelFormat = (dateStr) => {
          const parts = dateStr.split('-');
          return `${parts[3]}:00`;
        };
        break;
      case 'week':
        // Group by day
        dateFormat = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        labelFormat = (dateStr) => {
          const parts = dateStr.split('-');
          return `${parts[2]}/${parts[1]}`;
        };
        break;
      case 'month':
        // Group by day
        dateFormat = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        labelFormat = (dateStr) => {
          const parts = dateStr.split('-');
          return `${parts[2]}/${parts[1]}`;
        };
        break;
      case 'quarter':
        // Group by week
        dateFormat = (date) => {
          const startOfYear = new Date(date.getFullYear(), 0, 1);
          const weekNum = Math.floor((date.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));
          return `${date.getFullYear()}-W${weekNum}`;
        };
        labelFormat = (dateStr) => {
          const parts = dateStr.split('-');
          return parts[1];
        };
        break;
      case 'year':
        // Group by month
        dateFormat = (date) => `${date.getFullYear()}-${date.getMonth() + 1}`;
        labelFormat = (dateStr) => {
          const parts = dateStr.split('-');
          const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                              'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
          return monthNames[parseInt(parts[1]) - 1];
        };
        break;
      default:
        // Default to day
        dateFormat = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        labelFormat = (dateStr) => {
          const parts = dateStr.split('-');
          return `${parts[2]}/${parts[1]}`;
        };
    }
    
    // Group data
    this.filteredData.forEach(call => {
      const dateKey = dateFormat(call.timestamp);
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }
      dateMap.get(dateKey)?.push(call);
    });
    
    // Sort dates
    const sortedDates = Array.from(dateMap.keys()).sort();
    
    // Calculate average metrics for each date
    const labels = sortedDates.map(dateStr => labelFormat(dateStr));
    const scoreData = sortedDates.map(dateStr => {
      const calls = dateMap.get(dateStr) || [];
      const totalScore = calls.reduce((sum, call) => sum + call.score, 0);
      return calls.length > 0 ? Math.round(totalScore / calls.length) : 0;
    });
    
    const satisfactionData = sortedDates.map(dateStr => {
      const calls = dateMap.get(dateStr) || [];
      const totalSatisfaction = calls.reduce((sum, call) => sum + call.satisfaction, 0);
      return calls.length > 0 ? Math.round(totalSatisfaction / calls.length) : 0;
    });
    
    // Update chart data
    this.performanceChartData = {
      labels,
      datasets: [
        { 
          data: scoreData, 
          label: 'Ortalama Puan',
          borderColor: 'rgb(63, 81, 181)',
          backgroundColor: 'rgba(63, 81, 181, 0.2)'
        },
        { 
          data: satisfactionData, 
          label: 'Müşteri Memnuniyeti',
          borderColor: 'rgb(76, 175, 80)',
          backgroundColor: 'rgba(76, 175, 80, 0.2)'
        }
      ]
    };
  }
  
  // Get icon for trend
  getTrendIcon(value: number): string {
    if (value > 0) {
      return 'trending_up';
    } else if (value < 0) {
      return 'trending_down';
    } else {
      return 'trending_flat';
    }
  }
  
  // Get CSS class for trend color
  getTrendColor(value: number): string {
    if (value > 0) {
      return 'positive-trend';
    } else if (value < 0) {
      return 'negative-trend';
    } else {
      return 'neutral-trend';
    }
  }
  
  // Export report as CSV
  exportReport(): void {
    // Format current date for filename
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Add summary section
    csvContent += 'Özet Rapor\n';
    csvContent += `Tarih Aralığı,${this.startDate.toLocaleDateString('tr-TR')} - ${this.endDate.toLocaleDateString('tr-TR')}\n`;
    csvContent += `Toplam Çağrı Sayısı,${this.summary.totalCalls}\n`;
    csvContent += `Ortalama Çağrı Süresi,${this.summary.averageCallTime}\n`;
    csvContent += `Müşteri Memnuniyeti,%${this.summary.customerSatisfaction}\n`;
    csvContent += `Ortalama Puan,${this.summary.averageScore}\n\n`;
    
    // Add operator performance section
    csvContent += 'Operatör Performansı\n';
    csvContent += 'Asistan,Ortalama Puan,Çağrı Sayısı,Müşteri Memnuniyeti,Yanıt Süresi\n';
    
    this.operatorPerformanceData.forEach(operator => {
      const responseTimeFormatted = `${Math.floor(operator.responseTime / 60)}:${(operator.responseTime % 60).toString().padStart(2, '0')}`;
      csvContent += `${operator.name},${operator.averageScore},${operator.callsHandled},%${operator.customerSatisfaction},${responseTimeFormatted}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rapor_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  // Generate mock data (fallback if API fails)
  generateMockData(): CallData[] {
    const mockData: CallData[] = [];
    
    // Generate data for the last 30 days
    const now = new Date();
    const operators = [
      { id: 'op1', name: 'Ahmet Yılmaz' },
      { id: 'op2', name: 'Ayşe Demir' },
      { id: 'op3', name: 'Mehmet Kaya' },
      { id: 'op4', name: 'Zeynep Çelik' }
    ];
    
    // Generate 100 random calls
    for (let i = 0; i < 100; i++) {
      // Random date in the last 60 days
      const date = new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000);
      
      // Random operator
      const operator = operators[Math.floor(Math.random() * operators.length)];
      
      // Random metrics
      const duration = Math.floor(Math.random() * 600) + 60; // 1-10 minutes
      const score = Math.floor(Math.random() * 40) + 60; // 60-100
      const satisfaction = Math.floor(Math.random() * 40) + 60; // 60-100
      
      mockData.push({
        id: `call-${i}`,
        operatorId: operator.id,
        operatorName: operator.name,
        timestamp: date,
        duration,
        score,
        satisfaction
      });
    }
    
    return mockData;
  }
}