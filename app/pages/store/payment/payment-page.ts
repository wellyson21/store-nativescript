import { Page, EventData, ShowModalOptions } from "tns-core-modules/ui/page/page";
import { ESFrame } from "~/pages/shared/utilities/esframe";
import { Paypal } from "~/pages/shared/utilities/paypal";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { General } from "~/pages/shared/utilities/general";
import { Internationalization } from "~/pages/shared/utilities/internationalization";
import * as builder from "tns-core-modules/ui/builder/builder";
import { WebView } from "tns-core-modules/ui/web-view/web-view";
import * as firebase from "nativescript-plugin-firebase";
import * as applicationSettings from "tns-core-modules/application-settings";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { CustomTabView } from "~/pages/shared/components/tabview/custom-tab-view";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { FirebaseUtilities } from "~/pages/shared/utilities/firebase-utilities";
import { EProfile, IProfile } from "~/pages/more/-entities/profile";
import { ESettings } from "~/pages/shared/utilities/-entities/entities";
import { CartModel } from "../-models/cart-model";

class PaymentPage {

  private static page: Page;
  private static frame: ESFrame;
  private static firestore = firebase.firestore;
  private static currentPaymentId: string;

  public static onLoaded(args: EventData) {

    const page = args.object as Page;
    
    PaymentPage.page = page;
    PaymentPage.frame = page.frame as ESFrame;

  }

  public static onNavigatingTo(args: any) {

    const page = args.object as Page;
    const context = args.context;

    page.bindingContext = fromObject({       
      internationalization: Internationalization.singleton().getData(), 
      data: context,
      onRequest: false 
    });    

  }

  public static onPaypal() {

    if(!General.checkConnection()) { return; }

    const paypal = new Paypal();

    PaymentPage.setOverlayVisibility(true);
    const bindingContext = PaymentPage.page.bindingContext;
    let arrOrders = [];
    let totalPrice = 0;
    let quantity = 0;

    if(bindingContext.data.items.cartItems && bindingContext.data.items.cartItems.length > 0) {

      (bindingContext.data.items.cartItems).forEach((item) => {

        arrOrders.push({
          id: item.productId,
          currency: Internationalization.singleton().getData()._settings.currency.name, 
          name: item.product.title,
          price: item.priceTotal, 
          quantity: item.quantity
        });

        totalPrice += (item.priceTotal * 1);
        quantity += (item.quantity * 1);
      });
    } else {

      arrOrders.push({
        id: bindingContext.data.items[0].id.trim(),
        currency: Internationalization.singleton().getData()._settings.currency.name, 
        name: bindingContext.data.items[0].title,
        price: bindingContext.data.items[0].priceTotal * 1, 
        quantity: bindingContext.data.items[0].quantity * 1
      });

      totalPrice += (bindingContext.data.items[0].priceTotal * 1);
      quantity += (bindingContext.data.items[0].quantity * 1);
    }    
    
    paypal.setOrders(arrOrders).then((result)=>{     

      PaymentPage.currentPaymentId = result.paymentId;

      FirebaseUtilities.getQueryData(
        firebase.firestore.collection("Profiles").where("email","==", applicationSettings.getString("email","").trim()),
        EProfile,
        true
      ).then(profileData=>{
  
        if((<Array<any>>profileData.entities).length > 0){
  
          const p = (profileData.entities[0] as EProfile);
          const batch = PaymentPage.firestore.batch();
          const data = {
            orders: result.orders,
            status: "occurring",
            email: applicationSettings.getString("email",""),
            profile: {
              address: p.address,
              email: p.email,
              myPoints: p.myPoints,
              photo: p.photo,
              name: p.name,
              password: p.password,
              phone: p.phone,
              capturePoints: p.capturePoints,
            },
            createDate: new Date(),
            deliveryStatus: "processing",
            quantity: quantity,
            totalPrice: totalPrice,
          };

          batch.set(PaymentPage.firestore.collection("StoreCustomersOrders").doc(result.paymentId.trim()),data);
          batch.set(PaymentPage.firestore.collection("StoreSellerOrders").doc(result.paymentId.trim()),data);

          batch.commit().then(()=>{

            PaymentPage.onOpenBrowser({
              title: "Paypal Checkout",
              url: result.url
            });
          });
        }

        setTimeout(() => {
          PaymentPage.setOverlayVisibility(false);    
        }, 1000);
      });
     
    });
  }

