import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PinItem, Service } from '../services/service';

/**
 * PinDetailPage
 *
 * Detailansicht eines einzelnen PIN-Eintrags mit zeitlich begrenzter
 * Anzeige der sensiblen Daten nach biometrischer Verifikation.
 *
 * Ziel
 * - Anzeige eines PIN-Eintrags anhand des Namens aus der Route
 * - Geschützte Freigabe der PIN für kurze Zeit
 * - Automatisches erneutes Maskieren nach Timeout
 *
 * Verantwortlichkeiten
 * - Lädt Einträge aus dem Service beim Init
 * - Ermittelt Ziel-Eintrag über Routenparameter name
 * - Maskiert PIN standardmäßig
 * - Startet biometrisch geschützte Enthüllung
 * - Zeigt PIN nur für definierte Zeitspanne
 * - Verwaltet Countdown und Fortschrittsanzeige
 * - Beendet Anzeige automatisch
 * - Räumt Timer beim Destroy auf
 *
 * Datenfluss
 * - Route liefert name
 * - Service liefert itemList
 * - entry referenziert den gefundenen Eintrag
 *
 * Abhängigkeiten
 * @dependency ActivatedRoute
 *   - snapshot.paramMap: liest Namen des Eintrags
 *
 * @dependency Service
 *   - load: lädt gespeicherte Einträge
 *   - itemList: Datenquelle
 *   - verifyBiometric: Authentifizierung vor Freigabe
 *
 * Nebenwirkungen
 * - Biometrischer Systemdialog
 * - Timer für Auto-Hide
 * - Fortschrittsanzeige für Reveal-Dauer
 *
 * Invarianten
 * - PIN ist standardmäßig maskiert
 * - Enthüllung nur nach erfolgreicher Biometrie
 * - Sichtbarkeit endet automatisch nach Timeout
 * - Es läuft maximal ein Timer-Set gleichzeitig
 * - Timer werden beim Verlassen der Seite gestoppt
 */

@Component({
  selector: 'app-pin-detail',
  templateUrl: './pin-detail.page.html',
  styleUrls: ['./pin-detail.page.scss'],
  standalone: false,
})

export class PinDetailPage implements OnInit {
  nameFromRoute = '';
  isRevealed = false;
  progress = 0;
  entry?: PinItem;
  
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private route: ActivatedRoute,
    public service: Service
  ) { }


  async ngOnInit() {
    await this.service.load();
    this.nameFromRoute = this.route.snapshot.paramMap.get('name') ?? '';
    const normalized = this.nameFromRoute.trim().toLowerCase();
    this.entry = this.service.itemList.find(item => 
      item.name.trim().toLocaleLowerCase() === normalized);
  }


  toggleReveal() {
    if (!this.entry) return;
    this.isRevealed ? this.hidePin() : this.showPin(3);
  }



  maskPin(pin: string):string{ 
    return '*'.repeat(pin.length) 
  }


  private async showPin(seconds: number) {
    const verified = await this.service.verifyBiometric('Biometrische Bestätigung zum Teilen der Zugangsdaten');
    if(!verified){alert('Biometrische Authentifizierung fehlgeschlagen'); return}

    this.clearTimers();
    this.isRevealed = true;
    this.progress = 1;

    const totalMs = seconds * 1000;
    const tickMs = 50;
    const start = Date.now();

    this.intervalId = setInterval(() => {
      const elapsed = Date.now() - start;
      const remainig = Math.max(0, totalMs - elapsed);
      this.progress = remainig / totalMs;

      if (remainig <= 0) this.hidePin();  
    }, tickMs);
    this.timeoutId = setTimeout(() => this.hidePin(), totalMs);
  }


  private hidePin(){
    this.isRevealed = false;
    this.progress = 0;
    this.clearTimers();
  }


  private clearTimers(){
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.intervalId) clearInterval(this.intervalId);
    this.timeoutId = null;
    this.intervalId = null;
  }


  ngOnDestroy(){
    this.clearTimers();
  }
}
