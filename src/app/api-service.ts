import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * @description Request payload for exporting a backup.
 * @template TPayload - The type of the payload to be backed up.
 */
export interface BackupExportReq<TPayload = any>{
  schemaVersion: number;
  payload: TPayload;
  meta?: Record<string, any>;
};

/**
 * @description Response payload for exporting a backup.
 */
export interface BackupExportRes{
  stored: boolean;
  path: string;
};

/**
 * @description Response payload for listing backup files.
 */
export interface BackupListRes{
  files: string[];
};

/**
 * @description Response payload for importing a backup.
 * @template TPayload - The type of the payload that was backed up.
 */
export interface BackupImportRes<TPayload = any>{
  imported: boolean;
  schemaVersion: number;
  payload: TPayload;
};

/**
 * @description Response payload for retrieving the latest backup.
 * @template TBackup - The type of the backup payload.
 */
export interface BackupLatestRes<TBackup = any>{
  path: string;
  backup: TBackup
};

@Injectable({ providedIn: 'root'})

export class ApiService {
  /**
   * @description Base URL for the backup API.API key for authenticating requests to the backup API.
   */
  private readonly baseUrl = environment.backupApi.baseUrl;
  private readonly apiKey = environment.backupApi.apiKey;

  constructor(private http: HttpClient){}

  /**
   * @description Constructs the HTTP headers for API requests, including the API key for authentication.
   * @returns HttpHeaders - The constructed HTTP headers. 
   */
  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-API-KEY': this.apiKey,
    });
  }

  /**
   * @description constructs the full URL for a given API path.
   * @param path string - The API path to append to the base URL.
   * @returns string - The full URL.
   */
  private url(path: string): string {
    const base = this.baseUrl.replace(/\/+$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }

  /**
   * @description Lists backup files for a given application.
   * @param app string - The application identifier.
   * @returns Promise<string[]> - A promise that resolves to an array of backup file names.
   */
  async list(app: string): Promise<string[]>{
    const res = await firstValueFrom(
      this.http.get<BackupListRes>(this.url(`/backups/${encodeURIComponent(app)}/list`),{
        headers: this.headers(),
      })
    );
    return res.files ?? [];
  }

  /**
   * @description Exports a backup for a given application.
   * @param app string - The application identifier.
   * @param body BackupExportReq<TPayload> - The backup export request payload.
   * @returns Promise<BackupExportRes> - A promise that resolves to the backup export response. 
   */
  async export<TPayload>(app: string, body: BackupExportReq<TPayload>): Promise<BackupExportRes> {
    return await firstValueFrom(
      this.http.post<BackupExportRes>(this.url(`/backups/${encodeURIComponent(app)}/export`), body, {
        headers: this.headers(),
      })
    );
  }

  /**
   * @description Retrieves the latest backup for a given application.
   * @param app string - The application identifier.   
   * @returns Promise<BackupLatestRes> - A promise that resolves to the latest backup response.             
   */
  async latest(app: string): Promise<BackupLatestRes> {
    return await firstValueFrom(
      this.http.get<BackupLatestRes>(this.url(`/backups/${encodeURIComponent(app)}/latest`), {
        headers: this.headers(),
      })
    );
  }

  /**
   * @description Imports a backup for a given application from a specified path.
   * @param app string - The application identifier.
   * @param path string - The path to the backup file to be imported.
   * @returns Promise<BackupImportRes<TPayload>> - A promise that resolves to the backup import response. 
   */
  async import<TPayload>(app: string, path: string): Promise<BackupImportRes<TPayload>> {
    return await firstValueFrom(
      this.http.post<BackupImportRes<TPayload>>(this.url(`/backups/${encodeURIComponent(app)}/import`), { path }, {
        headers: this.headers(),
      })
    );
  }

  /**
   * @description For debugging: Checks the health status of the backup API service.
   * @returns Promise<{ ok: boolean; storage_writable?: boolean; time?: string; error?: string }> - A promise that resolves to the health status response.
   */
  async health(): Promise<{ ok: boolean; storage_writable?: boolean; time?: string; error?: string }> {
    return await firstValueFrom(
      this.http.get<{ ok: boolean; storage_writable?: boolean; time?: string; error?: string }>(
        this.url('/_health'),
        {
         headers: new HttpHeaders({ Accept: 'application/json' }),
        }
      )
    );
  }
}
