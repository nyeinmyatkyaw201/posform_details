import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private orderIdKey = 'myorder_id';
  constructor(private http: HttpClient,private dialog: MatDialog) {}

   

  saveOrder(saveData: Object) {
    return this.http.post('http://localhost:3000/api/v1/posform', saveData);
  }
  getOrder() {
    return this.http.get('http://localhost:3000/api/v1/posform');
  }
  delete(id: any) {
    return this.http.delete(`http://localhost:3000/api/v1/posform/${id}`);
  }
  update(id: any,data : any){
  
   return this.http.patch(`http://localhost:3000/api/v1/posform/${id}`,data)
  }
  saveAll(data: any){
    return this.http.post('http://localhost:3000/api/v1/posform/saveall', data)
  }
  saveStock(data : any){
    return this.http.post('http://localhost:3000/api/v1/stock', data);
  }
  getAndDelete(id : any): Observable<any>{
    return this.http.delete(`http://localhost:3000/api/v1/stock/getDelete/${id}`)
  }

  getOrderStock(id : any){
    return this.http.get(`http://localhost:3000/api/v1/stock/orderstock/${id}`);
  }
  deleteStock(id : any): Observable<any>{
    return this.http.delete(`http://localhost:3000/api/v1/stock/${id}`);
  }
  deleteOrderStock(id:any){
    return this.http.delete(`http://localhost:3000/api/v1/stock/orderstock/${id}`);
  }
  saveAllStock(data : any){
    return this.http.post('http://localhost:3000/api/v1/stock/savefromexcel', data)
  }

  saveOrderStock(data : any){
    return this.http.post('http://localhost:3000/api/v1/posformstock', data)
  }

  create(data:any){
    return this.http.post('http://localhost:3000/api/v1/posformstock/create', data)
  }

  getAllStock(){
    return this.http.get("http://localhost:3000/api/v1/stock")
  }
  openConfirmationDialog(message: string) {
    return this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { message: message }
    });
  }


  setOrderId(orderId: number | null) {
    localStorage.setItem(this.orderIdKey, JSON.stringify(orderId));
  }

  getOrderId(): number | null {
    const storedValue = localStorage.getItem(this.orderIdKey);
    return storedValue ? JSON.parse(storedValue) : null;
  }
}
