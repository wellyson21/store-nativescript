import * as httpModule from "tns-core-modules/http"
import { FirebaseUtilities } from "./firebase-utilities";
import { firestore } from "nativescript-plugin-firebase";
import { ESettings } from "./-entities/entities";


export class Paypal{

  private oauth: any;
  private setOrderResult: IPaypalSetOrderResult;


  public async setOrders(orders: Array<IPaypalOrder>): Promise<IPaypalSetOrderResult>{

    let resolveWS: (result?: IPaypalSetOrderResult)=> void;
    let resolveWE: (status: boolean)=> void;

    FirebaseUtilities.getQueryData(firestore.collection("Settings"),ESettings).then((result)=>{

      if((result.entities as Array<any>).length > 0){

        const settings = result.entities[0] as ESettings;
        const clientId = settings.paypal.clientId.trim() //"AVx50u2r0BvvMAKeMf5xZhatYOPs8YzpFPcd2Z0e-E39Uwvcvr1yry_x5JCvbYisf7RHejwGZLRd70R-";
        const appSecret = settings.paypal.appSecret.trim()  //"ENfYTp4lq5F24P-XkRQn_FBvp4syaEGlDQp0El_O5DggCMcb1WY0FRRIwSKCp5THy1z8L_xw3_O5mxb4";
        const url = settings.serverUrl.trim()[settings.serverUrl.trim().length - 1] === "/" ? settings.serverUrl.trim() : settings.serverUrl.trim()+"/"; //https://fidelitycard.ipartts.com

         httpModule.request({
          url: `${url}paypal/setOrders`,
          method: "POST",
          content:  JSON.stringify({
           clientId: clientId,
           appSecret: appSecret,
           orders: orders,
           locale: settings.paypal.currency.name === "R$" ? "PT_br" : "US",
           brand: "mmm imports"
         })
        }).then((response)=>{
     
          console.log(response.content.toString());

         let data = response.content.toJSON();
     
         if(data !== undefined && data.url != undefined && data.paymentId != undefined){
     
           this.setOrderResult = data;
           this.setOrderResult.orders = orders;
         }

         resolveWS(this.setOrderResult);
        });
      }else{

        resolveWE(false);
      }

    }).catch(()=>{

      resolveWE(false);
    });
 

   return await new Promise<IPaypalSetOrderResult>((resolve,reject)=>{

      resolveWS = resolve;
      resolveWE = reject;
    });
  }

  public setOrder(){

  }

  getRedirectUrls(): IPaypalSetOrderResult{

    return this.setOrderResult;
  }

  
}

export interface IPaypalSetOrderResult{
  url: string;
  paymentId: string;
  orders?: Array<IPaypalOrder>;
}

export interface IPaypalOrder{
  id?: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
}