import { Component } from '@angular/core';
import { Properties } from './models/properties.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'rudy-wumpus-game';

  play: boolean = false;
  tableProperties: any;

  onPlay(event: Properties): void {
    this.play = true;
    this.tableProperties = event;
  }

  onGoToMenu(): void {
    this.play = false;
  }
}
