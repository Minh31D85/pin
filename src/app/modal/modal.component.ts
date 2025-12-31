import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { PinItem } from '../service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  imports: [IonicModule, FormsModule],
  standalone: true,
})

export class ModalComponent {

  @Input() index!: number;
  @Input() item!: PinItem;

  isEditName: boolean = false;
  isEditPin: boolean = false;

  toggleEditName(){this.isEditName = !this.isEditName;}
  toggleEditPin(){this.isEditPin = !this.isEditPin;}

  constructor(private modalCtrl: ModalController) { }

  editName(){ this.isEditName = true; }
  editPin() {this.isEditPin = true; }

  cancel(){ this.modalCtrl.dismiss(null, 'cancel'); }

  save(){
    const n = this.item.name.trim();
    const p = this.item.pin.trim();

    if (!n){ alert('name is required'); return; }
    if (!/^\d{4}$/.test(p)){ alert('PIN must be numeric'); return; }

    this.modalCtrl.dismiss(
      { index: this.index, updated: { name: n, pin: p } }, 'save'
    );
  }
}
