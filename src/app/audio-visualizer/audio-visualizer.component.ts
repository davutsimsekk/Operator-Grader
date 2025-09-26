import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';

@Component({
  selector: 'app-audio-visualizer',
  templateUrl: './audio-visualizer.component.html',
  styleUrls: ['./audio-visualizer.component.css']
})
export class AudioVisualizerComponent implements AfterViewInit, OnChanges {
  @ViewChild('waveform', { static: false }) waveform!: ElementRef;
  @Input() audioSource: string = '/assets/sample.mp3'; // Varsayılan ses dosyası
  @Input() audioReady: boolean = false; // Ses dosyasının hazır olup olmadığını kontrol etmek için
  @Output() audioReadyChange = new EventEmitter<boolean>(); // For two-way binding
  @Input() evaluation: any; // Değerlendirme nesnesi

  wavesurfer!: WaveSurfer;
  isPlaying: boolean = false; // Oynatma durumunu takip etmek için
  regionsPlugin!: any;
  isAudioReady: boolean = false; // Ses dosyasının yüklenip yüklenmediğini takip eder
  
  // Süre bilgisi için değişkenler
  currentTime: number = 0;
  duration: number = 0;
  formattedCurrentTime: string = '00:00';
  formattedDuration: string = '00:00';
  
  constructor(private cdr: ChangeDetectorRef) {} // ✅ Change detection service
  
  ngOnChanges(changes: SimpleChanges): void {
    // Ses kaynağı değiştiğinde dalga formunu güncelle
    if ((changes['audioSource'] || changes['evaluation']) && this.wavesurfer) {
      this.loadAudio();
    }
  }
  
  ngAfterViewInit() {
    console.log('Initializing WaveSurfer...');

    this.wavesurfer = WaveSurfer.create({
      container: this.waveform.nativeElement,
      waveColor: '#3498db', // Mavi dalga rengi - dashboard temasına uygun
      progressColor: '#e74c3c', // Kırmızı ilerleme rengi - dashboard temasına uygun
      cursorColor: 'rgba(0, 0, 0, 0.5)', // Yarı saydam siyah imleç
      barWidth: 2, // Daha ince çubuklar
      barGap: 1, // Çubuklar arası boşluk
      barRadius: 2, // Yuvarlatılmış çubuk kenarları
      autoCenter: true,
      height: 100,
      backend: 'MediaElement', // Use MediaElement for compatibility
      normalize: true, // Dalga formunu normalize et
    });
    console.log('WaveSurfer instance:', this.wavesurfer);

    // ✅ Register Regions Plugin
    this.regionsPlugin = this.wavesurfer.registerPlugin(RegionsPlugin.create());

    // ✅ Force Angular to detect changes (important)
    // this.cdr.detectChanges();

    // Ses dosyasını yükle
    this.loadAudio();

    this.wavesurfer.on('ready', () => {
      console.log('WaveSurfer is ready!');
      this.isAudioReady = true;
      this.audioReady = true;
      this.audioReadyChange.emit(this.audioReady);
      
      // Toplam süre bilgisini al
      this.duration = this.wavesurfer.getDuration();
      this.formattedDuration = this.formatTime(this.duration);
      
      this.cdr.detectChanges();
    });

    this.wavesurfer.on('loading', (percent) => {
      console.log('WaveSurfer loading:', percent + '%');
    });

    this.wavesurfer.on('decode', (duration) => {
      console.log('WaveSurfer decoded, duration:', duration);
    });

    this.wavesurfer.on('play', () => {
      this.isPlaying = true;
      console.log('Audio is playing');
      this.cdr.detectChanges();
    });

    this.wavesurfer.on('pause', () => {
      this.isPlaying = false;
      console.log('Audio is paused');
      this.cdr.detectChanges();
    });

    this.wavesurfer.on('error', (err) => {
      console.error('WaveSurfer error:', err);
      console.error('Error details:', {
        audioSource: this.audioSource,
        evaluation: this.evaluation,
        error: err
      });
      
      this.isAudioReady = false;
      this.audioReady = false;
      this.audioReadyChange.emit(this.audioReady);
      this.cdr.detectChanges();
    });
    
    // Zaman güncellemesi için olay dinleyicisi
    this.wavesurfer.on('timeupdate', (currentTime) => {
      this.currentTime = currentTime;
      this.formattedCurrentTime = this.formatTime(currentTime);
      this.cdr.detectChanges();
    });
  }

