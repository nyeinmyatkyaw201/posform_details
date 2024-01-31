import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search',
})
export class SearchPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (!value) return null;
    if (!args) return value;

    args = args.toLowerCase();
  
    return value.filter((saveData: any) => {
  // if(saveData.refund == true){
  //   return(JSON.stringify(saveData.refund).toLocaleLowerCase() == "Refund")
  // }else if(saveData.refund == false){
  //   return (JSON.stringify(saveData.refund).toLocaleLowerCase() == "Not Refund")
  // }
      return (
        JSON.stringify(saveData.order_id).toLocaleLowerCase().includes(args) ||
        JSON.stringify(saveData.counter_no)
          .toLocaleLowerCase()
          .includes(args) ||
        JSON.stringify(saveData.casher_name)
          .toLocaleLowerCase()
          .includes(args) || JSON.stringify(saveData.refund).toLocaleLowerCase().includes(args) || 
          JSON.stringify(saveData.discount)
          .toLocaleLowerCase()
          .includes(args) || JSON.stringify(saveData.discount_percentage)
          .toLocaleLowerCase()
          .includes(args) || JSON.stringify(saveData.order_date)
          .toLocaleLowerCase()
          .includes(args));
      

      // return (
      //   JSON.stringify(saveData.order_id).toLocaleLowerCase().includes(args) ||
      //   JSON.stringify(saveData.counter_no)
      //     .toLocaleLowerCase()
      //     .includes(args) ||
      //   JSON.stringify(saveData.casher_name)
      //     .toLocaleLowerCase()
      //     .includes(args) ||
      //   JSON.stringify(saveData.order_date)
      //     .toLocaleLowerCase()
      //     .includes(args)   ||
      //          JSON.stringify(saveData.order_date)
      //     .toLocaleLowerCase()
      //     .includes(args) 
      // );
    });
  }
}
