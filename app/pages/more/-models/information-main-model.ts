import { FirebaseUtilities } from "~/pages/shared/utilities/firebase-utilities";
import * as firebase from "nativescript-plugin-firebase";
import { EEStablishment } from "../-entities/establishment";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { fromObject, Observable } from "tns-core-modules/data/observable/observable";

export class InformationMainModel {
  
  private static _singleton: InformationMainModel;
  public static singleton(): InformationMainModel{

    if(InformationMainModel._singleton === undefined){

      InformationMainModel._singleton = new InformationMainModel();
    }

    return InformationMainModel._singleton;
  }

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

  private firestore = firebase.firestore;
  private establishments: ObservableArray<any> = new ObservableArray([]);

  private constructor() {

    this.requestData();
  }

  public getEstablishments(): ObservableArray<any>{

    return this.establishments;
  }

  private async requestData(){
    
    FirebaseUtilities.getOnSnapshotData(this.firestore.collection("Establishments"), EEStablishment, (result) => {

      (result.entities).forEach((obj, k) => {

        const entity = ((obj.entity as any) as EEStablishment);
        if(obj.type === "added") {

          if(this.establishments.length > 0) {

            for(let i = 0; i < this.establishments.length; i++) {

              const items = this.establishments.getItem(i);

              if(items.id.trim() !== entity.id.trim()) {
  
                this.establishments.push(entity);
                break;
              }
            }
          } else {

            this.establishments.push(entity);

            if(k === 0) {

              this.isFinishedQuest.set("status", true);
              this.finished = true;
            }
          }

        } else if(obj.type === "modified") {
          for(let i = 0; i < this.establishments.length;i++){

            let e = this.establishments.getItem(i) as EEStablishment;
            if(e.id.trim() == entity.id.trim()){

              this.establishments.splice(i, 1, entity);
              break;
            }
          }
        } else if(obj.type === "removed") {

          for(let i = 0; i < this.establishments.length;i++){

            let e = this.establishments.getItem(i);
            if(e.id.trim() == entity.id.trim()){

              this.removedData.set("length", this.establishments.length);
              this.establishments.splice(i, 1);
              break;
            }
          }
        }
      });

      if(result.entities.length === 0 || this.establishments.length === 0) {

        (<any>this.isFinishedQuest).reset(true);
        this.isFinishedQuest.set("status", false);

        (<any>this.removedData).reset();
        this.removedData.set("length", 0);
        
        this.finished = true;
      }
    });
  }

}
