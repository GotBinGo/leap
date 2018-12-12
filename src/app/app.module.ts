import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatCardModule, MatSidenavModule, MatInputModule, MatIconModule, MatChipsModule, MatFormFieldModule, MatDialogModule } from '@angular/material';
import { GameComponent } from './game/game.component';
import { RouterModule } from '@angular/router';
import { PromptComponent } from './connection.service';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    PromptComponent,
  ],
  imports: [
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatSidenavModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatDialogModule,
    RouterModule.forRoot([
      { path: '**', component: AppComponent }
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [PromptComponent]
})
export class AppModule { }
