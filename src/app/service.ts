import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export type PinItem = {
  name: string;
  pin: string;
}

@Injectable({
  providedIn: 'root',
})

export class Service {
  private readonly PIN_KEY = 'itemList';

  itemList: PinItem[] = [];

  constructor(){}

  async load(): Promise<void>{
    const { value} = await Preferences.get({ key: this.PIN_KEY });
    this.itemList = value ? (JSON.parse(value) as PinItem[]) : [];
  }

  async save(): Promise<void>{
    await Preferences.set({
      key: this.PIN_KEY,
      value: JSON.stringify(this.itemList),
    });
  }

  existsByName(name: string): boolean{
    const normalized = name.trim().toLocaleLowerCase();
    return this.itemList.some(
      item => item.name.trim().toLocaleLowerCase() === normalized);
  }

  async add(item: PinItem): Promise<void>{
    if (this.existsByName(item.name)) throw new Error('NAME_EXISTS');
    this.itemList = [item, ...this.itemList];
    await this.save();
  }

  async remove(index: number): Promise<void>{
    this.itemList = this.itemList.filter((_, i) => i !== index);
    await this.save();  
  }

  async clear(): Promise<void>{
    this.itemList = [];
    await Preferences.remove({ key: this.PIN_KEY });
  }

  async update(index: number, updated: PinItem): Promise<void>{
    const item = this.itemList[index];
    if (!item) return;

    const newName = updated.name.trim();
    const newPin = updated.pin.trim();

    const nameChanged = item.name.trim().toLowerCase() !== newName.toLowerCase();

    if (nameChanged){
      const exists = this.itemList.some(
      (other, i) => i !== index && other.name.trim().toLowerCase() === newName.toLowerCase()
    );
      if (exists) throw new Error('NAME_EXISTS');
    }
    this.itemList[index] = { name: newName, pin: newPin };
    await this.save();
  }
}
