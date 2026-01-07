import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

export type BackupExportReq<TPayload = any> = {
  schemaVersion: number;
  payload: TPayload;
  meta?: Record<string, any>;
};

export type BackupExportRes= {
  stored: boolean;
  path: string;
};

export type BackupListRes = {
  files: string[];
};

export type BackupImportRes<TPayload = any> = {
  imported: boolean;
  schemaVersion: number;
  payload: TPayload;
};

export type BackupLatestRes<TBackup = any> = {
  path: string;
  backup: TBackup
};

@Injectable({ providedIn: 'root'})

export class ApiService {
  private readonly baseUrl = environment.backupApi.baseUrl;
  private readonly apiKey = environment.backupApi.apiKey;

  constructor(private http: HttpClient){}

  
  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-API-KEY': this.apiKey,
    });
  }


  private url(path: string): string {
    const base = this.baseUrl.replace(/\/+$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }



  async list(app: string): Promise<string[]>{
    const res = await firstValueFrom(
      this.http.get<BackupListRes>(this.url(`/backups/${encodeURIComponent(app)}/list`),{
        headers: this.headers(),
      })
    );
    return res.files ?? [];
  }


  async export<TPayload>(app: string, body: BackupExportReq<TPayload>): Promise<BackupExportRes> {
    return await firstValueFrom(
      this.http.post<BackupExportRes>(this.url(`/backups/${encodeURIComponent(app)}/export`), body, {
        headers: this.headers(),
      })
    );
  }


  async latest(app: string): Promise<BackupLatestRes> {
    return await firstValueFrom(
      this.http.get<BackupLatestRes>(this.url(`/backups/${encodeURIComponent(app)}/latest`), {
        headers: this.headers(),
      })
    );
  }


  async import<TPayload>(app: string, path: string): Promise<BackupImportRes<TPayload>> {
    return await firstValueFrom(
      this.http.post<BackupImportRes<TPayload>>(this.url(`/backups/${encodeURIComponent(app)}/import`), { path }, {
        headers: this.headers(),
      })
    );
  }


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
