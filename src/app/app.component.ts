import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  messages = [];
  chatInput = '';
  send = () => {
    this.messages.push({message: this.chatInput, self: this.chatInput.length % 2 === 0, sender: 'Toomi'});
    this.chatInput = '';
    console.log(scroll);
    setTimeout(() => {document.getElementById('scroll').scrollTo(0, 999999999); }, 100);
  }
}

