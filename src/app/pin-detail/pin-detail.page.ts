import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PinItem, Service } from '../service';

@Component({
  selector: 'app-pin-detail',
  templateUrl: './pin-detail.page.html',
  styleUrls: ['./pin-detail.page.scss'],
  standalone: false,
})
export class PinDetailPage implements OnInit {
  /**
   * @description Name of the pin item from the route parameter.
   */
  nameFromRoute = '';
  entry?: PinItem;

  /**
   * @description Whether the pin is currently revealed.
   */
  isRevealed = false;
  progress = 0;

  /**
   * @description Timer IDs for managing pin reveal duration.
   */
  private timeoutId?: number;
  private intervalId?: number;

  constructor(
    private route: ActivatedRoute,
    public service: Service
  ) { }

  /**
   * @description OnInit lifecycle hook to load the pin item based on the route parameter.
   */
  async ngOnInit() {
    await this.service.load();
    this.nameFromRoute = this.route.snapshot.paramMap.get('name') ?? '';
    const normalized = this.nameFromRoute.trim().toLowerCase();
    this.entry = this.service.itemList.find(item => 
      item.name.trim().toLocaleLowerCase() === normalized);
  }

  /**
   * @description Toggle the reveal state of the pin.
   * @returns {void}, toggles between showing and hiding the pin.
   */
  toggleReveal() {
    if (!this.entry) return;
    this.isRevealed ? this.hidePin() : this.showPin(3);
  }

  /**
   * @description Mask the pin with asterisks for display.
   * @param pin string - The pin to be masked.
   * @returns {string} The masked pin.
   */
  maskPin(pin: string):string{ 
    return '*'.repeat(pin.length) 
  }

  /**
   * @description Show the pin for a specified number of seconds.
   * @param seconds number - The duration in seconds to show the pin.
   * @returns {void}
   */
  private async showPin(seconds: number) {
    const verified = await this.service.verifyBiometric('Biometrische Bestätigung zum Teilen der Zugangsdaten');
    if(!verified){alert('Biometrische Authentifizierung fehlgeschlagen'); return}

    this.clearTimers();
    this.isRevealed = true;
    this.progress = 1;

    const totalMs = seconds * 1000;
    const tickMs = 50;
    const start = Date.now();

    this.intervalId = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const remainig = Math.max(0, totalMs - elapsed);
      this.progress = remainig / totalMs;

      if (remainig <= 0) this.hidePin();  
    }, tickMs);
    this.timeoutId = window.setTimeout(() => this.hidePin(), totalMs);
  }

  /**
   * @description Hide the pin and reset progress.
   * @returns {void}
   */
  private hidePin(){
    this.isRevealed = false;
    this.progress = 0;
    this.clearTimers();
  }

  /**
   * @description Clear any active timers for pin reveal.
   * @returns {void}
   */
  private clearTimers(){
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.intervalId) clearInterval(this.intervalId);
    this.timeoutId = undefined;
    this.intervalId = undefined;
  }

  /**
   * @description OnDestroy lifecycle hook to clear timers when the component is destroyed.
   * @returns {void}
   */
  ngOnDestroy(){
    this.clearTimers();
  }
}
