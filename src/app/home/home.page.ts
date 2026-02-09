import { Component } from '@angular/core';
import { PinItem,Service } from '../services/service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from '../modal/modal.component';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../services/api-service';
import { environment } from 'src/environments/environment';
import { NavController } from '@ionic/angular';

/**
 * HomePage
 *
 * Hauptansicht zur Verwaltung von PIN-Einträgen und Backup-Operationen.
 *
 * Ziel
 * - Anlegen, Bearbeiten und Löschen von PIN-Einträgen
 * - Anzeige der Eintragsliste
 * - Navigation zur Detailansicht
 * - Import und Export von Backups über Backend
 * - Zugriff auf Serverkonfiguration und Healthcheck
 *
 * Verantwortlichkeiten
 * - Lädt Einträge beim Init aus dem Service
 * - Verwaltet UI-Zustand für neue Eingaben
 * - Validiert neue Einträge vor dem Speichern
 * - Verhindert doppelte Namen über Service
 * - Öffnet Edit-Modal für bestehende Einträge
 * - Bestätigt Löschaktionen über Alert
 * - Navigiert zur Detailansicht eines Eintrags
 * - Exportiert Einträge als Backup über ApiService
 * - Importiert Backups vom Backend
 * - Zeigt Liste verfügbarer Backups zur Auswahl
 * - Navigiert zur Serverkonfiguration
 * - Führt Backend-Healthcheck aus
 *
 * Datenfluss
 * - service.itemList ist zentrale Datenquelle
 * - Änderungen werden direkt im Service persistiert
 * - Modal liefert aktualisierte Einträge zurück
 * - Backup-API liefert Import und Exportdaten
 *
 * Abhängigkeiten
 * @dependency Service
 *   - load, add, remove, update, save
 *   - itemList als zentrale State-Quelle
 *
 * @dependency Router
 *   - Navigation zur Detailseite
 *
 * @dependency ModalController
 *   - Öffnet Edit-Modal
 *
 * @dependency AlertController
 *   - Bestätigungen und Statusmeldungen
 *
 * @dependency ApiService
 *   - export: Backup hochladen
 *   - import: Backup laden
 *   - list: Backups auflisten
 *   - latest: neuestes Backup ermitteln
 *   - health: Serverstatus prüfen
 *
 * @dependency NavController
 *   - Navigation zur Serverkonfiguration
 *
 * Nebenwirkungen
 * - Persistiert Änderungen im lokalen Storage
 * - Führt Netzwerkrequests für Backup aus
 * - Öffnet Modals und Alerts
 * - Navigiert zwischen Views
 *
 * Invarianten
 * - name ist eindeutig pro Eintrag
 * - pin ist numerisch mit 4 bis 8 Stellen
 * - itemList ist Single Source of Truth
 * - UI spiegelt immer aktuellen Service-State
 * - Import überschreibt aktuelle Liste vollständig
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

  
  async ngOnInit(){ 
    await this.service.load(); 
  }


  togglePVisible(){ 
    this.isPVisible = ! this.isPVisible; 
  }


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
    } catch (error){
      console.error(error);
      if(error instanceof Error && error.message === 'NAME_EXISTS'){
        alert(`${n} already exists`);
        return;
      }
      const msg = error instanceof Error ? error.message : 'unexpected error occurred';
      alert (msg);
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
      }catch (error){
        console.error(error);
        if (error instanceof Error && error.message === 'NAME_EXISTS'){
          alert(`${data.updated.name} already exists`);
          return;
        }
        const msg = error instanceof Error ? error.message : 'unexpected error occurred';
        alert(msg);
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
    }catch(error){
      console.error(error);
      if(error instanceof Error){
        alert(`Export fehlgeschlagen: ${error.message} ?? 'unbekannter Fehler`);
        return
      }
      alert('Export fehlgeschlagen: unbekannter Fehler');
    }
  }


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
    }catch(error){
      console.error(error);
      if(error instanceof Error){
        alert(`Import fehlgeschlagen: ${error.message ?? 'unbekannter Fehler'}`)
        return
      }
      alert('Import fehlgeschlagen: unbekannter Fehler');
    }
  }


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
    }catch(error){
      console.error(error);
      if(error instanceof Error){
        alert(`Import fehlgschlagen: ${error.message}`);
        return;
      }
      alert(`Import fehlgeschlagen: unbekannter Fehler'}`);
    }
  }


  async ipAdress(){
    this.navCtrl.navigateRoot('/ip-adress')
  }


  async health() {
    try {
      const res = await this.backupApi.health();
      const alert = await this.alertCtrl.create({
        header: res.status === 'ok' ? 'Health OK' : 'Health FEHLER',
        message: `<pre>${JSON.stringify(res, null, 2)}</pre>`,
        buttons: [{ text: 'OK', role: 'cancel' }],
      });
      await alert.present();
    } catch (error){
      console.error(error);
      const msg = error instanceof Error ? error.message : 'Health fehlgeschlagen';
      alert(msg);
    }
  }
}
