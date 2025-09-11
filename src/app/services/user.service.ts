import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  addressLineOne: string;
  addressLineTwo?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://978323-api-gateway.eba-ykmz27pv.us-west-2.elasticbeanstalk.com';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/api/user/profile`, {
      headers: this.getAuthHeaders()
    });
  }

  getDeliveryAddress(): Observable<string> {
    return new Observable(observer => {
      this.getUserProfile().subscribe({
        next: (profile) => {
          const address = `${profile.addressLineOne}${profile.addressLineTwo ? ', ' + profile.addressLineTwo : ''}, ${profile.city}, ${profile.state} ${profile.zipCode}, ${profile.country}`;
          observer.next(address);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }
}