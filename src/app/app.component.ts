import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AudioVisualizerComponent } from './audio-visualizer/audio-visualizer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AudioVisualizerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'auth-demo';
}
