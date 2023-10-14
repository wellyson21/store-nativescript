import { Observable, fromObject } from "tns-core-modules/data/observable/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { firestore } from "nativescript-plugin-firebase";
import { EProductCategory, EProduct } from "../-entities/product";
import * as applicationSettings from "tns-core-modules/application-settings";
import { FirebaseUtilities } from "~/pages/shared/utilities/firebase-utilities";
import { IPaypalOrder } from "~/pages/shared/utilities/paypal";
import { EOrder, EOrderItem } from "../-entities/order";

export class OrderListModel {

  private static _singleton: OrderListModel;
  public static singleton(): OrderListModel {

    if(OrderListModel._singleton === undefined){

      OrderListModel._singleton = new OrderListModel();
    }

    return OrderListModel._singleton;
  }
  
  private productCategories: any = new ObservableArray([]);
  private countProductCategories: number = 0;

  private listItems: ObservableArray<any> = new ObservableArray([]);
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

    this.requestProductsAtFirestore(filter);
  }

  public getProductCategories(): any {

    return this.productCategories;
  }

  public getListItems(): any {
    
    return this.listItems;
  }

  public async removeOrder(id: string){

    let resolveWS: (status: boolean)=> void;
    firestore.collection("StoreCustomersOrders" ).doc(id).get().then((snapshotProduct) => {
      if(snapshotProduct.exists){
        snapshotProduct.ref.delete().then(()=>{
          resolveWS(true);
        }).catch(()=>{

          resolveWS(false);          
        });
      }else{

        resolveWS(false);
      }
    }).catch(()=>{

      resolveWS(false);
    });

    return await new Promise<boolean>((resolve)=>{ resolveWS = resolve; });
  }

  private requestProductsAtFirestore(filter: any) {

    const that = this;

    if(filter == null) {

      firestore.collection("StoreCustomersOrders").orderBy("createDate","desc").where("email","==",applicationSettings.getString("email","").trim()).onSnapshot((snapshotOrders) => {

        that.auxRequestProductsAtFirebase(snapshotOrders);
      },e=>{

        console.log("Orders fetch data error: ",e);
      });

      firestore.collection("StoreCustomersOrders").where("status","==","occurring").where("email","==",applicationSettings.getString("email","").trim()).get().then((snapshotOrders) => {
        snapshotOrders.docs.forEach((doc, k: number) => {
          doc.ref.delete();
        });
      });

      firestore.collection("StoreCustomersOrders").where("status","==","occurring").where("email","==",applicationSettings.getString("email","").trim()).get().then((snapshotOrders) => {
        snapshotOrders.docs.forEach((doc, k: number) => {
          doc.ref.delete();
        });
      });
    } else if(filter.categoryId != null) { } 
  }

  private auxRequestProductsAtFirebase(snapshotProducts: any) {

    if(snapshotProducts.docSnapshots.length === 0){

      (<any>this.isFinishedQuest).reset(true);
      this.isFinishedQuest.set("status", false);

      (<any>this.removedData).reset();
      this.removedData.set("length", 0);

      this.finished = true;
    }

    let isAddedData = false;
    let hasData = false;
    snapshotProducts.docChanges().forEach((change: any, k: number) => {

      const type = change.type;
      const docId = change.doc.id;
      const docData = change.doc.data();
      docData.id = docId;
      let eorder = new EOrder(docData);
      let self = this;
  
      function addOrder(docData,eorder,k){
        let index = 0;
        let hasData = false;
        (docData.orders as Array<IPaypalOrder>).forEach((order)=>{
    
          FirebaseUtilities.getDocOnSnapshotData(firestore.collection("StoreProducts").doc(order.id),EProduct, product=>{
    
            if(product.entities.length === 0){
    
              index++;
              return;
            }
    
            let orderItem = new EOrderItem({
              price: docData.orders[index].price,
              quantity: docData.orders[index].quantity,
              productId: docData.orders[index].id,
              orderId: docData.id
            });
    
            orderItem.setProductData(product.entities[0].entity);
            eorder.items.push(orderItem);
            index++;
          });
    
    
          let interval = setInterval(()=>{
            if((docData.orders as Array<IPaypalOrder>).length == index){
  
              let length = self.listItems.length;
              let hasAdded = false;
              for(let i = 0; i < length; i++){
  
                let o = self.listItems.getItem(i);
                if(o.id.trim() == eorder.id.trim()){
  
                  self.listItems.splice(i,1,eorder);
                  hasAdded = true;
                }
              }
  
              if(!hasAdded){

                self.listItems.push(eorder);
                if(!hasData){
  
                  hasData = true;
                  self.finished = true;

                  (<any>self.isFinishedQuest).reset();
                  self.isFinishedQuest.set("status", true);
                }
              }
    
                clearInterval(interval);
              }
            },0);
        });


      }

      if(docData.status == "occurring"){return;}else{

        if (type === "added") {
          isAddedData = true;
          addOrder(docData,eorder,k);
          hasData = true;
        }else if(type === "modified"){

          let found: boolean = false;
          for(let i = 0;i < this.listItems.length;i++){
            let o = this.listItems.getItem(i);
            if(o.id.trim() == docData.id.trim()){

              o.deliveryStatus = docData.deliveryStatus;
              this.listItems.splice(i,1,o);
              found = true;
              break;
            }
          }

          if(!found && docData.status === "finished"){

            addOrder(docData,eorder,k);
          }
        }
      }
    });

    if(!hasData && isAddedData){

      (<any>this.isFinishedQuest).reset(true);
      this.isFinishedQuest.set("status", false);

      (<any>this.removedData).reset();
      this.removedData.set("length", 0);
      
      this.finished = true;
    }
  }  


}
