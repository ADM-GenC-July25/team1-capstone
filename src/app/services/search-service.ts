import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  data = new BehaviorSubject<string>('');
  searchTerm = this.data.asObservable();

  constructor() { }

  updateSearchTerm(term: string) {
    this.data.next(term);
  }
}
