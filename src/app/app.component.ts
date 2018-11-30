import { Component } from '@angular/core';
import { ConnectionService } from './connection.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  messages = [];
  chatInput = '';
  constructor(private cs: ConnectionService) {
    cs.onMessage.subscribe(this.onMessage);
  }

  onMessage = (msg) => {
    this.messages.push(JSON.parse(msg));

  }

  send = () => {
    this.cs.ws.send(this.chatInput);
    this.chatInput = '';
    console.log(scroll);
    setTimeout(() => {document.getElementById('scroll').scrollTo(0, 999999999); }, 100);
  }
}

