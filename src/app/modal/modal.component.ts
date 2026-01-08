import { Component, Input, ViewChild } from '@angular/core';
import { ModalController, IonicModule, IonInput } from '@ionic/angular';
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

  @ViewChild('nameInput', { static: false }) nameInput!: IonInput;
  @ViewChild('pinInput', { static: false }) pinInput!: IonInput;

  isEditName: boolean = false;
  isEditPin: boolean = false; 

  constructor(private modalCtrl: ModalController) { }
  
  /**
   * @description Set the bottom sheet breakpoint
   * @param bp - The breakpoint value (0.5 or 0.9)
   * @returns {Promise<void>}
   */
  private async setSheet(bp: 0.5 | 0.9){
    const modalEl = document.querySelector('ion-modal.edit-sheet') as any;
    if(modalEl?.setCurrentBreakpoint) await modalEl.setCurrentBreakpoint(bp);
  }

  /**
   * @description Toggle edit mode for name
   * @returns {void}
   */
  async toggleEditName(){
    const next = !this.isEditName;
    if(next){ this.isEditPin=false; await this.blurPin();}

    this.isEditName = next;

    if(this.isEditName){
      await this.setSheet(0.9);
      requestAnimationFrame(()=> this.nameInput?.setFocus());
    }else{
      await this.blurName();
      if(!this.isEditPin) await this.setSheet(0.5);
    }
  }

  /**
   * @description Toggle edit mode for pin
   * @returns {void}
   */
  async toggleEditPin(){
    const next = !this.isEditPin;
    if(next){this.isEditName=false; await this.blurName();}

    this.isEditPin = next;

    if(this.isEditPin){
      await this.setSheet(0.9);
      requestAnimationFrame(()=> this.pinInput?.setFocus());
    }else{
      await this.blurPin();
      if(!this.isEditName) await this.setSheet(0.5);
    }
  }

  /**
   * @description remove focus from the name input
   * @returns {Promise<void>} 
   */
  private async blurName(){
    const el = await this.nameInput?.getInputElement();
    el?.blur();
  }

  /**
   * @description remove focus from the pin input
   * @returns {Promise<void>} 
   */
  private async blurPin(){
    const el = await this.pinInput?.getInputElement();
    el?.blur();
  }

  /**
   * @description Set edit mode for name and pin
   * @returns {void}
   */
  editName(){ this.isEditName = true; }

  /**
   * @description Set edit mode for pin
   * @returns {void}
   */
  editPin() {this.isEditPin = true; }

  /**
   * @description Dismiss the modal without saving changes
   * @returns {void}
   */
  cancel(){ this.modalCtrl.dismiss(null, 'cancel'); }

  /**
   * @description Save the changes and dismiss the modal
   * @returns {void}
   */
  save(){
    const n = this.item.name.trim();
    const p = this.item.pin.trim();

    if (!n){ alert('name is required'); return; }
    if (!/^\d{4,8}$/.test(p)){ alert('PIN must be numeric'); return; }

    this.modalCtrl.dismiss({ 
      index: this.index, updated: { name: n, pin: p } 
      },'save'
    );
  }
}
