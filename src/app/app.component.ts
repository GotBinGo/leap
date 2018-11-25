import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  messages = [{message: 'a', self: true}, {message: 'b', sender: 'Toomi', self: false}, {message: 'c', self: false, sender: 'Toomi'}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}, {message: 'c', self: true}];
  chatInput = '';
  send = () => {
    this.messages.push({message: this.chatInput, self: this.chatInput.length % 2 === 0, sender: 'Toomi'});
    this.chatInput = '';
    console.log(scroll);
    setTimeout(() => {document.getElementById('scroll').scrollTo(0, 999999999); }, 100);
  }
}

