import { Injectable, Component, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  template: '<h4>Mi legyen a neved?</h4><mat-form-field class="w-100"><input matInput autofocus (keyup.enter)="onClick()" [(ngModel)]="data.name"></mat-form-field> <button mat-button class="float-right" [mat-dialog-close]="data.name">Ok</button>',
})
export class PromptComponent {

  constructor(
    public dialogRef: MatDialogRef<PromptComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  onClick(): void {
    this.dialogRef.close(this.data.name);
  }
}

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
  gameStarted = false;

  redFlag: any;
  blueFlag: any;

  redScore: number;
  blueScore: number;


  subj = new Subject<number>();
  onMessage = this.subj.asObservable();

  constructor(public dialog: MatDialog) {
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
        this.redScore = j.value.filter(x => x.type === 'text' && x.color === 'red')[0].text;
        this.blueScore = j.value.filter(x => x.type === 'text' && x.color === 'blue')[0].text;
        this.gameStarted = true;
      } else {
        this.subj.next(hel);
      }
    };

    this.ws.onopen = () => {
      console.log('connected');
      const dialogRef = this.dialog.open(PromptComponent, {
        width: '260px',
        data: {name: ''},
        disableClose: true
      });
      dialogRef.afterClosed().subscribe(result => {
        this.ws.send('/sn ' +  result);
        this.ws.send('/g c ');
      });
    };
  }
}
