import { ECard, EPromotion } from "../-entities/entities";
import { ICard } from "../-entities/entities-interfaces";
import * as applicationSettings from "tns-core-modules/application-settings";
import * as firebase from "nativescript-plugin-firebase";
import { FirebaseUtilities } from "~/pages/shared/utilities/firebase-utilities";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { PromotionsModel } from "./promotions-model";
import { Observable } from "tns-core-modules/ui/page/page";
import { CardsViewModel } from "../main/cards-view-model";
import { EProfile } from "~/pages/more/-entities/profile";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { MainPage } from "~/pages/main/main-page";
import { AuthenticationModel } from "~/pages/authentication/-models/authentication-model";

export class CardsModel {

  private firestore = firebase.firestore;
  private cards: ObservableArray<any> = new ObservableArray([]);

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

  private static _singleton: CardsModel;
  public static singleton: (viewModel?: any)=>CardsModel = (viewModel)=>{
    if(CardsModel._singleton === undefined){
      CardsModel._singleton = new CardsModel();
    }
    return CardsModel._singleton;
  };

  private constructor(){
    this.getData();
  }

  //Get all Card
  private getData(){

    let self = this;

    if(!applicationSettings.getString("userId")){
      setTimeout(() => {

        self.cards.splice(0);

        (<any>self.removedData).reset();
        self.removedData.set("length", 0);
  
        (<any>self.isFinishedQuest).reset(true);
        self.isFinishedQuest.set("status", false);

        self.finished = true;
      }, 1000);
    }else{

      query();
    }

    AuthenticationModel.loginStatus.on("propertyChange", (obj) => {
      
      if(obj.object.get("status")){

        query();
      }else{

        self.cards.splice(0);

        (<any>self.removedData).reset();
        self.removedData.set("length", 0);

        (<any>self.isFinishedQuest).reset(true);
        self.isFinishedQuest.set("status", false);
        
        self.finished = true;
      }
    });

    function query(){

      FirebaseUtilities.getOnSnapshotData(self.firestore.collection("Cards").orderBy("createDate","desc").where("profileId","==",applicationSettings.getString("userId","").trim()),ECard,(result)=>{

        if(result.entities.length === 0){

          (<any>self.isFinishedQuest).reset(true);
          self.isFinishedQuest.set("status",false);

          (<any>self.removedData).reset();
          self.removedData.set("length", 0);

          self.finished = true;

          return;
        }
      
        let removedsCards = [];
        let pointsToAdd: number = 0;
        let cardsCount = result.entities.length;
        let cardsGeted = 0;
        let promotionsIds = [];
        result.entities.forEach((r)=>{

          let c = (r.entity as any);
      
          if(r.type === "added"){

            PromotionsModel.singleton().getPromotion(c.promotionId).then((p) =>{
              if(p != undefined){
      
                let ex = new Date(p.expireDate);
                let d = new Date();
                (c as ECard).setPromotionData(p);
    
                if(removedsCards.indexOf(c.id) === -1 && ex > d){
    
                  let myPoints = parseInt(c.myPoints);
                  let totalPoints =  parseInt(c.totalPoints);
                  if(myPoints > totalPoints){

                    c.myPoints = totalPoints;
                    self.updateCardAndAcumulatedPoints(c,myPoints - totalPoints,"+");
                  }

                  c.expireDate = new Date(c.expireDate).toLocaleDateString();
                  c.createDate = new Date(c.createDate).toLocaleDateString();

                  if(self.hasCard(c)){cardsGeted++; return; }
                  self.cards.push(c);
                }else if(ex < d){

                  promotionsIds.push(c.promotionId);
                  pointsToAdd += parseInt((c.myPoints as any));
                }

                cardsGeted++;
              }
            }).catch(()=>{});
          }else if(r.type === "modified"){

            for(let i = 0;i < self.cards.length;i++){
              let c2 = self.cards.getItem(i);

              if(c2.id.trim() == c.id.trim()){

                c2.myPoints = c.myPoints;
                self.removedData.set("length",self.cards.length);
                break;
              }
            }
          }else if(r.type === "removed"){

            removedsCards.push(c.id.trim());
            for(let i = 0;i < self.cards.length;i++){
              let c2 = self.cards.getItem(i);

              if(c2.id.trim() == c.id.trim()){

                self.cards.splice(i,1);
                self.removedData.set("length",self.cards.length);
                break;
              }
            }
          }

        });


        FirebaseUtilities.getOnSnapshotData(self.firestore.collection("Promotions"),EPromotion,(result)=>{
          result.entities.forEach(r=>{
            if(r.type === "modified"){

              let p = ((r.entity as any) as EPromotion);
              for(let i = 0;i < self.cards.length;i++){
                let c = self.cards.getItem(i);
    
                
                if(p.id.trim() === c.promotionId.trim()){

                  let myPoints = parseInt(c.myPoints);
                  let totalPoints =  parseInt(p.points as any);

                  let ex = new Date(p.expireDate);
                  let d = new Date();

                  if(d < ex){

                    c.totalPoints = totalPoints;
                    c.title = p.title
                    c.expireDate = p.expireDate;

                    if(myPoints > totalPoints){

                      c.myPoints = totalPoints;
                      self.updateCardAndAcumulatedPoints(c,myPoints - totalPoints,"+");
                    }

                    self.cards.splice(i,1,c);
                  }else{

                    let length = self.cards.length - 1;
                    self.cards.splice(i,1);
                    self.removedData.set("length", length);
                    self.removeCard(c.promotionId).then(()=>{

                      MainPage.alertExpiredPromotion();
                    });
                  }

                  break;
                }
              }
            }
          });
        });
        
        
        let interval = setInterval(()=>{
          if(cardsCount == cardsGeted){

            self.finished = true;
            self.isFinishedQuest.set("status",true);
            let cardsModel = CardsModel.singleton();
            promotionsIds.forEach(id=>{
              if(pointsToAdd > 0){

                self.removeCardAndSetAcumulatedPoints(id,pointsToAdd,"+");
              }else{

                cardsModel.removeCard(id);
              }
            });
            clearInterval(interval);
          }
        },0);

      });
    }
  }

