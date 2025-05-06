import { Component, OnInit } from '@angular/core';
import { User } from '../model/user';
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

  deleteUser(index: number) {
    const user = this.users[index-1];
    if (user) {
      this.userService.delete(user).subscribe(
        result => {
          this.users.splice(index, 1);
          this.gotoUserList();
        },
        error => console.error('Error deleting user:', error)
      );
    } else {
      console.error('User not found at index:', index);
    }
  }

  gotoUserList() {
    location.reload();
  }
}
