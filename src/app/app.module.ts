import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CellGameComponent } from './cell-game/cell-game.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { TableGameComponent } from './table-game/table-game.component';

@NgModule({
  declarations: [
    AppComponent,
    CellGameComponent,
    MainMenuComponent,
    TableGameComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
