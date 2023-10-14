import { Observable, fromObject } from "tns-core-modules/data/observable/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { firestore } from "nativescript-plugin-firebase";
import { EProductCategory } from "../-entities/product";
import * as appSettings from "tns-core-modules/application-settings";
import { CartModel } from "./cart-model";

export class ProductsModel {

  private static _singleton: ProductsModel;
  public static singleton(): ProductsModel {

    if(ProductsModel._singleton === undefined) {
      ProductsModel._singleton = new ProductsModel();
    }

    return ProductsModel._singleton;
  }
  
  private didLoadingOfCategories: boolean = false;
  private didLoadingOfProducts: boolean = false;

  private productCategories: any = new ObservableArray([]);
  private countProductCategories: number = 0;

  private products: any = new ObservableArray([]);
  private countProducts: number = 0;

  public isFinishedQuest: Observable = new class extends Observable{
    private _status: boolean = false;
    get status(): boolean { return this._status; }
    set status(value) { this._status = value; }
    public reset(value = false) { this._status = value; }
  }();

  public removedData: Observable = new class extends Observable{
    private _length: number = 0;
    get length(): number { return this._length; }
    set length(value) { this._length = value; }
    public reset() { this._length = this._length === 0 ? -1 : 0; }
  }();
  
  public finished: boolean = false;

  constructor(filter: any = null) {

    this.requestProducts(filter);
    this.requestProductCategories();
  }

  public getProductCategories(): any {
    return this.productCategories;
  }

  public getProducts(): any {
    return this.products;
  }

  public getProductById(id: string, callback: any): void {

    firestore.collection("StoreProducts").doc(id).onSnapshot((snapshotProduct) => {

      const docData = snapshotProduct.data();
      docData.id = snapshotProduct.id;

      if(docData.visible) {
        callback(docData);
      }
    });
  }
  
  private requestProducts(filter: any) {

    const that = this;

    if(filter == null) {

      firestore.collection("StoreProducts").onSnapshot((snapshotProducts) => {
        that.auxRequestProducts(snapshotProducts);
      });
    } else if(filter.categoryId != null) {

      const docRef = firestore.docRef(`StoreProductCategories/${filter.categoryId}`);

      firestore.collection("StoreProducts").where("category", "==", docRef).onSnapshot((snapshotProducts) => {
        that.auxRequestProducts(snapshotProducts);
      });
    }
  }

  private requestProductCategories() {

    firestore.collection("StoreProductCategories").orderBy("name", "asc").onSnapshot((snapshotProductCategories) => {

      snapshotProductCategories.docChanges().forEach((change) => {

        const type = change.type;
        const docId = change.doc.id;
        const docData = change.doc.data();
        
        const obj = new EProductCategory({
          id: docId,
          name: docData.name,
          backgroundImage: docData.backgroundImage
        });

        if(docData.visible) {
  
          if (type === "added") {
  
            this.productCategories.push(obj);
            this.countProductCategories++;
          } else if (type === "modified") {
  
            let willFound = false;
  
            for (let i = 0; i < this.countProductCategories; i++) {
  
              if (this.productCategories.getItem(i).id === docId) {
  
                this.productCategories.setItem(i, obj);
                willFound = true;
              }
            }
  
            if(!willFound) {
  
              this.productCategories.push(obj);
              this.countProductCategories++;
            }
          }
        } else if(!docData.visible && this.didLoadingOfCategories) {

          for (let i = 0; i < this.countProductCategories; i++) {
  
            if (this.productCategories.getItem(i).id === docId) {

              this.productCategories.splice(i, 1);
              this.countProductCategories--;
            }
          }
        }        
      });

      this.didLoadingOfCategories = true;
    });
  }

  private auxRequestProducts(snapshotProducts: any) {

    if(snapshotProducts.docSnapshots.length === 0) {

      (<any>this.isFinishedQuest).reset(true);
      this.isFinishedQuest.set("status", false);

      (<any>this.removedData).reset();
      this.removedData.set("length", 0);
      
      this.finished = true;

      return;
    }

    snapshotProducts.docChanges().forEach((change: any, k: number) => {

      const that = this;

      const type = change.type;
      const docId = change.doc.id;
      const docData = change.doc.data();
      docData.id = docId;
      docData.price = parseFloat(docData.price).toFixed(2);

      if(docData.visible) {

        if (type === "added") {

          requestCategory(docData.category, (data) => {

            docData.category = data;
            
            that.products.push(docData);
            that.countProducts++;
          });
        } else if (type === "modified") {

          for (let i = 0; i < this.countProducts; i++) {

            let willFound = false;

            if (this.products.getItem(i).id === docId) {

              if (docData.category.id === this.products.getItem(i).category.id) {

                docData.category = this.products.getItem(i).category;
                this.products.setItem(i, docData);
              } else {

                requestCategory(docData.category, (data) => {
                  docData.category = data;
                  that.products.setItem(i, docData);
                });
              }

              willFound = true;
            }

            if(!willFound) {

              requestCategory(docData.category, (data) => {
                docData.category = data;
                that.products.push(docData);
                that.countProducts++;
              });
              break;
            }
          }
        }
      } else if(!docData.visible && this.didLoadingOfProducts) {

        for (let i = 0; i < this.countProducts; i++) {
  
          if (this.products.getItem(i).id === docId) {

            this.products.splice(i, 1);
            this.countProducts--;
          }
        }
      } else if(!docData.visible) {
        
        this.checkProductsInCart(docId); 
      }

      if(k === (snapshotProducts.docSnapshots.length - 1)) {

        setTimeout(() => {

          that.finished = true;
          (<any>that.isFinishedQuest).reset();
          that.isFinishedQuest.set("status", true);
        }, 1500);
      }
    });

    function requestCategory(docCategory, callback) {

      docCategory.onSnapshot((snapshotCategories: any) => {

        const categoryData = {
          id: snapshotCategories.id,
          name: snapshotCategories.data().name || "",
          backgroundImage: snapshotCategories.data().backgroundImage
        };

        callback(categoryData);
      });
    }

    this.didLoadingOfProducts = true;
  }

  private checkProductsInCart(id: string) {

    const items = JSON.parse(appSettings.getString("cartItems", "[]"));

    let i = 0;
    for(const item of items) {
      if(item.productId === id) {
        items.splice(i, 1);
      }
      i++;
    }

    appSettings.setString("cartItems", JSON.stringify(items));

    CartModel.countItems.set("length", items.length);
  }

}
