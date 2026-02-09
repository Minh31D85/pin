import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BiometryType, NativeBiometric } from 'capacitor-native-biometric';

/**
 * Service
 *
 * Zentraler State- und Persistenzdienst für PIN-Einträge sowie
 * biometrische Authentifizierung.
 *
 * Ziel
 * - Verwaltung einer lokalen Liste von PIN-Einträgen
 * - Persistenz über Capacitor Preferences
 * - Eindeutigkeit der Einträge über name
 * - Bereitstellung biometrischer Verifikation für geschützte Aktionen
 *
 * Verantwortlichkeiten
 * - Hält eine In-Memory-Liste von PinItem
 * - Lädt Liste aus persistentem Storage beim Appstart
 * - Speichert Liste nach jeder Mutation
 * - Verhindert doppelte Namen
 * - Bietet CRUD-Operationen für PIN-Einträge
 * - Stellt biometrische Verifikation für sensible Aktionen bereit
 *
 * Datenmodell
 * @interface PinItem
 *   name: eindeutiger Bezeichner
 *   pin: gespeicherte PIN im Klartext
 *
 * Persistenz
 * - Storage: Capacitor Preferences
 * - Key: 'itemList'
 * - Format: JSON Array von PinItem
 *
 * Abhängigkeiten
 * @dependency Preferences
 *   - get: Laden der gespeicherten Liste
 *   - set: Persistieren der Liste
 *   - remove: Löschen aller Daten
 *
 * @dependency NativeBiometric
 *   - isAvailable: Prüfen ob Biometrie verfügbar ist
 *   - verifyIdentity: Benutzerverifikation
 *
 * Nebenwirkungen
 * - Schreibzugriffe auf lokalen Storage
 * - Biometrische Systemdialoge
 * - Alert bei fehlgeschlagener Biometrie
 *
 * Invarianten
 * - itemList ist immer ein Array
 * - name ist eindeutig case-insensitive
 * - Jede Mutation wird sofort persistiert
 * - getAll gibt eine Kopie zurück
 */


export interface PinItem {
  name: string;
  pin: string;
}

@Injectable({ providedIn: 'root'})

export class Service {
  private readonly PIN_KEY = 'itemList';
  public itemList: PinItem[] = [];

  constructor(){}
  

  getAll(): PinItem[]{
    return [...this.itemList];
  }
   

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
    if (this.existsByName(item.name)) throw new Error('');
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
      const exists = this.itemList.some((existsItem, itemIndex) => 
        itemIndex !== index && 
        existsItem.name.trim().toLowerCase() === newName.toLowerCase());
      if (exists) throw new Error('NAME_EXISTS');
    }
    this.itemList[index] = { name: newName, pin: newPin };
    await this.save();
  }


  async verifyBiometric(reason: string):Promise<boolean>{
    try{
      const availability = await NativeBiometric.isAvailable({ useFallback: true });
      if(!availability.isAvailable) return false;

      await NativeBiometric.verifyIdentity({
        reason,
        title: 'Bestätigung erforderlich',
        subtitle: '',
        description: 'Biometrische Authentifizierung notwendig'
      });
      return true;
    }catch(error){
      alert('Biometrische Authentifizierung fehlgeschlagen')
      return false;
    }
  }


  async loginBiometric():Promise<boolean>{
    try{
      const result = await NativeBiometric.isAvailable({ useFallback: true });
      if(!result.isAvailable)return false;

      await NativeBiometric.verifyIdentity({
        reason:'Authentication',
        title: 'Login',
        subtitle: result.biometryType === BiometryType.FACE_ID ? 'FACE ID' : 'FINGERPRINT',
        description: 'Your Face ID needed for authorisation',
      });
      return true;
    }catch{
      return false;
    }
  }
}

