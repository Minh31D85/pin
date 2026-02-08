import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BiometryType, NativeBiometric } from 'capacitor-native-biometric';

/**
 * The service is designed to be used in an Angular/Ionic application and can be injected into components that require access to the pinned items or biometric authentication functionality. 
 * The methods provided allow for easy management of the pinned items and ensure that changes are persisted across app sessions.
 * 
 * Note: In a production application, consider using a more secure storage solution for sensitive data like PINs, such as Capacitor's Secure Storage plugin. 
 * Additionally, ensure that error handling is robust and that user feedback is clear when operations fail 
 * (e.g., when trying to add a duplicate name or when biometric authentication fails).
 */


export interface PinItem {
  name: string;
  pin: string;
}

@Injectable({ providedIn: 'root'})

export class Service {
  /**
   * @description Storage_key in Capacitor Preferences
   */
  private readonly PIN_KEY = 'itemList';


  /**
   * @description Internal In-memory-cache of pinned items. Private to prevent uncontrolled mutations. 
   */
  public itemList: PinItem[] = [];

  constructor(){}
  

  /**
   * @description Get the list of pinned items.
   * @returns {PinItem[]} Array of pinned items.
   */
  getAll(): PinItem[]{
    return [...this.itemList];
  }
   
  
  /**
   * @description load listed items from persistent storage.
   * @returns {Promise<void>} A promise that resolves when loading is complete.
   */
  async load(): Promise<void>{
    const { value} = await Preferences.get({ key: this.PIN_KEY });
    this.itemList = value ? (JSON.parse(value) as PinItem[]) : [];
  }


  /**
   * @description save listed items to persistent storage.
   * @returns {Promise<void>} A promise that resolves when saving is complete.
   */
  async save(): Promise<void>{
    await Preferences.set({
      key: this.PIN_KEY,
      value: JSON.stringify(this.itemList),
    });
  }


  /**
   * @description Check if an item with the given name exists. Lowercase and trim insensitive.
   * @param name - The name to check for existence.
   * @returns {boolean} True if an item with the name exists, false otherwise.
   */
  existsByName(name: string): boolean{
    const normalized = name.trim().toLocaleLowerCase();
    return this.itemList.some(
      item => item.name.trim().toLocaleLowerCase() === normalized);
  }


  /**
   * @description Add a new pinned item.
   * @param item - The PinItem to add.
   * @throws {Error} Throws an error with code 'NAME_EXISTS' if an item with the same name already exists.
   * @returns {Promise<void>} A promise that resolves when the item is added and saved.
   */
  async add(item: PinItem): Promise<void>{
    if (this.existsByName(item.name)) throw new Error('');
    this.itemList = [item, ...this.itemList];
    await this.save();
  }


  /**
   * @description Remove a pinned item by its index.
   * @param index 
   * @returns {Promise<void>} A promise that resolves when the item is removed and saved.
   */
  async remove(index: number): Promise<void>{
    this.itemList = this.itemList.filter((_, i) => i !== index);
    await this.save();  
  }


  /**
   * @description Clear all pinned items. Empties both in-memory cache and storage-key.
   * @returns {Promise<void>} A promise that resolves when all items are cleared from memory and storage.
   */
  async clear(): Promise<void>{
    this.itemList = [];
    await Preferences.remove({ key: this.PIN_KEY });
  }


  /**
   * @description Update a pinned item at the specified index.
   * @param index - The index of the item to update.
   * @param updated - The updated PinItem.
   * @returns {Promise<void>} A promise that resolves when the item is updated and saved.
   */
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


  /**
   * @description Verify biometric authentication.
   * @param reason - The reason for biometric verification.
   * @returns {Promise<boolean>} A promise that resolves to true if authentication is successful, false otherwise.
   */
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


  /**
   * @description Perform biometric login authentication.
   * @returns {Promise<boolean>} A promise that resolves to true if login is successful, false otherwise.
   */
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

