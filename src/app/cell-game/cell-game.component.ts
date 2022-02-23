import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cell-game',
  templateUrl: './cell-game.component.html',
  styleUrls: ['./cell-game.component.scss']
})
export class CellGameComponent implements OnInit {

  @Input() row: Number = 0;
  @Input() col: Number = 0;
  @Input() roles: any[] = [];
  constructor() { }

  ngOnInit(): void {
  }

  get rolesToShow(): any[] {
    let isWell = this.roles.indexOf('Pozo') != -1;
    if(isWell) {
      return this.roles.filter(rol => rol == 'Pozo');
    }

    let isWumpus = this.roles.indexOf('Wumpus') != -1;
    if(isWumpus) {
      return this.roles.filter(rol => rol == 'Wumpus' || rol == 'Oro');
    }

    let isHunter = this.roles.indexOf('Cazador') != -1;
    if(isHunter) {
      return this.roles.filter(rol => rol == 'Cazador');
    }

    return this.roles;
  }

}
