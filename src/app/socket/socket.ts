import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiService } from '../services/api-service';

/**
 * IpAdressPage
 *
 * Verantwortlich für die Konfiguration der Serververbindung (IP und Port)
 * innerhalb eines Ionic-Views und für die initiale Erreichbarkeitsprüfung
 * des Backends vor dem Login.
 *
 * Ziel
 * - Benutzer gibt Server-IP und Port ein.
 * - Verbindung wird im ApiService persistiert.
 * - Backend wird über Health-Endpoint validiert.
 * - Bei Erfolg Weiterleitung zur Login-Seite.
 *
 * Verantwortlichkeiten
 * - Lädt bestehende Verbindungseinstellungen aus ApiService beim Init.
 * - Hält lokalen UI-Zustand für ip, port und loading.
 * - Persistiert neue Verbindungsdaten via ApiService.setConnection.
 * - Führt einen Healthcheck mit hartem Timeout aus.
 * - Navigiert bei Erfolg zum Login-Flow.
 * - Verhindert Mehrfachausführung während laufender Requests.
 *
 * Abhängigkeiten
 * @dependency ApiService
 *   - getConnection: liest gespeicherte IP und Port
 *   - setConnection: persistiert neue Verbindungsdaten
 *   - health: prüft Servererreichbarkeit
 *
 * @dependency NavController
 *   - navigateRoot: harter Redirect auf Login-Seite
 *
 * Nebenwirkungen
 * - Persistiert Serververbindung im Service.
 * - Führt Netzwerkrequest gegen Backend aus.
 * - Navigiert bei Erfolg auf /login.
 * - Zeigt Alert bei Fehler oder Timeout.
 *
 * Invarianten
 * - Während eines Speichervorgangs ist loading true.
 * - saveIp darf nicht parallel ausgeführt werden.
 * - Navigation erfolgt nur nach erfolgreichem Healthcheck.
 * - Healthcheck darf maximal 3 Sekunden dauern.
 *
 * Fehlerfälle
 * - Backend nicht erreichbar
 * - Timeout nach 3 Sekunden
 * - Ungültige IP oder Port werden aktuell nicht validiert
 *
 * Verbesserungspotenzial
 * - Formale Validierung für IP und Port
 * - Retry-Strategie für Healthcheck
 * - Zentrale Error-UI statt alert
 * - Explizite Typisierung für getConnection Rückgabe
 */

@Component({
  selector: 'app-socket',
  templateUrl: './socket.page.html',
  styleUrls: ['./socket.page.scss'],
  standalone: false
})

export class SocketPage implements OnInit {
  ip:string = '';
  port: string = '';
  loading: boolean = false;

  constructor(
    private api: ApiService,
    private navCtrl: NavController
  ){}

  ngOnInit(): void {
    const conn = this.api.getConnection();
    this.ip = conn.ip || '';
    this.port = conn.port || '';
  }


  async saveIp(){
    if(this.loading) return;
    this.loading = true;

    try{
      await this.api.setConnection(this.ip, this.port);
      await this.timeoutHealthCheck();
      this.navCtrl.navigateRoot('/login')    
    }catch(e: any){
      alert(e.message || 'Server nicht erreichbar');
    }
    this.loading = false;
  }


  private async timeoutHealthCheck(){
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Server Timeout')), 3000)
    );
    return Promise.race([
      this.api.health(),
      timeout
    ])
  }
}
