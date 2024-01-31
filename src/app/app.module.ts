import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PosformComponent } from './posform/posform.component';
import { FormsModule } from '@angular/forms';
import { SearchPipe } from './search.pipe';
import { FundPipe } from './fund.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { DetailsComponent } from './details/details.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { MatDialogModule } from '@angular/material/dialog'




@NgModule({
  declarations: [
    AppComponent,
    PosformComponent,
    SearchPipe,
    FundPipe,
    DetailsComponent,
    ConfirmationDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgxPaginationModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatCardModule,
    MatDialogModule
   
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
