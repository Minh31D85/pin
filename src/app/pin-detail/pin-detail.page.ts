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
  nameFromRoute = '';
  entry?: PinItem;

  isRevealed = false;
  progress = 0;

  private timeoutId?: number;
  private intervalId?: number;

  constructor(
    private route: ActivatedRoute,
    public service: Service
  ) { }

  async ngOnInit() {
    await this.service.load();
    this.nameFromRoute = this.route.snapshot.paramMap.get('name') ?? '';

    const normalized = this.nameFromRoute.trim().toLowerCase();

    this.entry = this.service.itemList.find(
      item => item.name.trim().toLocaleLowerCase() === normalized);
  }

  toggleReveal() {
    if (!this.entry) return;

    if (this.isRevealed){
      this.hidePin();
    }else{
      this.showPin(3);
    }
  }

  maskPin(pin: string):string{ return '*'.repeat(pin.length) }

  private showPin(seconds: number) {
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

      if (remainig <= 0){
        this.hidePin();
      }
    }, tickMs);
    this.timeoutId = window.setTimeout(() => this.hidePin(), totalMs);
  }

  private hidePin(){
    this.isRevealed = false;
    this.progress = 0;
    this.clearTimers();
  }

  private clearTimers(){
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.intervalId) clearInterval(this.intervalId);
    this.timeoutId = undefined;
    this.intervalId = undefined;
  }

  ngOnDestroy(){
    this.clearTimers();
  }
}
