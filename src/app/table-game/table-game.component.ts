import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  HostListener
} from '@angular/core';
import { Properties } from '../models/properties.model';

const getRandomPos = (min : number, max : number) => Math.floor(Math.random() * (max - min + 1)) + min;

@Component({
  selector: 'app-table-game',
  templateUrl: './table-game.component.html',
  styleUrls: ['./table-game.component.scss']
})
export class TableGameComponent implements OnInit,
OnDestroy {

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event : KeyboardEvent) {
    if(this.gameover) {
      return;
    }
    if (event.key == 'ArrowLeft') {
      switch (this.currentDirection) {
        case 'north':
          this.currentDirection = 'west'
          break;
        case 'west':
          this.currentDirection = 'south'
          break;
        case 'south':
          this.currentDirection = 'east'
          break;
        case 'east':
          this.currentDirection = 'north'
          break;
        default:
          break;
      }
    } else if (event.key == 'ArrowRight') {
      switch (this.currentDirection) {
        case 'north':
          this.currentDirection = 'east'
          break;
        case 'east':
          this.currentDirection = 'south'
          break;
        case 'south':
          this.currentDirection = 'west'
          break;
        case 'west':
          this.currentDirection = 'north'
          break;
        default:
          break;
      }
    } else if (event.key == ' ') {
      this.shootArrow();
    } else if (event.key == 'Enter') {
      this.moveHunter();

      this.isGameWon();
      if(this.gamewon) {
        return;
      }

      this.isGameOver();
    }
  }

  cellMatrix : any[] = [];
  @Input()
  properties!: Properties;

  idIntervalWumpus!: number;
  currentDirection : string = 'east';
  gamelog: string = '';
  gameover: boolean = false;
  gamewon: boolean = false;
  wumpusDead: boolean = false;
  goldTaked: boolean = false;

  constructor() {
    this.properties = {
      sizeTable: 0,
      arrows: 3,
      wells: 3,
    }
  }

  ngOnInit(): void {
    if(!this.properties || this.cellMatrix.length == 0) return;
    this.createMatrix(this.properties.sizeTable);
    this.setHunter();
    this.setWumpus();
    this.setGold();
    this.setWells();

    this.activeWumpus();

  }

  ngOnDestroy(): void {
    clearInterval(this.idIntervalWumpus);
  }

  private createMatrix(quantity : number): void {
    for (let i = 0; i < quantity; i++) {
      let array = Array < any > (quantity).fill({}).map((cell, index) => {
        return {row: i, col: index, roles: []}
      });
      this.cellMatrix.push(array);
    }
  }

  private setHunter(): void {
    this.cellMatrix[this.properties.sizeTable - 1][0].roles.push('Cazador');
  }

  private setWumpus(): void {
    let row = getRandomPos(0, this.properties.sizeTable - 2);
    let col = getRandomPos(0, this.properties.sizeTable - 1);
    this.cellMatrix[row][col].roles.push('Wumpus');
    this.setHedor(row, col);
  }

  private setGold(): void {
    let notFound = true;
    while (notFound) {
      let row = getRandomPos(0, this.properties.sizeTable - 1);
      let col = getRandomPos(1, this.properties.sizeTable - 1);

      if (this.cellMatrix[row][col].roles.indexOf('Wumpus') == -1) {
        this.cellMatrix[row][col].roles.push('Oro');
        notFound = false;
      }
    }
  }

  private setHedor(row : number, col : number): void {
    this.cleanHedor();

    this.setPercepcionAdyacente(row, col, 'Hedor');
  }

  private cleanHedor(): void {
    this.cellMatrix.forEach(row => {
      row.forEach((cell : any) => {
        cell.roles = cell.roles.filter((rol : string) => rol != 'Hedor');
      });
    })
  }

  private setWells(): void {
    let i = 0;
    let max = this.properties.sizeTable - 1;
    while (i < this.properties.wells) {
      let row = getRandomPos(0, max);
      let col = getRandomPos(0, max);

      if (this.cellMatrix[row][col].roles.indexOf('Cazador') == -1 && this.cellMatrix[row][col].roles.indexOf('Wumpus') == -1 && this.cellMatrix[row][col].roles.indexOf('Oro') == -1 && this.cellMatrix[row][col].roles.indexOf('Pozo') == -1) {
        this.cellMatrix[row][col].roles.push('Pozo');
        this.setPercepcionAdyacente(row, col, 'Brisa');
        i++;
      }

    }
  }

  private setPercepcionAdyacente(row : number, col : number, rol : string): void { // set top
    if (row > 0 && this.cellMatrix[row - 1][col].roles.indexOf(rol) == -1) {
      this.cellMatrix[row - 1][col].roles.push(rol);
    }

    // set bottom
    if (row < this.properties.sizeTable - 1 && this.cellMatrix[row + 1][col].roles.indexOf(rol) == -1) {
      this.cellMatrix[row + 1][col].roles.push(rol);
    }

    // set left
    if (col > 0 && this.cellMatrix[row][col - 1].roles.indexOf(rol) == -1) {
      this.cellMatrix[row][col - 1].roles.push(rol);
    }

    // set right
    if (col < this.properties.sizeTable - 1 && this.cellMatrix[row][col + 1].roles.indexOf(rol) == -1) {
      this.cellMatrix[row][col + 1].roles.push(rol);
    }

  }

  private activeWumpus(): void {
    this.idIntervalWumpus = setInterval(() => {
      if(!this.gameover && !this.gamewon && !this.wumpusDead) {
        this.moveWumpus();
      } else {
        clearInterval(this.idIntervalWumpus);
      }

    }, 3000);
  }

  private moveWumpus(): void {
    let rowIndex = 0;
    let colIndex = 0;
    this.cellMatrix.forEach((row : Array < any >, indexRow : number) => {
      row.forEach((cell, indexCell : number) => {
        if (cell.roles.indexOf('Wumpus') != -1) {
          rowIndex = indexRow;
          colIndex = indexCell;
        }
      });
    });

    let cellsWhereCanGo = this.wumpusWhereCanGo(rowIndex, colIndex);
    console.log(cellsWhereCanGo);
    let cellWherCanGoPos = getRandomPos(0, cellsWhereCanGo.length - 1);
    this.cleanHedor();
    let currencIndex = this.cellMatrix[rowIndex][colIndex].roles.indexOf('Wumpus');
    this.cellMatrix[rowIndex][colIndex].roles.splice(currencIndex, 1);

    let newRow = cellsWhereCanGo[cellWherCanGoPos].row;
    let newCol = cellsWhereCanGo[cellWherCanGoPos].col;
    this.cellMatrix[newRow][newCol].roles.push('Wumpus');
    this.setPercepcionAdyacente(newRow, newCol, 'Hedor');

    this.isGameOver();
  }

  wumpusWhereCanGo(row : number, col : number): Array < any > {
    let places = [];

    // Can go to Top
    if (row > 0) {
      let newRow = row - 1;
      let newCol = col;
      if (this.cellMatrix[newRow][newCol].roles.indexOf('Pozo') == -1) {
        places.push({row: newRow, col: newCol});
      }
    }

    // Can go to Bottom
    if (row < this.properties.sizeTable - 1) {
      let newRow = row + 1;
      let newCol = col;
      if (this.cellMatrix[newRow][newCol].roles.indexOf('Pozo') == -1) {
        places.push({
          row: row + 1,
          col: col
        });
      }

    }

    // Can go to Left
    if (col > 0) {
      let newRow = row;
      let newCol = col - 1;
      if (this.cellMatrix[newRow][newCol].roles.indexOf('Pozo') == -1) {
        places.push({
          row: row,
          col: col - 1
        });
      }

    }

    // Can go to Right
    if (col < this.properties.sizeTable - 1) {
      let newRow = row;
      let newCol = col + 1;
      if (this.cellMatrix[newRow][newCol].roles.indexOf('Pozo') == -1) {
        places.push({
          row: row,
          col: col + 1
        });
      }

    }
    return places;
  }

  private shootArrow(): void {
    if(!this.properties) return;
    if (this.properties.arrows == 0) {
      this.gamelog += 'No hay mas flechas\n';
      return;
    }
    this.gamelog += 'Flecha lanzada\n';
    this.properties.arrows --;

    let rowIndex = 0;
    let colIndex = 0;
    this.cellMatrix.forEach((row : Array < any >, indexRow : number) => {
      row.forEach((cell, indexCell : number) => {
        if (cell.roles.indexOf('Cazador') != -1) {
          rowIndex = indexRow;
          colIndex = indexCell;
        }
      });
    });

    if(this.wumpusDead) {
      return;
    }

    switch (this.currentDirection) {
      case 'north':
        this.shootToNorth(rowIndex, colIndex);
        break;
      case 'east':
        this.shootToEast(rowIndex, colIndex);
        break;
      case 'south':
        this.shootToSouth(rowIndex, colIndex);
        break;
      case 'west':
        this.shootToWest(rowIndex, colIndex);
        break;
      default:
        break;
    }

    if(this.wumpusDead) {
      this.gamelog += 'Wumpus murio por tu flecha!!\n';
      this.cleanHedor();
    }
  }

  private shootToNorth(row: number, col: number): void {
    for (let index = row - 1; index >= 0; index--) {
      let indexWumpus = this.cellMatrix[index][col].roles.indexOf('Wumpus');
      if(indexWumpus != -1) {
        this.wumpusDead = true;
        break;
      }
    }
  }

  private shootToEast(row: number, col: number): void {
    for (let index = col + 1; index < this.properties.sizeTable; index++) {
      let indexWumpus = this.cellMatrix[row][index].roles.indexOf('Wumpus');
      if(indexWumpus != -1) {
        this.wumpusDead = true;
        break;
      }
    }
  }

  private shootToSouth(row: number, col: number): void {
    for (let index = row + 1; index < this.properties.sizeTable; index++) {
      let indexWumpus = this.cellMatrix[index][col].roles.indexOf('Wumpus');
      if(indexWumpus != -1) {
        this.wumpusDead = true;
        break;
      }
    }
  }

  private shootToWest(row: number, col: number): void {
    for (let index = col - 1; index >= 0; index--) {
      let indexWumpus = this.cellMatrix[row][index].roles.indexOf('Wumpus');
      if(indexWumpus != -1) {
        this.wumpusDead = true;
        break;
      }
    }
  }


  private moveHunter(): void {
    let rowIndex = 0;
    let colIndex = 0;
    this.cellMatrix.forEach((row : Array < any >, indexRow : number) => {
      row.forEach((cell, indexCell : number) => {
        if (cell.roles.indexOf('Cazador') != -1) {
          rowIndex = indexRow;
          colIndex = indexCell;
        }
      });
    });

    switch (this.currentDirection) {
      case 'north':
        this.goToNorth(rowIndex, colIndex);
        break;
      case 'east':
        this.goToEast(rowIndex, colIndex);
        break;
      case 'south':
        this.goToSouth(rowIndex, colIndex);
        break;
      case 'west':
        this.goToWest(rowIndex, colIndex);
        break;
      default:
        break;
    }

  }

  private isGameWon(): void {
    let rowIndex = 0;
    let colIndex = 0;
    this.cellMatrix.forEach((row : Array < any >, indexRow : number) => {
      row.forEach((cell, indexCell : number) => {
        if (cell.roles.indexOf('Cazador') != -1) {
          rowIndex = indexRow;
          colIndex = indexCell;
        }
      });
    });

    let currencIndex = this.cellMatrix[rowIndex][colIndex].roles.indexOf('Oro');
    if(currencIndex != -1) {
      this.goldTaked = true;
      this.gamelog += 'Obtuviste el Oro!!!\n';
      this.cellMatrix[rowIndex][colIndex].roles.splice(currencIndex, 1);
    }

    if(this.goldTaked && rowIndex == this.properties.sizeTable - 1 && colIndex == 0) {
      this.gamewon = true;
      this.gamelog += 'YOU WIN!!!\n';
    }
  }

  private isGameOver(): void {
    let rowIndex = 0;
    let colIndex = 0;
    this.cellMatrix.forEach((row : Array < any >, indexRow : number) => {
      row.forEach((cell, indexCell : number) => {
        if (cell.roles.indexOf('Cazador') != -1) {
          rowIndex = indexRow;
          colIndex = indexCell;
        }
      });
    });

    let currencIndex = this.cellMatrix[rowIndex][colIndex].roles.indexOf('Wumpus');
    if(currencIndex != -1 && !this.wumpusDead) {
      this.gameover = true;
      this.gamelog += 'Wumpus te atrapo!!!\n';
      this.gamelog += 'GAME OVER!!!\n';
    }

    currencIndex = this.cellMatrix[rowIndex][colIndex].roles.indexOf('Pozo');
    if(currencIndex != -1) {
      this.gameover = true;
      this.gamelog += 'Caiste en un pozo!!!\n';
      this.gamelog += 'GAME OVER!!!\n';
    }
  }

  private goToNorth(row: number, col: number): void {
    if(row == 0) {
      this.gamelog += 'Pared superior\n';
      return;
    }

    let currencIndex = this.cellMatrix[row][col].roles.indexOf('Cazador');
    this.cellMatrix[row][col].roles.splice(currencIndex, 1);
    this.cellMatrix[row - 1][col].roles.push('Cazador');

  }

  private goToSouth(row: number, col: number): void {
    if(row == this.properties.sizeTable - 1) {
      this.gamelog += 'Pared inferior\n';
      return;
    }

    let currencIndex = this.cellMatrix[row][col].roles.indexOf('Cazador');
    this.cellMatrix[row][col].roles.splice(currencIndex, 1);
    this.cellMatrix[row + 1][col].roles.push('Cazador');
  }

  private goToEast(row: number, col: number): void {
    if(col == this.properties.sizeTable - 1) {
      this.gamelog += 'Pared derecha\n';
      return;
    }

    let currencIndex = this.cellMatrix[row][col].roles.indexOf('Cazador');
    this.cellMatrix[row][col].roles.splice(currencIndex, 1);
    this.cellMatrix[row][col + 1].roles.push('Cazador');
  }

  private goToWest(row: number, col: number): void {
    if(col == 0) {
      this.gamelog += 'Pared izquierda\n';
      return;
    }

    let currencIndex = this.cellMatrix[row][col].roles.indexOf('Cazador');
    this.cellMatrix[row][col].roles.splice(currencIndex, 1);
    this.cellMatrix[row][col - 1].roles.push('Cazador');
  }

}
