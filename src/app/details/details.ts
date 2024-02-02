export class FormDataModel {
    id?: number;
    item!: string;
    price!: number;
    quantity!: number;
    amount!: number;
    discount_percentage: number = 0;
    discount_amount!: number;
    sub_total!: number;
    rechange!: string;
    order_id? : number;
  }