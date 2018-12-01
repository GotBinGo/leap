import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  wsImpl = window['WebSocket'] || window['MozWebSocket'];
  ws = new this.wsImpl('ws://' + '192.168.89.181' + ':8080/');

  blues = [];
  reds = [];
  walls = [];
  mines = [];

  pos: any;

  redFlag: any;
  blueFlag: any;

  messages = [];
  subj = new Subject<number>();
  onMessage = this.subj.asObservable();

  constructor() {
    this.ws.onmessage = (evt) => {
      const hel = evt.data.split('&nbsp;').join(' ');
        if (evt.data[0] === '/') {
          const j = JSON.parse(hel.split(' ')[1]);
          this.blues = j.value.filter(x => x.c === 'blue');
          this.reds = j.value.filter(x => x.c === 'red');
          this.pos = j.value.filter(x => x.type === 'pos')[0];
          this.redFlag = j.value.filter(x => x.type === 'flag' && x.team === 0)[0];
          this.blueFlag = j.value.filter(x => x.type === 'flag' && x.team === 1)[0];
          this.walls = j.value.filter(x => x.type === 'wall');
          this.mines = j.value.filter(x => x.type === 'mine');
        } else {
          this.subj.next(hel);
        }
      };
      this.ws.onopen = () => {
        console.log('connected');
        //this.ws.send('/sn ' +  window.prompt());
        this.ws.send('/sn ' +  3);
      };
  }
}
