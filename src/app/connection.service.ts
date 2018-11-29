import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  wsImpl = window['WebSocket'] || window['MozWebSocket'];
  ws = new this.wsImpl('ws://' + 'localhost' + ':8080/');

  blues = [];
  reds = [];

  pos: any;

  constructor() {
    this.ws.onmessage = (evt) => {
      const hel = evt.data.split('&nbsp;').join(' ');
        if (evt.data[0] === '/') {
          const j = JSON.parse(hel.split(' ')[1]);
          this.blues = j.value.filter(x => x.c === 'blue');
          this.reds = j.value.filter(x => x.c === 'red');
          this.pos = j.value.filter(x => x.type === 'pos')[0];
        } else {
          console.log(hel);
        }
      };
      this.ws.onopen = () => {
        console.log('connected');
        this.ws.send('/sn ' + '3d');
      };
  }
}
