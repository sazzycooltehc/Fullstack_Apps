import { Component, OnInit } from '@angular/core';
import { User } from '../model/user/user';
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  users: User[] | any;

  constructor(private userService: UserService, private router: Router) {
  }

  ngOnInit() {
    this.userService.findAll().subscribe(data => {
      this.users = data;
    });
  }

  deleteUser(user: User): void {
    console.log('Deleting user:', user);  // Log the full user object
  
    if (user) {
      this.userService.delete(user).subscribe(
        () => {
          // Remove the user based on the full JSON object match
          this.users = this.users.filter((u: User) => {
            // Match users by their full object, checking properties like id, name, and email
            return u.id !== user.id || u.name !== user.name || u.email !== user.email;
          });
          console.log('User deleted successfully');
        },
        error => {
          console.error('Error deleting user:', error);
        }
      );
    } else {
      console.error('Invalid user object:', user);
    }
  }
  
  
  

  gotoUserList() {
    location.reload();
  }
}
