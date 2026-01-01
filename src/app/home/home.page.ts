import { Component } from '@angular/core';
import { PinItem,Service } from '../service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from '../modal/modal.component';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  name: string = '';
  pin: string = '';
  isPVisible: boolean = false;

  constructor(
    public service: Service,
    private router: Router,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
  ) {}

  async ngOnInit(){ await this.service.load(); }

  togglePVisible(){ this.isPVisible = ! this.isPVisible; }

  async generate(){
    const n = this.name.trim();
    const p = this.pin.trim();

    if (!n){ alert ('name is required'); return; }

    if (!p){ alert('PIN is required'); return; }

    if (!/^\d{4,8}$/.test(p)){
      alert('PIN must be exactly 4 digits to 8 digits');
      return;
    }

    try{
      await this.service.add({name: n, pin: p});
      this.name = '';
      this.pin = '';
      this.isPVisible = false;
    } catch (e: any){
      if (e.message === 'NAME_EXISTS'){
        alert(`${n} already exists`);
        this.name = '';
        return;
      }else{
        alert ('unexpected error occurred');
      }
    }
  }


  async delete(index: number){
    const alert = await this.alertCtrl.create({
      header: 'Löschen',
      message: `Wollen Sie den PIN löschen?`,
      buttons:[
        {
          text: 'Löschen',
          role: 'destructive',
          handler: () =>{
            this.service.remove(index);
          }
        },
        {
          text: 'Zurück',
          role: 'cancel'
        }
      ]
    })
    await alert.present();
  }


  async edit(index: number){
    const item = this.service.itemList[index];
    if (!item) return;

    const modal = await this.modalCtrl.create({
      component: ModalComponent,
      componentProps:{
        index,
        item: { ...item },
      },
      breakpoints: [0, 0.5, 0.9],
      initialBreakpoint: 0.5,
    });

    await modal.present();

    const { data , role } = await modal.onWillDismiss<{
      index: number;
      updated: PinItem;
    }>();
    
    if(role === 'save' && data?.updated){
      try{
        await this.service.update(data.index, data.updated);
      }catch (e: any){
        if (e.message === 'NAME_EXISTS'){
          alert(`${data.updated.name} already exists`);
        }else{
          alert('unexpected error occurred');
        }
      }
    }
  }

  navigateTo(item: PinItem){
    this.router.navigate(['/pin-detail', item.name]);
  }

  async exportJSON(){
// später: JSON erzeugen und speichern/teilen
console.log('EXPORT JSON', this.service.itemList);
alert('Export kommt als nächstes.');
  }

  async importJSON(){

  }
}
