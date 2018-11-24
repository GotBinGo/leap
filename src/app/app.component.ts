import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  messages = [{message: 'a', self: true}, {message: 'b', self: false}, {message: 'c', self: true}];
}
