import { EPromotion } from "../-entities/entities";
import * as applicationSettings from "tns-core-modules/application-settings";
import * as firebase from "nativescript-plugin-firebase";
import { FirebaseUtilities } from "~/pages/shared/utilities/firebase-utilities";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { PromotionsViewModel } from "../promotions/promotions-page-view-model";
import { fromObject, Observable } from "tns-core-modules/data/observable/observable";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";

export class PromotionsModel {

  private firestore = firebase.firestore;
 
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

  private static _singleton: PromotionsModel;
  public static singleton: ()=>PromotionsModel = ()=>{

    if(PromotionsModel._singleton == undefined){

      PromotionsModel._singleton = new PromotionsModel();
    }
    return PromotionsModel._singleton;
  };


  private promotions: ObservableArray<EPromotion> = new ObservableArray([]);
 
  private constructor(){
   
    this.getData();
  }

  private async getData(viewModel?: any){
     
    const collection = this.firestore.collection("Promotions").orderBy("createDate","desc");
    
    this.promotions.splice(0);
 
    FirebaseUtilities.getOnSnapshotData(collection, EPromotion,(result)=>{

      let removeds = [];
      let gettedPromotions = 0;
      let promotionsLength = result.entities.length;

      result.entities.forEach((obj,k)=>{
        
        if(obj.type == "added"){

          let entity = (obj.entity as any);
          let ex = (entity.expireDate as Date);
          let d = new Date();
          if(ex > d){

            entity.expireDate = new Date(entity.expireDate).toLocaleDateString();
            entity.createDate = new Date(entity.createDate).toLocaleDateString();
            this.promotions.push(entity);
          }

          gettedPromotions++;
        }else if(obj.type == "modified"){

          let ex = ((obj.entity as any).expireDate as Date);
          let d = new Date();
          let isFound: boolean = false;

          for(let i = 0;i < this.promotions.length;i++){
            let p = this.promotions.getItem(i);
            if(p.id.trim() == (obj.entity as any).id.trim()){

              isFound = true;
              if(ex < d){

                this.promotions.splice(i,1);
                this.removedData.set("length",this.promotions.length);
              }else if(removeds.indexOf((obj.entity as any).id.trim()) == -1){

                let entity = (obj.entity as any);
                entity.expireDate = new Date(entity.expireDate).toLocaleDateString();
                entity.createDate = new Date(entity.createDate).toLocaleDateString();
                this.promotions.splice(i,1,entity);
              }else{

                this.removedData.set("length",this.promotions.length);
              }
              break;
            }
          }

          if(!isFound && d < ex){

            let entity = (obj.entity as any);
            entity.expireDate = new Date(entity.expireDate).toLocaleDateString();
            entity.createDate = new Date(entity.createDate).toLocaleDateString();
            this.promotions.unshift(entity);
          }
          
        }else if(obj.type == "removed"){

          removeds.push((obj.entity as any).id.trim());          
          for(let i = 0;i < this.promotions.length;i++){
            let p = this.promotions.getItem(i);
            if(p.id.trim() == (obj.entity as any).id.trim()){

              let length = this.promotions.length - 1;
              this.promotions.splice(i,1);
              this.removedData.set("length", length);
              break;
            }
          }
        }
      });

      let interval = setInterval(()=>{
        if(promotionsLength == gettedPromotions){

          (<any>this.removedData).reset();
          this.removedData.set("length", this.promotions.length);

          (<any>this.isFinishedQuest).reset();
          this.isFinishedQuest.set("status",true);

          this.finished = true;
          
          clearInterval(interval);
        }
      },0);

    });

  }

  public getPromotions(): ObservableArray<EPromotion>{

    return this.promotions;
  }

  public async getPromotion(id: string,getDoc: boolean = false): Promise<EPromotion>{

    let result: EPromotion;

    await FirebaseUtilities.getDocData(this.firestore.collection("CardPromotions").doc(id.trim()),EPromotion,).then(r=>{

      result = r.entities;
    });

    return await new Promise<EPromotion>((resolve)=>{

      resolve(result);
    });
  }

}

interface ModelLoadDataInfo{
  placeholderProperty?: any;
  loaderProperty?: any
}