  private static  onOpenBrowser(context: any) {

    const view = builder.createViewFromEntry({ moduleName: "pages/shared/components/browser/browser-page" });   
    const webView: WebView = view.getViewById("webView");
    let paymentId = PaymentPage.currentPaymentId;
    let success: boolean = false;

    FirebaseUtilities.getQueryData(PaymentPage.firestore.collection("Settings"),ESettings).then((result)=>{

      if((result.entities as Array<any>).length > 0){

        const settings = result.entities[0] as ESettings;
        const url = settings.serverUrl.trim()[settings.serverUrl.trim().length - 1] === "/" ? settings.serverUrl.trim() : settings.serverUrl.trim()+"/"; //https://fidelitycard.ipartts.com

        webView.on("loadFinished",(args)=>{

          let urlParts = args.url.split("://")[1].split("?");
          let site = urlParts[0].split("/")[0].trim();
          let paramsArr = urlParts[1].split("&");
          let params = {};

          if(site + "/" !== url.split("://")[1].trim()){ return; }

          paramsArr.forEach((value)=>{
    
            let pair = value.split("=");
            params[pair[0].trim()] = pair[1].trim();
          });
    
          if(params["success"]){
            PaymentPage.firestore.collection("StoreCustomersOrders").doc(params["paymentId"].trim()).get().then((order)=>{
    
              success = true;
              if(order.exists){
    
                order.ref.set({status: "finished"}, {merge: true});
                let data = order.data();

                let m = new Date().getMonth() + 1 < 10 ? "0"+ (new Date().getMonth() + 1): new Date().getMonth() + 1;
                let y = new Date().getFullYear();
                PaymentPage.firestore.collection("StoreProductsStatistics").doc(`${y}-${m}`).get().then((statics)=>{
                  if(statics.exists){
                    PaymentPage.firestore.collection("StoreProductsStatistics").doc(`${y}-${m}`).set({
                      amount: (statics.data().amount * 1) + (data.totalPrice * 1),
                      quantity: (statics.data().quantity * 1) + 1
                    });
                  }else{
                    PaymentPage.firestore.collection("StoreProductsStatistics").doc(`${y}-${m}`).set({
                      amount: data.totalPrice,
                      quantity: 1
                    });
                  }
                });

                PaymentPage.firestore.collection("StoreSellerOrders").doc(order.id).set({status: "finished"},{merge: true});
              }

              if(PaymentPage.page.bindingContext.data.destiny !== "forBuy"){

                applicationSettings.setString("cartItems","[]");
                (CartModel.singleton().getItems() as ObservableArray<any>).splice(0);
              }

              webView.closeModal();
              setTimeout(()=>{
                let v = builder.createViewFromEntry({
                  moduleName: "pages/store/main/main-page"
                });
                dialogs.alert({title: "",message: "Pagamento Realizado com succeso.", okButtonText: "Ok"}).then((result)=>{
              
                  (PaymentPage.page.frame as ESFrame).present({
                    animated: true,
                    clearHistory: true,
                    create: ()=>{
                      return v;
                    }
                  });

                  setTimeout(()=>{

                    (<ESFrame>v.page.frame).push("pages/store/order-list/order-list-page");
                  },500);
                });
              },500);
    
              PaymentPage.currentPaymentId = undefined;
            });
          }else if(params["error"]){

            let batch = PaymentPage.firestore.batch();
            batch.delete(PaymentPage.firestore.collection("StoreSellerOrders").doc(paymentId));
            batch.delete(PaymentPage.firestore.collection("StoreCustomersOrders").doc(paymentId));
            batch.commit().then(()=>{

              PaymentPage.currentPaymentId = undefined; 
              webView.closeModal();
              setTimeout(()=>{
                dialogs.alert({title: "",message: "Pagamento não foi finalizado com sucesso.", okButtonText: "Ok"}).then((result)=>{});
              },500);
            });
          }
        });
    

        let showModalOptions: ShowModalOptions = {
          context: context,
          fullscreen: true,
          closeCallback: (args)=>{
    
            if(!success){
    
              PaymentPage.firestore.collection("StoreProductsOrders").doc(paymentId).get().then((result)=>{
                if(result.exists){
                  result.ref.delete();
                }
              });
            }
          }
        };
    
        CustomTabView.getMainFrame().showModal(view, showModalOptions);
      }
    });

   
  } 

  private static setOverlayVisibility(status: boolean) {

    PaymentPage.page.bindingContext.onRequest = status
  }

}

exports.onLoaded = PaymentPage.onLoaded;
exports.onNavigatingTo = PaymentPage.onNavigatingTo;
exports.onPaypal = PaymentPage.onPaypal;
