import { Component } from '@angular/core';
import { PinItem,Service } from '../service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  name: string = '';
  pin: string = '';

  constructor(
    public service: Service,
    private router: Router
  ) {}

  async ngOnInit(){
    await this.service.load();
  }

  async generate(){
    const n = this.name.trim();
    const p = this.pin.trim();

    if (!n){
      alert ('name is required');
      return;
    }

    if (!p){
      alert('PIN is required');
      return;
    }

    if (!/^\d{4}$/.test(p)){
      alert('PIN must be numeric');
      return;
    }

    try{
      await this.service.add({name: n, pin: p});
      this.name = '';
      this.pin = '';
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
    await this.service.remove(index);
  }

  navigateTo(item: PinItem){
    this.router.navigate(['/pin-detail', item.name]);
  }
}
