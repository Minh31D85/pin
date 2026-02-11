import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';

/**
 * RegisterPage
 *
 * View zur erstmaligen Einrichtung einer lokalen 4-stelligen PIN.
 *
 * Ziel
 * - Benutzer definiert eine numerische PIN
 * - PIN wird lokal im Storage persistiert
 * - Nach erfolgreicher Einrichtung Weiterleitung zur Serverkonfiguration
 *
 * Verantwortlichkeiten
 * - Verwaltet UI-Zustand für PIN und Sichtbarkeit
 * - Validiert Format der PIN
 * - Persistiert PIN über Capacitor Preferences
 * - Navigiert nach erfolgreichem Speichern weiter
 *
 * Persistenz
 * - Storage: Capacitor Preferences
 * - Key: 'pin'
 * - Format: String mit genau 4 numerischen Zeichen
 *
 * Abhängigkeiten
 * @dependency Preferences
 *   - set: Persistiert PIN
 *
 * @dependency NavController
 *   - navigateRoot: Weiterleitung zur IP-Konfiguration
 *
 * Nebenwirkungen
 * - Schreibt PIN im Klartext in lokalen Storage
 * - Zeigt Alerts für Validierung und Erfolg
 * - Navigiert zu '/ip-adress'
 *
 * Invarianten
 * - PIN besteht aus genau 4 Ziffern
 * - Navigation erfolgt nur nach erfolgreicher Persistenz
 * - Kein Überschreiben ohne erneute Registrierung vorgesehen
 */

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})

export class RegisterPage implements OnInit {
  showPin: boolean = false;
  pin: string = '';

  constructor(private navCtrl: NavController) { }

  ngOnInit() { }

  async registerPin(){
    if (this.pin.length !== 4){alert('PIN must 4 digits long'); return;}
    if (!/^\d{4}$/.test(this.pin)){alert('PIN must be numeric'); return;}

    await Preferences.set({
      key: 'pin',
      value: this.pin,
    });
    alert('PIN saved!');
    this.navCtrl.navigateRoot('/socket')
  }
}
