import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  messages = [];
  chatInput = new FormControl('', []);
  placeholder = '';
  color = 'primary';

  constructor() {
    // cs.onMessage.subscribe(this.onMessage);
  }

  onMessage = (m) => {
    const msg = JSON.parse(m);
    if (msg.error) {
      this.placeholder = msg.message;
      this.color = 'warn';
    } else {
      this.messages.push(msg);
      this.placeholder = '';
      this.color = 'primary';
      setTimeout(() => {document.getElementById('scroll').scrollTo(0, 999999999); }, 100);
    }

  }

  send = () => {

    // this.cs.ws.send(this.chatInput.value);
    this.chatInput.setValue('');
    console.log(scroll);
    setTimeout(() => {document.getElementById('scroll').scrollTo(0, 999999999); });
  }
}

