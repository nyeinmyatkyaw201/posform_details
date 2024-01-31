import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PosformComponent } from './posform/posform.component';
import { DetailsComponent } from './details/details.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'posform',
    pathMatch: 'full'
  },
  {
    path: 'posform',
    component: PosformComponent,
  },
{
    path:'detail',
    component:DetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
