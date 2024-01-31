import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fund'
})
export class FundPipe implements PipeTransform {

  transform(value: boolean): string {
    return value? "yes": "no"
}
}
