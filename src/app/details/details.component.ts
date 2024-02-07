import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormDataModel } from './details';
import * as XLSX from 'xlsx';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class DetailsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  constructor(
    private api: ApiService,
    private router: ActivatedRoute,
    private myroute: Router,
    private confirmationDialogService: ApiService
  ) {}
  inputdatas: FormDataModel[] = [];
  myorder_id: any;
  order: any = {};
  stocks: string[] = [
    'Pencil',
    'Pen',
    'Book',
    'Eraser',
    'Ruler',
    'Drawing Pencil',
  ];
  orderIDarray: any[] = [];

  myRechanges: any[] = ['Yes', 'No'];

  selectedItems: string[] = [];
  rows: FormDataModel[] = [];
  mydatas: any = [];

  addRow() {
    const newFormData: FormDataModel = new FormDataModel();
    this.inputdatas.push(newFormData);
    this.saveDataToStorage();
  }
  removeRow(index: number) {
    this.inputdatas.splice(index, 1);
    this.saveDataToStorage();
  }

  // Save data to localStorage
  saveDataToStorage() {
    if (this.myorder_id !== null) {
      const key = `formData_${this.myorder_id}`;
      localStorage.setItem(key, JSON.stringify(this.inputdatas));
    }
  }
  ngOnInit(): void {
    this.myorder_id = this.api.getOrderId();

    if (this.myorder_id !== null) {
      this.getOrderStock();
      this.getStocks();
    }
    this.loadDataFromStorage();
    this.getallStock();
    console.log(this.inputdatas, 'inputdata');
  }

  loadDataFromStorage() {
    if (this.myorder_id !== null) {
      const key = `formData_${this.myorder_id}`;
      const storedData = localStorage.getItem(key);
      if (storedData) {
        this.inputdatas = JSON.parse(storedData);
      }
    }
  }

  clearPercentage() {
    if (this.order.discount == false) {
      this.order.discount_percentage = 0;
    }
  }
  updateCalculations() {
    for (const inputdata of this.inputdatas) {
      // Calculate derived properties
      inputdata.amount = inputdata.price * inputdata.quantity;
      inputdata.discount_amount =
        (inputdata.amount / 100) * inputdata.discount_percentage;
      inputdata.sub_total = inputdata.amount - inputdata.discount_amount;
    }
    this.saveDataToStorage();
  }
  newTemplate() {
    this.api.setOrderId(null);
    this.myorder_id = this.api.getOrderId();
    if (this.myorder_id !== null) {
      this.getOrderStock();
    }

    // Reload the current route
    this.inputdatas = [];
    this.order = [];
    this.rows = [];
    this.getallStock();
    this.myroute.navigate(['/detail'], { replaceUrl: true });
  }

  convertString(str: boolean): string {
    return str ? 'Yes' : 'No';
  }
  gotoPosform() {
    this.myroute.navigate(['/posform']);
  }

  async saveData() {
    if (this.myorder_id === null || this.myorder_id === undefined) {
      // If order_id is null or undefined, call saveOrderStock function
      await this.create();
    } else {
      // If order_id is not null, call saveStock function
      await this.processFunction();
    }
  }
  removeObjectById(array: any[], idToRemove: number): void {
    const indexToRemove: number = array.findIndex(
      (obj) => obj.id === idToRemove
    );
    if (indexToRemove !== -1) {
      array.splice(indexToRemove, 1);
    }
  }
  async deleteStock(id: any) {
    await this.api.deleteStock(id).subscribe({
      next: (res: any) => {
        alert(`${res.message}`);
        this.removeObjectById(this.rows, id);
      },
      error: (err: any) => {
        console.log(err.error);
        alert(err.error.message);
      },
    });
  }
  // save data oneby one
  async saveStock() {
    for (const inputdata of this.inputdatas) {
      // Calculate derived properties
      inputdata.amount = inputdata.price * inputdata.quantity;
      inputdata.discount_amount =
        (inputdata.amount / 100) * inputdata.discount_percentage;
      inputdata.sub_total = inputdata.amount - inputdata.discount_amount;

      // Prepare data for API call
      const saveStockData = {
        order_id: this.myorder_id,
        item: inputdata.item,
        price: inputdata.price,
        quantity: inputdata.quantity,
        amount: inputdata.amount,
        discount_percentage: inputdata.discount_percentage,
        discount_amount: inputdata.discount_amount,
        sub_total: inputdata.sub_total,
        rechange: inputdata.rechange == 'Yes' ? true : false,
      };

      await this.api.saveStock(saveStockData).subscribe({
        next: (res: any) => {
          console.log(res, 'response');
        },
        error: (err: any) => {
          console.log(err.error);
          alert(err.error.message);
        },
      });
    }
  }

  async processFunction() {
    let successMessageShown = false;


    try {
      console.log(this.rows);

      if (this.rows.length > 0) {
        // Call getAndDelete
        await new Promise((resolve, reject) => {
          this.api.getAndDelete(this.myorder_id).subscribe({
            next: (res: any) => {
              console.log(res, 'response');
              // alert(`${res.message}`);
              resolve(res);
            },
            error: (err: any) => {
              console.log(err.error);
              alert(err.error.message);
              reject(err);
            },
          });
        });
      }

      // Call saveAllStock
      await new Promise((resolve, reject) => {
        this.api
          .saveAllStock(
            this.inputdatas.map((item) => ({
              ...item,
              rechange: item.rechange === 'Yes' ? true : false,
              order_id: (item.order_id = this.myorder_id),
            }))
          )
          .subscribe({
            next: (res: any) => {
              console.log(res, 'response');
              const keyToRemove = `formData_${this.myorder_id}`;
              localStorage.removeItem(keyToRemove);
              this.loadDataFromStorage()
              this.getallStock();
              resolve(res);
            },
            error: (err: any) => {
              console.log(err.error);
              alert(err.error.message);
              reject(err);
            },
          });
      });

      successMessageShown = true;
      console.log('All operations completed successfully.');
    } catch (error) {
      // Handle errors for both operations
      console.error(error);
      alert(error);
    }

    // Show the success message only once
    if (successMessageShown) {
      alert('All operations completed successfully.');
    }
  }

  // async saveAllStock() {
  //   await this.api
  //     .saveAllStock(
  //       this.inputdatas.map((item) => ({
  //         ...item,
  //         rechange: item.rechange === 'Yes' ? true : false,
  //         order_id: (item.order_id = this.myorder_id),
  //       }))
  //     )
  //     .subscribe({
  //       next: (res: any) => {
  //         console.log(res, 'response');
  //         const key = `formData_${this.myorder_id}`;

  //         // Remove the item with the specified key from local storage
  //         localStorage.removeItem(key);
  //         alert(`${res.message}`);
  //       },
  //       error: (err: any) => {
  //         console.log(err.error);
  //         alert(err.error.message);
  //       },
  //     });
  // }
  // fpr excelImport
  async saveOrderStock() {
    const orderData = {
      order_id: this.order.order_id,
      casher_name: this.order.casher_name,
      counter_no: this.order.counter_no,
      order_date: this.order.order_date || Date.now(),
      refund: this.order.refund,
      discount: this.order.discount,
      discount_percentage: this.order.discount_percentage || 0,
      stock: this.inputdatas.map((item) => ({
        ...item,
        rechange: item.rechange === 'Yes' ? true : false,
      })),
    };
    console.log(orderData);
    await this.api.saveOrderStock(orderData).subscribe({
      next: (res: any) => {
        console.log(res, 'response');
        this.myorder_id = orderData.order_id;
        localStorage.setItem('myorder_id', this.myorder_id);
        console.log(this.myorder_id);
        alert(`${res.message}`);
      },
      error: (err: any) => {
        console.log(err.error);
        alert(err.error.message);
      },
    });
  }

  //for create
  async create() {
    const orderData = {
      order_id: this.order.order_id,
      casher_name: this.order.casher_name,
      counter_no: this.order.counter_no,
      order_date: this.order.order_date || Date.now(),
      refund: this.order.refund,
      discount: this.order.discount,
      discount_percentage: this.order.discount_percentage || 0,
      stock: this.inputdatas.map((item) => ({
        ...item,
        rechange: item.rechange === 'Yes' ? true : false,
      })),
    };
    console.log(orderData);
    await this.api.create(orderData).subscribe({
      next: (res: any) => {
        console.log(res, 'response');
        this.myorder_id = orderData.order_id;
        localStorage.setItem('myorder_id', this.myorder_id);
        console.log(this.myorder_id);
        alert(`${res.message}`);
      },
      error: (err: any) => {
        console.log(err.error);
        alert(err.error.message);
      },
    });
  }

  async getOrderStock() {
    await this.api.getOrderStock(this.myorder_id).subscribe({
      next: (res: any) => {
        console.log(res, 'response');
        this.rows = res.data[0].stock.map((item: any) => ({
          ...item,
          rechange: this.convertString(item.rechange),
        }));
        this.order = res.data[0];
        console.log('>>>>>>');
        console.log(this.order);
      },
      error: (err: any) => {
        console.log(err.message);
      },
    });
  }

  async deletOrderStock() {
    const id = this.myorder_id;
    await this.api.deleteOrderStock(id).subscribe({
      next: (res: any) => {
        alert(`${res.message}`);
        this.gotoPosform();
        console.log(res, 'response');
      },
      error: (err: any) => {
        alert(`${err.message}`);
      },
    });
  }
  async getStocks() {
    await this.api.getStocks(this.myorder_id).subscribe({
      next: (res: any) => {
        console.log(res, 'response');

        this.mydatas = res.stock.map((item: any) => ({
          ...item,
          rechange: item.rechange ? 'Yes' : 'No',
        }));
        console.log(this.mydatas)

        for (let row of this.mydatas) {
          // Check if the item already exists in inputdatas
          const exists = this.inputdatas.some(
            (existingRow) => existingRow.id === row.id
          ); // replace 'someKey' with the actual key you want to compare

          if (!exists) {
            this.inputdatas.push(row);
           
          }

          const key = `formData_${this.myorder_id}`;

          localStorage.setItem(key, JSON.stringify(this.inputdatas));
          this.loadDataFromStorage();
        }

        console.log(this.inputdatas, 'input');
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
  async getallStock() {
    await this.api.getAllStock().subscribe({
      next: (res: any) => {
        console.log(res, 'response');
        this.orderIDarray = res.data.map((item: any) => item.order_id);
        console.log(this.orderIDarray);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  onDeleteClick() {
    const message = 'Are you sure you want to delete?';
    const dialogRef =
      this.confirmationDialogService.openConfirmationDialog(message);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Perform the deletion logic here
        this.deletOrderStock();
        console.log('Deleting...');
      } else {
        console.log('Deletion canceled.');
      }
    });
  }

  exportToExcel(data: any[], fileName: string): void {
    // Define the columns to export
    const mainColumnsToExport = [
      'order_id',
      'counter_no',
      'casher_name',
      'order_date',
    ];
    const stockColumnsToExport = [
      'item',
      'price',
      'quantity',
      'discount_amount',
      'discount_percentage',
      'amount',
      'sub_total',
      'rechange',
    ];

    // Executed unwanted columns
    const unwantedColumns = [
      'createdAt',
      'updatedAt',
      'discount',
      'discount_percentage',
      'refund',
    ];

    const flattenedData: any[] = [];

    data.forEach((item) => {
      // Include columns from stock array
      if (item.stock && Array.isArray(item.stock) && item.stock.length > 0) {
        item.stock.forEach((stockItem: any) => {
          const rowData: any = {};

          // Include main columns
          mainColumnsToExport.forEach((mainKey) => {
            if (!unwantedColumns.includes(mainKey)) {
              rowData[mainKey] = item[mainKey];
            }
          });

          // Include columns from stock item
          stockColumnsToExport.forEach((stockKey) => {
            rowData[`${stockKey}`] = stockItem[stockKey];
          });

          flattenedData.push(rowData);
        });
      } else {
        // Include main columns only (no 'stock' items)
        const rowData: any = {};
        mainColumnsToExport.forEach((mainKey) => {
          if (!unwantedColumns.includes(mainKey)) {
            rowData[mainKey] = item[mainKey];
          }
        });
        flattenedData.push(rowData);
      }
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(flattenedData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  onFileChange(event: any) {
    const fileInput = event.target;
    const file = event.target.files[0];

    if (file) {
      this.readFile(file);
      fileInput.value = '';
    }
  }
  readFile(file: any) {
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const binaryString: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(binaryString, {
        type: 'binary',
      });

      const sheetName: string = workbook.SheetNames[0];
      const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

      // Convert the worksheet to an array of objects
      const excelData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        raw: true,
      });

      // Process the Excel data as needed
      console.log(excelData);

      const transformed_data = excelData.map((entry: any) => ({
        casher_name: entry['casher_name'],
        counter_no: entry['counter_no'],
        discount_percentage: entry['discount_percentage'],
        order_date: entry['order_date'],
        order_id: entry['order_id'],
        stock: {
          amount: entry['amount'],
          discount_amount: entry['discount_amount'],
          discount_percentage: entry['discount_percentage'],
          item: entry['item'],
          price: entry['price'],
          quantity: entry['quantity'],
          rechange: entry['rechange'],
          sub_total: entry['sub_total'],
        },
      }));
      const orderIds = transformed_data.map((entry) => entry.order_id);

      // this.saveOrder(excelData);
      // const transformed_data = {
      //   casher_name: excelData[0]['casher_name'],
      //   counter_no: excelData[0]['counter_no'],
      //   discount_percentage: excelData[0]['discount_percentage'],
      //   order_date: excelData[0]['order_date'],
      //   order_id: excelData[0]['order_id'],
      //   stock: excelData.map((entry: any) => ({
      //     amount: entry['amount'],
      //     discount_amount: entry['discount_amount'],
      //     discount_percentage: entry['discount_percentage'],
      //     item: entry['item'],
      //     price: entry['price'],
      //     quantity: entry['quantity'],
      //     rechange: entry['rechange'],
      //     sub_total: entry['sub_total'],
      //   })),
      // };

      transformed_data.forEach((item) => {
        const formData = new FormDataModel();
        formData.item = item.stock.item;
        formData.price = item.stock.price;
        formData.quantity = item.stock.quantity;
        formData.amount = item.stock.amount;
        formData.discount_percentage = item.stock.discount_percentage;
        formData.discount_amount = item.stock.discount_amount;
        formData.sub_total = item.stock.sub_total;
        formData.rechange = item.stock.rechange ? 'true' : 'false';
        formData.order_id = item.order_id;

        // this.inputdatas.push(formData)
      });
      // Save to localStorage

      this.combinedFunction(orderIds, transformed_data);
      console.log(this.inputdatas);
      for(let id of orderIds){
        const keyToRemove = `formData_${id}`;
      localStorage.removeItem(keyToRemove);
      this.loadDataFromStorage()
      }
      
      this.newTemplate();
    };

    reader.readAsBinaryString(file);
  }
  openFileInput() {
    // Trigger a click on the hidden file input
    this.fileInput.nativeElement.click();
  }
  async combinedFunction(idarray: any, data: any) {
    try {
      await this.processGetAndDeleteOperations(idarray);
      await this.processSaveOrderStock(data);

      console.log('All operations completed successfully.');
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  private async processGetAndDeleteOperations(idarray: any) {
    const processedOrderIds = new Set();
    for (const orderId of idarray) {
      // Check if the orderId is already processed
      if (
        !processedOrderIds.has(orderId) &&
        this.orderIDarray.includes(orderId)
      ) {
        try {
          const res = await new Promise((resolve, reject) => {
            this.api.getAndDelete(orderId).subscribe({
              next: (response: any) => {
                console.log(response, 'response');
                const key = `formData_${this.myorder_id}`;
                localStorage.removeItem(key);
                resolve(response);
              },
              error: (err: any) => {
                console.log(err.error);
                alert(err.error.message);
                reject(err);
              },
            });
          });
          // Process res if needed

          // Add orderId to the set to mark it as processed
          processedOrderIds.add(orderId);
        } catch (error) {
          // Handle errors for getAndDelete operation
          console.error(error);
          throw new Error(
            `getAndDelete operation failed for orderId: ${orderId}`
          );
        }
      }
    }
  }

  private async processSaveOrderStock(data: any) {
    try {
      const res = await new Promise((resolve, reject) => {
        this.api.saveOrderStock(data).subscribe({
          next: (response: any) => {
            console.log(response, 'response');
            alert(response.message);
            this.myroute.navigate(['/posform']);

            resolve(response);
          },
          error: (err: any) => {
            console.log(err.error);
            alert(err.error.message);
            reject(err);
          },
        });
      });

      // Process res if needed
    } catch (error) {
      // Handle errors for saveOrderStock operation
      console.error(error);
      throw new Error('saveOrderStock operation failed');
    }
  }

  // async combinedFunction(idarray: any, data: any) {
  //   try {
  //     for (const orderId of idarray) {
  //       // Call getAndDelete for each order ID
  //       if (this.orderIDarray.includes(orderId)) {
  //         await new Promise((resolve, reject) => {
  //           this.api.getAndDelete(orderId).subscribe({
  //             next: (res: any) => {
  //               console.log(res, 'response');
  //               const key = `formData_${this.myorder_id}`;

  //               // Remove the item with the specified key from local storage
  //               localStorage.removeItem(key);
  //               resolve(res);
  //             },
  //             error: (err: any) => {
  //               console.log(err.error);
  //               alert(err.error.message);
  //               reject(err);
  //             },
  //           });
  //         });
  //       }
  //     }

  //     // Call saveOrderStock for each order ID

  //     await new Promise((resolve, reject) => {
  //       this.api.saveOrderStock(data).subscribe({
  //         next: (res: any) => {
  //           console.log(res, 'response');
  //           alert(res.message);
  //           resolve(res);
  //         },
  //         error: (err: any) => {
  //           console.log(err.error);
  //           alert(err.error.message);
  //           reject(err);
  //         },
  //       });
  //     });

  //     console.log('All operations completed successfully.');
  //   } catch (error) {
  //     // Handle errors for both operations
  //     console.error(error);
  //     alert(error);
  //   }
  // }
}
