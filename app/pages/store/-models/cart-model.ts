import { Observable, fromObject } from "tns-core-modules/data/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { ICart } from "../-entities/cart";
import { ProductsModel } from "./products-model";
import * as appSettings from "tns-core-modules/application-settings";

export class CartModel {

  private static _singleton: CartModel;
  public static singleton(): CartModel {

    if(CartModel._singleton === undefined){

      CartModel._singleton = new CartModel();
    }

    return CartModel._singleton;
  }

  private cartItems = new ObservableArray([]);
 
  public isFinishedQuest: Observable = new class extends Observable {
    private _status: boolean = false;
    get status(): boolean { return this._status; }
    set status(value) { this._status = value; }
    public reset(value = false) { this._status = value; }
  }();

  public removedData: Observable = new class extends Observable {
    private _length: number = 0;
    get length(): number { return this._length; }
    set length(value) { this._length = value; }
    public reset() { this._length = this._length === 0 ? -1 : 0; }
  }();

  public finished: boolean = false;

  public static countItems: Observable = new class extends Observable {
    private _length: number = JSON.parse(appSettings.getString("cartItems", "[]")).length;
    get length(): number { return this._length; }
    set length(value){ this._length = value; }
    public reset(value = 0) { this._length = value; }
  }();

  constructor() {

    CartModel.countItems.on("propertyChange", (data) => {

      // console.log("*****", data);
    });
  }

  public getItems(): any {

    const itemsData = appSettings.getString("cartItems", "[]");

    if(itemsData && JSON.parse(itemsData).length > 0) {

      const data = JSON.parse(itemsData);

      this.cartItems.splice(0);
      this.cartItems.push(data);
      this.mountCartItems();
    } else {

      setTimeout(() => {

        (<any>this.isFinishedQuest).reset(true);
        this.isFinishedQuest.set("status", false);
        this.removedData.set("length", 0);
        this.finished = true;
      }, 1000);
    }

    return this.cartItems;
  }

  public addItem(item: ICart): void {

    const itemsData = appSettings.getString("cartItems","[]");

    if(itemsData) {

      const data = JSON.parse(itemsData);
      let indexProductExist = -1;

      item.id = data.length;
      
      data.forEach((v, k) => {
        if(v.productId === item.productId) { indexProductExist = k; }
      });

      if(indexProductExist !== -1) {
        data[indexProductExist].quantity += item.quantity;
      } else {
        data.push(item);
        CartModel.countItems.set("length", data.length);
      }

      appSettings.setString("cartItems", JSON.stringify(data));
    } else {

      appSettings.setString("cartItems", JSON.stringify([item]));
    }
  }

  public updateItem(id: number, item: ICart): void {

    this.cartItems.setItem(id, item);

    let data = JSON.parse(appSettings.getString("cartItems", "[]"));
    data[id] = item;

    appSettings.setString("cartItems", JSON.stringify(data));
  }

  public deleteItem(id: number, callback: (() => void)): void {

    const data = JSON.parse(appSettings.getString("cartItems", "[]"));
    data.splice(id, 1);

    this.cartItems.splice(id, 1);

    CartModel.countItems.set("length", data.length);

    if(callback) { callback(); }

    this.cartItems.forEach((item, k) => {

      item.id = k;
      data[k].id = k.toString();

      this.cartItems.setItem(k, item);
    });

    appSettings.setString("cartItems", JSON.stringify(data));

    if(this.cartItems.length === 0) {

      (<any>this.isFinishedQuest).reset(true);
      this.isFinishedQuest.set("status", false);

      (<any>this.removedData).reset();
      this.removedData.set("length", 0);

      this.finished = true;
    }
  }

  private mountCartItems() {

    const obj = new ProductsModel();
    const that = this;

    this.cartItems.forEach((item, k) => {

      obj.getProductById(item.productId, (data) => {

        item.product = data;
        item.product.price = parseFloat(data.price).toFixed(2);

        item.priceSend = 0;
        item.priceSubtotal = (data.price * item.quantity).toFixed(2);
        item.priceTotal = parseFloat(item.priceSend ? item.priceSubtotal : item.priceSubtotal).toFixed(2);

        that.cartItems.setItem(k, item);

        if(k === (that.cartItems.length - 1)) {

          (<any>that.isFinishedQuest).reset();
          that.isFinishedQuest.set("status", true);

          that.finished = true;
        }
      });
    });
  }

}
