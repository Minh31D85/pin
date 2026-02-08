import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PinItem, Service } from '../service';

/**
 * This component displays the details of a specific pin item, including its name and pin. 
 * It allows users to reveal the pin temporarily with biometric verification and handles the timing for how long the pin is visible.
 * The component also ensures that timers are cleared when the component is destroyed to prevent memory leaks.
 * 
 * Note: The component relies on route parameters to identify which pin item to display and uses a service for data management and biometric verification.
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

    this.intervalId = setInterval(() => {
      const elapsed = Date.now() - start;
      const remainig = Math.max(0, totalMs - elapsed);
      this.progress = remainig / totalMs;

      if (remainig <= 0) this.hidePin();  
    }, tickMs);
    this.timeoutId = setTimeout(() => this.hidePin(), totalMs);
  }


  /**
   * @description Hide the pin and reset progress.
   */
  private hidePin(){
    this.isRevealed = false;
    this.progress = 0;
    this.clearTimers();
  }


  /**
   * @description Clear any active timers for pin reveal.
   */
  private clearTimers(){
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.intervalId) clearInterval(this.intervalId);
    this.timeoutId = null;
    this.intervalId = null;
  }


  /**
   * @description OnDestroy lifecycle hook to clear timers when the component is destroyed.
   */
  ngOnDestroy(){
    this.clearTimers();
  }
}
