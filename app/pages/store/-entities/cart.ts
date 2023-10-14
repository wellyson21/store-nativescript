import { Observable } from "tns-core-modules/data/observable";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";

export class ECart extends Observable implements ICart {
  
  @ObservableProperty() public id?: string;
  @ObservableProperty() public productId: string;
  @ObservableProperty() public quantity: number;
  @ObservableProperty() public combinationId?: string;
  
  @ObservableProperty() public product?: any;
  @ObservableProperty() public priceSubtotal?: number;
  @ObservableProperty() public priceSend?: number;
  @ObservableProperty() public priceTotal?: number;  

  constructor(data: ICart = null) {
    super();

    if (data) {

      this.id = data.id;
      this.productId = data.productId;
      this.quantity = data.quantity;
      this.combinationId = data.combinationId; 
    }
  } 

}

export interface ICart {
  id?: string;
  productId: string;
  quantity: number;
  combinationId?: string;
  product?: any;
  priceSubtotal?: number;
  priceSend?: number;
  priceTotal?: number;  
}
