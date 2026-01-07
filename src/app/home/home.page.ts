import { Component } from '@angular/core';
import { PinItem,Service } from '../service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from '../modal/modal.component';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../api-service';
import { environment } from 'src/environments/environment';

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
    private backupApi: ApiService,
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
    try{
      const app = environment.backupApi.appName;
      const schemaVersion = environment.backupApi.schemaVersion;

      const body = {
        schemaVersion,
        payload: {
          items: this.service.itemList,
        },
        meta: {
          device: 'android',
          appVersion: '1.0',
        },
      };
      const res =  await this.backupApi.export(app, body);
      const alert = await this.alertCtrl.create({
        header: 'Gespeichert',
        buttons: [
          {
            text: 'Ok',
            role: 'cancel'
          }
        ]
      })
      await alert.present();
    }catch(e: any){
      alert(`Export fehlgeschlagen: ${e?.message ?? 'unbekannter Fehler'}`);
    }
  }

  async importJSON(){
    try{
      const app = environment.backupApi.appName;
      const latest = await this.backupApi.latest(app);
      const payload = latest.backup?.payload;
      const items = payload?.items;

      if (!Array.isArray(items)){
        alert('Backup ist ungültig: payload fehlt oder kein Array')
        return;
      }

      this.service.itemList = items;
      await this.service.save();
      const alerts = await this.alertCtrl.create({
        header: `Import erfolgreich :\n${latest.path}`,
        buttons: [
          {
            text: 'Ok',
            role: 'cancel'
          }
        ]
      })
      await alerts.present();


    }catch(e: any){
      alert(`Import fehlgeschlagen: ${e?.message ?? 'unbekannter Fehler'}`);
    }
  }

  async listImport(){
    try{
      const app = environment.backupApi.appName;
      const files = await this.backupApi.list(app);

      if(!files.length){ alert('Kein Backup gefunden'); return }

      const alerts = await this.alertCtrl.create({
        header: 'Backup auswählen',
        inputs: files.slice(0,10).map((path, idx) => ({
          type: 'radio',
          label: path,
          value: path,
          checked: idx === 0,
        })),
        buttons:[
          {
            text: 'Importieren',
            handler: async (path: string) => {
              const res = await this.backupApi.import<any>(app, path);
              const items = res.payload?.items;

              if(!Array.isArray(items)){ alert('Backup ist ungültig'); return};
              this.service.itemList = items;
              await this.service.save();

              const alertDone = await this.alertCtrl.create({
                header: `Import erfolgreich ${path}`,
                buttons:[{text:'ok',role: 'cancel'}]
              })
              await alertDone.present();
            }
          },
          {
            text: 'Abbrechen',
            role: 'cancel'
          }
        ]
      })
      await alerts.present();
    }catch(e: any){
      alert(`Import fehlgeschlagen: ${e?.message ?? 'unbekannter Fehler'}`);
    }
  }


  async health() {
    try {
      const res = await this.backupApi.health();

      const alert = await this.alertCtrl.create({
        header: res.ok ? 'Health OK' : 'Health FEHLER',
        message: `<pre>${JSON.stringify(res, null, 2)}</pre>`,
        buttons: [{ text: 'OK', role: 'cancel' }],
      });
      await alert.present();
    } catch (e: any) {
      const msg =
        e?.error
          ? (typeof e.error === 'string' ? e.error : JSON.stringify(e.error, null, 2))
          : (e?.message ?? 'unbekannter Fehler');

      const alert = await this.alertCtrl.create({
        header: 'Health FEHLER',
        message: `<pre>${msg}</pre>`,
        buttons: [{ text: 'OK', role: 'cancel' }],
      });
      await alert.present();
    }
  }
}
