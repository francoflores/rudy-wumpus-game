import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Properties } from '../models/properties.model';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {

  fgComponent: FormGroup;

  @Output() play = new EventEmitter<Properties>();

  constructor(private fb: FormBuilder) {
    this.fgComponent = this.fb.group({
      sizeTable: [4, [Validators.required, Validators.min(4)]],
      wells: [3, [Validators.required, Validators.min(1)]],
      arrows: [3, [Validators.required, Validators.min(3)]]
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    console.log(this.fgComponent.value);
    const properties: Properties = {
      ...this.fgComponent.value
    }
    this.play.emit(properties);
  }

}
