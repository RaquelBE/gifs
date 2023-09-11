import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Gif, SearchResponse } from '../interfaces/gifs.interfaces';

@Injectable({ providedIn: 'root' })
export class GifsService {
  public gifList: Gif[] = [];

  private _tagsHistory: string[] = [];
  private apiKey: string = '7q6jw88ssI2lYNBZ1ItChPU7JXQkVQ7K';
  private serviceUrl: string = 'https://api.giphy.com/v1/gifs';

  constructor(private http: HttpClient) {
    this.loadLocalStorage();
  }

  get tagsHistory() {
    return [...this._tagsHistory];
  }

  private organizeHistory(tag: string) {
    tag = tag.toLocaleLowerCase(); //pasa todo a minúsuclas
    if (this._tagsHistory.includes(tag)) {
      this._tagsHistory = this._tagsHistory.filter((oldTag) => oldTag !== tag);
    } //borra el tag anterior

    this._tagsHistory.unshift(tag); //pone el tag nuevo al principio
    this._tagsHistory = this.tagsHistory.splice(0, 10); //limito a 10 tags
    this.saveLocalStorage(); //guarda el historial de localStorage
  }

  private saveLocalStorage(): void {
    localStorage.setItem('history', JSON.stringify(this._tagsHistory));
  }

  private loadLocalStorage(): void {
    if (!localStorage.getItem('history')) return;

    this._tagsHistory = JSON.parse(localStorage.getItem('history')!);

    if(this._tagsHistory.length === 0) return;
    this.searchTag(this._tagsHistory[0]);
  }

  //busca los valores del tag
  searchTag(tag: string): void {
    if (tag.length === 0) return; //para no dar al intro y que se guarde sin ningun texto en el campo
    this.organizeHistory(tag);

    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('limit', '10')
      .set('q', tag);

    this.http
      .get<SearchResponse>(`${this.serviceUrl}/search`, { params })
      .subscribe((resp) => {
        this.gifList = resp.data;
      });
  }
}
