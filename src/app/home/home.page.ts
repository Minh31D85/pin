import { Component } from '@angular/core';
import { PinItem,Service } from '../service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from '../modal/modal.component';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../api-service';
import { environment } from 'src/environments/environment';
import { NavController } from '@ionic/angular';

/**
 * This component serves as the home page of the application, allowing users to manage their PIN items.
 * Users can add new PIN items, edit existing ones, delete items, and navigate to detailed views of each item.
 * The component also provides functionality for exporting and importing PIN items as JSON backups, as well as checking the health status of the backup API.
 * 
 * Note: The component relies on a service for data management and uses Ionic components for modals and alerts to enhance user interaction.
 */

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
    private navCtrl: NavController,
  ) {}

  
  /**
   * @description navigate to the IP address configuration page
   */
  async ngOnInit(){ await this.service.load(); }


  /**
   * @description toggle PIN visibility
   */
  togglePVisible(){ this.isPVisible = ! this.isPVisible; }


  /**
   * @description generate a new PIN item
   * @throws alert if validation fails or unexpected error occurs
   */
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

  
  /**
   * @description delete a PIN item after confirmation
   * @param index number - index of the item to delete
   * @throws alert if user cancels the deletion
   */
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


  /**
   * @description edit a PIN item using a modal dialog
   * @param index number - index of the item to edit
   * @throws alert if validation fails or unexpected error occurs
   */
  async edit(index: number){
    const item = this.service.itemList[index];
    if (!item) return;

    const modal = await this.modalCtrl.create({
      component: ModalComponent,
      componentProps:{
        index,
        item: { ...item },
      },
      cssClass: 'edit-sheet',
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


  /**
   * @description navigate to the detail page of a PIN item
   * @param item PinItem - the item to navigate to
   */
  navigateTo(item: PinItem){
    this.router.navigate(['/pin-detail', item.name]);
  }


  /**
   * @description export PIN items to JSON backup
   * @throws alert if export fails
   */
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


  /**
   * @description import PIN items from the latest JSON backup
   */
  async importJSON(){
    try{
      const app = environment.backupApi.appName;
      const latestRes = await this.backupApi.latest(app);
      const latestPath = latestRes?.latest?.path ?? '';

      if(!latestPath){
        alert('Kein Backup gefunden')
        return;
      } 

      const res = await this.backupApi.import<{ items: PinItem[] }>({app, path: latestPath});
      const items = (res?.payload as any)?.items;

      if(!Array.isArray(items)){
        alert('Backup ist ungültig: payload.items fehlt oder kein Array'); 
        return;
      } 

      this.service.itemList = items;
      await this.service.save();

      const alerts = await this.alertCtrl.create({
        header: `Import erfolgreich :\n${latestPath}`,
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


  /**
   * @description list available backups and allow user to select one for import
   */
  async listImport(){
    try{
      const app = environment.backupApi.appName;
      const files = await this.backupApi.list(app);

      if(!files.length){
        alert('Kein Backup gefunden') 
        return 
      }

      const alerts = await this.alertCtrl.create({
        header: 'Backup auswählen',
        inputs: files.slice(0, 10).map((f, idx)=>({
          type: 'radio',
          label: `${f.filename} (${f.modifiedAt})`,
          value: f.path,
          checked: idx === 0,
        })),
        buttons:[
          {
            text: 'Importieren',
            handler: async (path: string) => {
              const res = await this.backupApi.import<{items: PinItem[]}>({app, path});
              const items = (res?.payload as any)?.items;

              if(!Array.isArray(items)){ 
                alert('Backup ist ungültig') 
                return
              };

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
            text: 'Abbrechen', role: 'cancel'
          }
        ]
      });
      await alerts.present();
    }catch(e: any){
      alert(`Import fehlgeschlagen: ${e?.message ?? 'unbekannter Fehler'}`);
    }
  }


  /**
   * @description navigate to the IP address configuration page
   */
  async ipAdress(){
    this.navCtrl.navigateRoot('/ip-adress')
  }


  /**
   * @description Debugging: check the health status of the backup API
   * @throws alert if health check fails
   */
  async health() {
    try {
      const res = await this.backupApi.health();
      const alert = await this.alertCtrl.create({
        header: res.status === 'ok' ? 'Health OK' : 'Health FEHLER',
        message: `<pre>${JSON.stringify(res, null, 2)}</pre>`,
        buttons: [{ text: 'OK', role: 'cancel' }],
      });
      await alert.present();
    } catch (e: any) {
      alert(`Health fehlgeschlagen'}`);
    }
  }
}
