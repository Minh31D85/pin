import { Component, Input, ViewChild } from '@angular/core';
import { ModalController, IonicModule, IonInput } from '@ionic/angular';
import { PinItem } from '../services/service';
import { FormsModule } from '@angular/forms';

/**
 * ModalComponent
 *
 * Editier-Modal für einen bestehenden PIN-Eintrag.
 *
 * Ziel
 * - Bearbeitung von name und pin innerhalb eines Bottom-Sheet-Modals
 * - Fokussteuerung zwischen Eingabefeldern
 * - Validierung vor dem Speichern
 * - Rückgabe der Änderungen an den aufrufenden Kontext
 *
 * Verantwortlichkeiten
 * - Nimmt index und PinItem als Input
 * - Schaltet zwischen Edit-Modi für name und pin
 * - Steuert Fokus und Blur der IonInput-Felder
 * - Passt Modal-Breakpoints dynamisch an
 * - Validiert Eingaben vor dem Speichern
 * - Gibt aktualisierten Eintrag über ModalController zurück
 *
 * Datenfluss
 * - Input item ist die zu bearbeitende Referenz
 * - Änderungen werden lokal editiert
 * - save gibt { index, updated } zurück
 *
 * Abhängigkeiten
 * @dependency ModalController
 *   - dismiss: schließt Modal mit Ergebnis oder cancel
 *
 * @dependency IonInput
 *   - setFocus und blur für UX-Steuerung
 *
 * Nebenwirkungen
 * - Manipuliert Breakpoint des Modals
 * - Setzt Fokus auf Eingabefelder
 * - Zeigt Alerts bei Validierungsfehlern
 *
 * Invarianten
 * - Nur ein Feld gleichzeitig im Edit-Modus
 * - name darf nicht leer sein
 * - pin ist numerisch und 4 bis 8 Stellen
 * - Modal gibt nur bei gültigen Daten ein save-Result zurück
 */

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
  

  private async setSheet(bp: 0.5 | 0.9){
    const modalEl = document.querySelector('ion-modal.edit-sheet') as any;
    if(modalEl?.setCurrentBreakpoint) await modalEl.setCurrentBreakpoint(bp);
  }


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


  private async blurName(){
    const el = await this.nameInput?.getInputElement();
    el?.blur();
  }


  private async blurPin(){
    const el = await this.pinInput?.getInputElement();
    el?.blur();
  }


  editName(){ 
    this.isEditName = true; 
  }


  editPin(){
    this.isEditPin = true;
  }


  cancel(){
    this.modalCtrl.dismiss(null, 'cancel'); 
  }


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