  // Ses dosyasını yüklemek için ayrı bir method
  loadAudio() {
    if (this.wavesurfer) {
      let audioPath = this.audioSource; // Default path
      
      console.log("Original audio source:", this.audioSource);
      console.log("Original evaluation:", this.evaluation);
      
      // Check if we have an evaluation with a sound file path
      if (this.evaluation?.sesDosyasi) {
        const originalPath = this.evaluation.sesDosyasi;
        console.log("Original path from database:", originalPath);
        
        // Extract just the filename regardless of path format
        let filename = originalPath;
        
        // Handle file:/// URLs
        if (originalPath.includes('/')) {
          filename = originalPath.split('/').pop() || '';
        }
        // Handle backslash paths (Windows style)
        else if (originalPath.includes('\\')) {
          filename = originalPath.split('\\').pop() || '';
        }
        
        // Use the Flask endpoint to serve the audio file
        audioPath = `http://localhost:5000/audio/${filename}`;
        console.log("Converted to API path:", audioPath);
      }
      
      console.log('Loading audio from path:', audioPath);
      
      // Test the URL accessibility
      const testAudio = new Audio();
      testAudio.crossOrigin = 'anonymous';
      testAudio.src = audioPath;
      
      testAudio.addEventListener('canplay', () => {
        console.log('Test audio can play - URL is accessible');
      });
      
      testAudio.addEventListener('error', (e) => {
        console.error('Test audio failed to load:', e);
        console.error('Audio error details:', {
          error: testAudio.error,
          networkState: testAudio.networkState,
          readyState: testAudio.readyState
        });
      });
      
      // Yükleme başlamadan önce durumu sıfırla
      this.isAudioReady = false;
      this.audioReady = false;
      this.audioReadyChange.emit(this.audioReady);
      
      // Ses dosyasını yükle
      this.wavesurfer.load(audioPath);
    }
  }

  playPause() {
    try {
      if (!this.wavesurfer) {
        console.error('WaveSurfer is not initialized');
        return;
      }
      
      if (!this.isAudioReady) {
        console.log('Audio is not ready yet, waiting...');
        // Ses hazır olmadığında hata oluşmasını önlemek için
        this.wavesurfer.once('ready', () => {
          console.log('Audio is now ready, playing...');
          this.wavesurfer.playPause();
          this.isPlaying = !this.isPlaying;
          this.cdr.detectChanges();
        });
        return;
      }
      
      console.log('Toggling play/pause. Current state:', this.isPlaying ? 'Playing' : 'Paused');
      this.wavesurfer.playPause();
      this.isPlaying = !this.isPlaying;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error in playPause:', error);
    }
  }

  addRedRegion(start: number, end: number) {
    if (this.regionsPlugin) {
      this.regionsPlugin.addRegion({
        start: start,
        end: end,
        color: 'rgba(255, 0, 0, 0.3)',
      });
      console.log(`Added red region: ${start}s to ${end}s`);
    } else {
      console.error('Regions plugin is not initialized');
    }
  }
  
  // Saniyeyi dakika:saniye formatına dönüştürmek için yardımcı fonksiyon
  formatTime(timeInSeconds: number): string {
    if (isNaN(timeInSeconds) || timeInSeconds === Infinity) {
      return '00:00';
    }
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    
    return `${formattedMinutes}:${formattedSeconds}`;
  }

  recreateWithMediaElement() {
    try {
      // Destroy existing wavesurfer
      if (this.wavesurfer) {
        this.wavesurfer.destroy();
      }

      // Create new wavesurfer with MediaElement backend
      this.wavesurfer = WaveSurfer.create({
        container: this.waveform.nativeElement,
        waveColor: '#3498db',
        progressColor: '#e74c3c',
        cursorColor: 'rgba(0, 0, 0, 0.5)',
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        autoCenter: true,
        height: 100,
        backend: 'MediaElement', // Use MediaElement as fallback
        normalize: true,
      });

      // Re-register events but without the error fallback to prevent infinite loop
      this.wavesurfer.on('ready', () => {
        console.log('WaveSurfer (MediaElement) is ready!');
        this.isAudioReady = true;
        this.audioReady = true;
        this.audioReadyChange.emit(this.audioReady);
        
        this.duration = this.wavesurfer.getDuration();
        this.formattedDuration = this.formatTime(this.duration);
        
        this.cdr.detectChanges();
      });

      this.wavesurfer.on('play', () => {
        this.isPlaying = true;
        this.cdr.detectChanges();
      });

      this.wavesurfer.on('pause', () => {
        this.isPlaying = false;
        this.cdr.detectChanges();
      });

      this.wavesurfer.on('timeupdate', (currentTime) => {
        this.currentTime = currentTime;
        this.formattedCurrentTime = this.formatTime(currentTime);
        this.cdr.detectChanges();
      });

      // Load the audio again
      this.loadAudio();
      
    } catch (error) {
      console.error('Error recreating WaveSurfer with MediaElement:', error);
    }
  }
}