  private hasCard(card: any): boolean{

    let status: boolean = false;
    let length = this.cards.length;
    for(let i = 0;i < length;i++){
      let c = this.cards.getItem(i);
      if(card.id.trim() == c.id.trim()){

        status = true;
        break;
      }
    }
    return status;
  }


  public static removeCardsExpireds(){

    FirebaseUtilities.getQueryData(firebase.firestore.collection("Cards").where("profileId","==", applicationSettings.getString("userId","").trim()),ECard).then(r=>{

      // let d = new Date("2019/06/01");
      let pointsToAdd: number = 0;
      let cardsCount = r.entities.length;
      let cardsGeted = 0;
      let promotionsIds = [];
   
      r.entities.forEach((c)=>{
        PromotionsModel.singleton().getPromotion(c.promotionId).then((p) =>{
  
          if(p != undefined){
  
            let ex = new Date(p.expireDate);
            let d = new Date();
            if(ex < d){

              promotionsIds.push(c.promotionId);
              pointsToAdd += parseInt((c.myPoints as any));
            }
            cardsGeted++;
          }
        }).catch(()=>{
  
        });
      });
  
      let interval = setInterval(()=>{
        if(cardsCount == cardsGeted){
  
          let cardsModel = CardsModel.singleton();
          promotionsIds.forEach(id=>{
            cardsModel.removeCard(id);
            if(pointsToAdd > 0){
              cardsModel.getAcumulatedPoints().then(p=>{
  
                cardsModel.setAcumulatedpoints(parseInt(p as any) + pointsToAdd);
              });
            }
          });
      
          clearInterval(interval);
        }
      },0);


    });

  }

  public getCards(): ObservableArray<any>{

    return this.cards;
  }

