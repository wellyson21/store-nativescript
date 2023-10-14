import { ETicket } from "../-entities/entities";
import * as applicationSettings from "tns-core-modules/application-settings";
import { ITicket } from "../-entities/entities-interfaces";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { TicketsViewModel } from "../tickets/tickets-view-model";
import * as firebase from "nativescript-plugin-firebase";
import { FirebaseUtilities } from "~/pages/shared/utilities/firebase-utilities";
import { PromotionsModel } from "./promotions-model";
import { Observable } from "tns-core-modules/ui/page/page";
import { fromObject } from "tns-core-modules/data/observable/observable";

export class TicketsModel {

  private tickets: ObservableArray<ETicket> = new ObservableArray([]);
  private firestore = firebase.firestore;
  private static _singleton: TicketsModel;
 
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


  public static singleton: ()=>TicketsModel = ()=>{

    if(TicketsModel._singleton == undefined){

      TicketsModel._singleton = new TicketsModel();
    }
    return TicketsModel._singleton;
  };

  private constructor(){
  
    this.getData();
  }

  private getData(viewModel?: any) {
  
    let collection = this.firestore.collection("Tickets").orderBy("createDate","desc").where("profileId","==", applicationSettings.getString("userId","").trim());
    let promotionsModel = PromotionsModel.singleton();

    FirebaseUtilities.getOnSnapshotData(collection, ETicket,(result)=>{
     
      if(result.entities.length === 0){

        (<any>this.isFinishedQuest).reset(true);
        this.isFinishedQuest.set("status",false);

        (<any>this.removedData).reset();
        this.removedData.set("length", 0);
        
        this.finished = true;
      }

      let hasit = false;
      let removeds = [];

      result.entities.forEach(obj=>{

        let entity = ((obj.entity as any) as ETicket);
        if(obj.type === "added"){

          if(removeds.indexOf(entity.id.trim()) == -1){

            promotionsModel.getPromotion(entity.promotionId.trim()).then(promotion=>{

              entity.createDate = new Date(entity.createDate).toLocaleDateString();
              (entity as ETicket).setPromotionData(promotion);

              if(removeds.indexOf(entity.id.trim()) == -1){

                this.tickets.push(entity);
                if(!hasit) {
  
                  this.isFinishedQuest.set("status", true);
                  hasit = true;
                }
              }else{

                this.removedData.set("length",this.tickets.length);
              }
              this.finished = true;
            });
          }else{

            this.removedData.set("length",this.tickets.length);
          }
        }else if(obj.type === "removed"){

          removeds.push((obj.entity as any).id.trim());
          for(let i = 0;i < this.tickets.length;i++){
            let p = this.tickets.getItem(i);
            if(p.id.trim() == (obj.entity as any).id.trim()){

              this.tickets.splice(i,1);
              this.removedData.set("length",this.tickets.length);
              break;
            }
          }
        }
      });
    });
  }

  public getTickets(viewModel?: any): ObservableArray<ETicket>{

    return this.tickets;
  }

  public async removeTicket(ticketId: string): Promise<boolean>{
    
    let resolveWS: (status: boolean)=> void;
    let collection = this.firestore.collection("Tickets");
    collection.doc(ticketId.trim()).get().then(result=>{

      if(result.exists){

        result.ref.delete().then(()=>{

          resolveWS(true);
        }).catch(()=>{

          resolveWS(false);
        });
      }else{

        resolveWS(false);
      }
    }).catch(()=>{

      resolveWS(false);
    })

    return await new Promise<boolean>((resolve)=>{

      resolveWS = resolve;
    });
  }

  public async createTicket(ticket: ITicket): Promise<boolean>{
    
    let status: boolean = false;
    await this.firestore.collection("CardTickets").add(ticket).then(()=>{

      status = true;
    }).catch(()=>{

      status = false;
    });

    return await new Promise<boolean>((resolve)=>{

      resolve(status);
    });
  }
}