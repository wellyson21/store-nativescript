import {ICard,IPromotion,ITicket} from "./entities-interfaces";
import { PromotionsModel } from "../-models/promotions-model";
import {ObservableProperty} from "~/pages/shared/utilities/observable-property-decorator";
import { Observable } from "tns-core-modules/ui/page/page";
import * as firebase from "nativescript-plugin-firebase";

///Card Entity
export class ECard extends Observable implements ICard{

  public id: string;
  public promotionId: string;
  @ObservableProperty() public myPoints: number;
  public createDate: Date | string;
  public profileId: string;

  //Promotion Data
  @ObservableProperty() public title: string;
  @ObservableProperty() public thumbnail?: string;
  @ObservableProperty() public expireDate: Date | string;
  @ObservableProperty() public totalPoints: number;


  private promotionModel: PromotionsModel = PromotionsModel.singleton();

 
  public constructor(id?: string,promotionId?: string,profileId?: string,myPoints?: number, createDate?: Date | string){

    super();

    this.id = id;
    this.promotionId = promotionId;
    this.profileId = profileId;
    this.myPoints = myPoints;
    this.createDate = createDate;
  }


  public setPromotionData(data: any){

    this.title = data.title;
    this.expireDate = data.expireDate;
    this.totalPoints = data.points;
    this.thumbnail = data.thumbnail;
  }

  public getUpdateMap(): any{

    return {
      myPoints: this.myPoints
    }
  }
}



///Promotion Entity
export class EPromotion extends Observable implements IPromotion{
  @ObservableProperty() id: string;
  @ObservableProperty() title: string;
  @ObservableProperty() promotionDescription: string;
  @ObservableProperty() points: number;
  @ObservableProperty() totalPoints: number;
  @ObservableProperty() expireDate: string;
  @ObservableProperty() thumbnail: string;
  @ObservableProperty() slideImages: Array<string>;
  @ObservableProperty() createDate: string;

  public constructor(id?: string,title?: string,promotionDescription?: string,points?: number, thumbnail?: string,slideImages: Array<string> = [], expireDate?: string,createDate?: string){

    super();
    this.id = id;
    this.promotionDescription = promotionDescription;
    this.title = title;
    this.points = points;
    this.thumbnail = thumbnail;
    this.slideImages = slideImages;
    this.expireDate = expireDate;
    this.createDate = createDate;
  }
}



///Ticket Entity
export class ETicket implements ITicket{
  id: string;
  promotionId: string;
  profileId: string;
  code: string;
  createDate: Date | string;

  //Promotion Data
  expireDate: Date | string;
  thumbnail: string;
  totalPoints: number;
  title: string;

  public constructor(id?: string,promotionId?: string,profileId?: string,code?: string, createDate?: Date | string){

    this.id = id;
    this.promotionId = promotionId;
    this.profileId = profileId;
    this.code = code;
    this.createDate = createDate;
  }

  public setPromotionData(p: any){

    if(p != undefined){

      this.expireDate = new Date(p.expireDate).toLocaleDateString();
      this.totalPoints = p.points;
      this.thumbnail = p.thumbnail;  
      this.title = p.title;    
    }
  }
}