  //Get a Card
  public async getCard(cardId: string): Promise<ECard>{

    let cardsCollection = this.firestore.collection("Cards");
    let result: ECard;

    await FirebaseUtilities.getDocData(cardsCollection.doc(cardId),ECard).then((r)=>{
      
      result = r.entities;
    });

    return await new Promise<ECard>((resolve)=>{

      resolve(result);
    });
  }

  //Register Card
  public async registerCard(card: ICard): Promise<boolean>{

    let cardsCollection = this.firestore.collection("Cards");
    let query = cardsCollection.where("profileId","==",applicationSettings.getString("userId","").trim()).where("promotionId","==",card.promotionId);
    let resolveWS: (satus: boolean)=> void;
  
     query.get().then((docsS=>{
      if(docsS.docSnapshots.length == 0){

        this.firestore.collection("Cards").add(card).then(()=>{

          resolveWS(true);
        },()=>{

          resolveWS(false);
        });  
      }else{

        resolveWS(false);
      }
    })).catch(()=>{

      resolveWS(true);
    });

    return await new Promise<boolean>((resolve)=>{

      resolveWS = resolve;
    });
  }

  //Remove Card
  public async removeCard(promotionId: string): Promise<boolean> {
    
    let status: boolean = false;
    let resolveWS: (status: boolean)=> void;
    this.firestore.collection("Cards").where("profileId","==", applicationSettings.getString("userId","").trim()).where("promotionId","==",promotionId.trim()).get().then(docsS=>{

      if(docsS.docSnapshots.length > 0){

        docsS.docSnapshots[0].ref.delete().then(()=>{
          this.getAcumulatedPoints().then(points=>{
            this.setAcumulatedpoints(points +  docsS.docSnapshots[0].data().myPoints).then(()=>{

              resolveWS(true);
            }).catch(()=>{

              resolveWS(false);
            });
          }).catch(()=>{

            resolveWS(false);
          });
        },()=>{

          resolveWS(false);
        });
      }
    }).catch(()=>{

      resolveWS(true);
    });

    return await new Promise<boolean>((resolve)=>{

      resolveWS = resolve;
    });
  }

  public async removeCardAndSetAcumulatedPoints(promotionId: string,points: number, mode: string = "=") {
    
    let status: boolean = false;
    let resolveWS: (status: boolean)=> void;
    let batch = this.firestore.batch();
    let reqCount: number = 0;
    let promotionPoints: number = 0;

    this.firestore.collection("Cards").where("profileId","==", applicationSettings.getString("userId","").trim()).where("promotionId","==",promotionId.trim()).get().then(docsS=>{

      if(docsS.docSnapshots.length > 0){

        batch.delete(docsS.docSnapshots[0].ref);
        promotionPoints = (docsS.docSnapshots[0].data().myPoints as number);
        reqCount++;
      }
    }).catch(()=>{

      resolveWS(true);
    });

    FirebaseUtilities.getQueryData(
      firebase.firestore.collection("Profiles").where("email","==", applicationSettings.getString("email","").trim()),
      EProfile,
      true
    ).then(result=>{

      if((<Array<any>>result.entities).length > 0){

        let doc = (<firebase.firestore.QuerySnapshot>result.querySnapshot).docs[0];
        let p = mode === "=" ? points :(mode === "+" ? parseInt(doc.data().myPoints) + points : doc.data().myPoints - points)

        batch.set(doc.ref,{myPoints: p + promotionPoints},{merge: true});
        reqCount++;
      }
    });


    let it = setInterval(()=>{
      if(reqCount === 2){

        batch.commit();
        clearInterval(it);
      }  
    },0);
  }

  //Update Card
  public async updateCard(card: ECard): Promise<boolean>{

    let cardR = this.firestore.collection("Cards").doc(card.id.trim()).get();
    let resolveWS: (status: boolean)=> void;

    cardR.then((docsS)=>{

      if(docsS.exists){

        docsS.ref.set(card.getUpdateMap(),{merge: true}).then(()=>{

          resolveWS(true);
        },()=>{

          resolveWS(false);
        });
      }else{

        resolveWS(false);
      }
    }).catch(()=>{

      resolveWS(false);
    });
    
    return await new Promise<boolean>((resolve)=>{

      resolveWS = resolve;
    });
  }

