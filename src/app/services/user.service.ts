import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface UserProfile {
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
  private apiUrl = 'http://978358-test-with-taryn-env.eba-ykmz27pv.us-west-2.elasticbeanstalk.com';

  constructor(private http: HttpClient) {}

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/auth/profile`);
  }
}