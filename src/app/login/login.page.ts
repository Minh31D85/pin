import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { NavController, Platform } from '@ionic/angular';
import { Service } from '../services/service';

/**
 * LoginPage
 *
 * Login-View mit PIN-Authentifizierung und optionaler biometrischer
 * Anmeldung nach erfolgreicher Erstkonfiguration.
 *
 * Ziel
 * - Zugriff auf App nur nach gültiger PIN oder Biometrie
 * - Sicherstellen, dass PIN und Serververbindung existieren
 * - Automatische biometrische Anmeldung beim Start
 *
 * Verantwortlichkeiten
 * - Prüft beim Init ob PIN existiert
 * - Prüft ob Server-IP und Port konfiguriert sind
 * - Leitet je nach Zustand zu Register oder IP-Setup weiter
 * - Startet biometrische Anmeldung nach Platform-Ready
 * - Validiert eingegebene PIN
 * - Navigiert bei Erfolg zur Home-Seite
 *
 * Persistenz
 * - Preferences Key 'pin' für Login-PIN
 * - Preferences Key 'server_ip' für Backend-IP
 * - Preferences Key 'server_port' für Backend-Port
 *
 * Abhängigkeiten
 * @dependency Preferences
 *   - get: liest PIN und Serverkonfiguration
 *
 * @dependency NavController
 *   - navigateRoot: Navigation zu Register, Setup oder Home
 *
 * @dependency Platform
 *   - ready: stellt sicher, dass Native APIs verfügbar sind
 *
 * @dependency Service
 *   - loginBiometric: biometrische Authentifizierung
 *
 * Nebenwirkungen
 * - Navigiert abhängig vom Setup-Zustand
 * - Öffnet biometrischen Systemdialog
 * - Zeigt Alert bei falscher PIN
 *
 * Invarianten
 * - Login nur möglich wenn PIN existiert
 * - Login nur möglich wenn Server konfiguriert ist
 * - Biometrie wird nur nach Platform-Ready gestartet
 * - Navigation zu Home nur nach erfolgreicher Authentifizierung
 */

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})

export class LoginPage implements OnInit {
  showPin: boolean = false;
  pin: string = '';

  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    private service: Service,
  ) { }


  async ngOnInit() {
    const storedPin = await Preferences.get({ key: 'pin' });
    const storedIp = await Preferences.get({ key: 'server_ip' });
    const storedPort = await Preferences.get({ key: 'server_port' });  

    if(!storedPin.value){this.navCtrl.navigateRoot('/register'); return}
    if(!storedIp.value || !storedPort.value){this.navCtrl.navigateRoot('/socket'); return}

    await this.platform.ready().then(() => {this.performBiometric();})
  }


  async login() {
    const storedPin = await Preferences.get({ key: 'pin' });
    if(this.pin === storedPin.value){
      this.navCtrl.navigateRoot('/home');
    }else{
      alert('Invalid PIN!');
    }
  }


  async performBiometric(){
    const ok = await this.service.loginBiometric();
    if(!ok) return;
    this.navCtrl.navigateRoot('/home');
  }
}
