import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';

@Component({
  selector: 'app-audio-visualizer',
  templateUrl: './audio-visualizer.component.html',
  styleUrls: ['./audio-visualizer.component.css']
})
export class AudioVisualizerComponent implements AfterViewInit {
  @ViewChild('waveform', { static: false }) waveform!: ElementRef;

  wavesurfer!: WaveSurfer;
  
  regionsPlugin!: any;
  constructor(private cdr: ChangeDetectorRef) {} // ✅ Change detection service
  ngAfterViewInit() {
    console.log('Initializing WaveSurfer...');



    this.wavesurfer = WaveSurfer.create({
      container: this.waveform.nativeElement,
      waveColor: 'blue',
      progressColor: 'red',
      cursorColor: 'black',
      barWidth: 3,
      autoCenter: true,
      height: 100,
      backend: 'MediaElement',
    });
    console.log('WaveSurfer instance:', this.wavesurfer);


    // ✅ Register Regions Plugin
    this.regionsPlugin = this.wavesurfer.registerPlugin(RegionsPlugin.create());

    // ✅ Force Angular to detect changes (important)
    // this.cdr.detectChanges();

    // ✅ Load the audio file
    this.wavesurfer.load('/assets/sample.mp3');


    this.wavesurfer.on('ready', () => {
      console.log('WaveSurfer is ready!');
      this.addRedRegion(0, 5);
    });

    this.wavesurfer.on('error', (err) => {
      console.error('WaveSurfer error:', err);
    });
  }

  playPause() {
    this.wavesurfer.playPause();
  }

  addRedRegion(start: number, end: number) {
    if (this.regionsPlugin) {
      this.regionsPlugin.addRegion({
        start: start,
        end: end,
        color: 'rgba(255, 0, 0, 0.5)',
      });
      console.log(`Added red region: ${start}s to ${end}s`);
    } else {
      console.error('Regions plugin is not initialized');
    }
  }
}
