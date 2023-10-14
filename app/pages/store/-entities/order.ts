import { Observable } from "tns-core-modules/ui/page/page";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { IProfile } from "~/pages/more/-entities/profile";


export class EOrder extends Observable{

  @ObservableProperty() public id: string;
  @ObservableProperty() public items: ObservableArray<EOrderItem> = new ObservableArray([]);
  @ObservableProperty() public totalPrice: number;
  @ObservableProperty() public quantity: number;
  @ObservableProperty() public createDate: string;
  @ObservableProperty() public profile: IProfile;
  @ObservableProperty() public deliveryStatus: string;
  @ObservableProperty() public visible: boolean = true;

  public constructor(data: any){
    super();

    if(data != undefined){

      this.id = data.id;
      this.items = data.items == undefined ? [] : data.items;
      this.quantity = data.quantity == undefined ? 0 : data.quantity;
      this.totalPrice = data.totalPrice == undefined ? 0 : data.totalPrice;
      this.createDate = (data.createDate as Date).toLocaleDateString();
      this.deliveryStatus = data.deliveryStatus;
      this.visible = data.visible == undefined ? true : data.visible;
    }
  }
}


export class EOrderItem extends Observable{

  @ObservableProperty() public productId: string;
  @ObservableProperty() public orderId: string;
  @ObservableProperty() public name: string;
  @ObservableProperty() public mainImage: string;
  @ObservableProperty() public price: number;
  @ObservableProperty() public quantity: number;

  public constructor(data: any){
    super();

    if(data != undefined){

      this.price = data.price;
      this.quantity = data.quantity;
      this.productId = data.productId;
      this.orderId = data.orderId;
    }
  }

  public setProductData(data: any){

    this.name = data.title;
    this.mainImage = data.images[0];
  }
}

export interface IOrder{
  id?: string;
  items: Array<EOrderItem>
}