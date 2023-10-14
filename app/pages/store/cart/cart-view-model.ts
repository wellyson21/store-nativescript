import { Observable, fromObject } from "tns-core-modules/data/observable";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";
import { Internationalization } from "~/pages/shared/utilities/internationalization";
import { General } from "~/pages/shared/utilities/general";
import { ICart } from "../-entities/cart";
import { CartModel } from "../-models/cart-model";

export class CartViewModel extends Observable {

  private _internationalization: any;
  private _cartItems: any;

  @ObservableProperty() public priceTotal: number;

  @ObservableProperty() public haveDataToDisplay: boolean = true;
  @ObservableProperty() public isLoading: boolean = true;
  @ObservableProperty() public dataLength: number = 0;

  constructor() {
    super();
    
    this.getItems();
    this.getInternationalization();
  }

  get internationalization(): any{

    return this._internationalization;
  }
  
  get cartItems(): any {

    return this._cartItems;
  }

  set cartItems(newValue){

		this._cartItems = newValue;
  }

  private getItems() {

    const obj = CartModel.singleton();

    General.setLoaderAndPlaceholder(obj, this, "cartItems", "getItems");
  }

  private addItem(value: ICart) {

    CartModel.singleton().addItem(value);
  }

  private updateItem(id: number, value: ICart){

    CartModel.singleton().updateItem(id, value);
  }

  private deleteItem(id: number, callback: (() => void) = null) {

    CartModel.singleton().deleteItem(id, callback);
  }

  private getInternationalization(){

    this._internationalization = Internationalization.singleton().getData();
  }
    
}