  public updateCardAndAcumulatedPoints(card: ECard,points, mode: string = "="){

    let batch = this.firestore.batch();
    let cardR = this.firestore.collection("Cards").doc(card.id.trim()).get();
    let resolveWS: (status: boolean)=> void;
    let reqCount: number = 0;

    cardR.then((docsS)=>{
      if(docsS.exists){

        batch.set(docsS.ref,card.getUpdateMap(),{merge: true});
        reqCount++;
      }
    });
    
    FirebaseUtilities.getQueryData(
      firebase.firestore.collection("Profiles").where("email","==", applicationSettings.getString("email","").trim()),
      EProfile,
      true
    ).then(result=>{

      if((<Array<any>>result.entities).length > 0){

        let doc = (<firebase.firestore.QuerySnapshot>result.querySnapshot).docs[0];
        let p = mode === "=" ? points :(mode === "+" ? parseInt(doc.data().myPoints) + points : doc.data().myPoints - points)

        batch.set(doc.ref,{myPoints: p},{merge: true});
        reqCount++;
      }
    });


    let it = setInterval(()=>{
      if(reqCount === 2){

        batch.commit();
        clearInterval(it);
      }  
    },0);
  }


  //Check if a card is registered
  public async isRegistered(promotionId: string): Promise<boolean>{

    let collection = this.firestore.collection("Cards").where("profileId","==", applicationSettings.getString("userId","").trim()).where("promotionId","==",promotionId.trim());
    let status: boolean = false;

    await collection.get().then(r=>{

      status = r.docSnapshots.length > 0 ? true : false;
    });

    return await new Promise<boolean>((resolve)=>{

      resolve(status);
    });
  }

  //Check In server if has some point to capture
  public async hasPointToCapture(): Promise<number>{

    let points: number = 0;
    await this.firestore.collection("Profiles").where("email","==",applicationSettings.getString("email","").trim()).get().then((result)=>{

      if(result.docs.length > 0){

        points = parseInt(result.docs[0].data().capturePoints);
      }
    });

    return await new Promise<number>((resolve=>{

      resolve(points);
    }));
  }

  public async removeCapturedPoints(): Promise<boolean>{

    let status: boolean = true;
    await this.firestore.collection("Profiles").where("email","==",applicationSettings.getString("email","").trim()).get().then((result)=>{

      if(result.docs.length > 0){

        result.docs[0].ref.set({capturePoints: 0},{merge: true});
        status = true;
      }
    });

    return await new Promise<boolean>((resolve=>{

      resolve(status);
    }));
  }

  //Getter and Setter AcumulatedPoints
  public async getAcumulatedPoints(): Promise<number>{

    let points: number = 0;
    await FirebaseUtilities.getQueryData(
      firebase.firestore.collection("Profiles").where("email","==", applicationSettings.getString("email","").trim()),
      EProfile
    ).then(result=>{

      if((<Array<any>>result.entities).length > 0){

        points = (<Array<any>>result.entities)[0].myPoints;
      }
    });

    return await new Promise<number>((resolve=>{

      resolve(points);
    }));
  }

  public async setAcumulatedpoints(points: number, mode: string = "="): Promise<boolean>{

    let resolveWS: (status: boolean)=> void;

    await FirebaseUtilities.getQueryData(
      firebase.firestore.collection("Profiles").where("email","==", applicationSettings.getString("email","").trim()),
      EProfile,
      true
    ).then(result=>{

      if((<Array<any>>result.entities).length > 0){

        let doc = (<firebase.firestore.QuerySnapshot>result.querySnapshot).docs[0];
        let p = mode === "=" ? points :(mode === "+" ? parseInt(doc.data().myPoints) + points : doc.data().myPoints - points)

       doc.ref.set({myPoints: p},{merge: true}).then(()=>{

          resolveWS(true);
        }).catch(()=>{

          resolveWS(false);
        });
      }
    });

    return await new Promise<boolean>((resolve=>{

      resolveWS = resolve;
    }));
  }

}
