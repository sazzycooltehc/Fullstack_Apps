import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {}

  public findAll(): Observable<User[]> {
    return this.http.get<User[]>(environment.usersUrl);
  }

  public save(user: User) {
    return this.http.post<User>(environment.usersUrl, user);
  }

  public delete(user: User) {
    console.log('Service: Deleting user:', user);  // Log the full user object
    return this.http.post(`${environment.deleteurl}/${user.id}`, { body: user });  // Sending full user object
  }  
  
}
