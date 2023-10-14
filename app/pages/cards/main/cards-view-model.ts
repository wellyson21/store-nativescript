import { Observable, EventData, fromObject, PropertyChangeData } from "tns-core-modules/data/observable";
import { CardsModel } from "../-models/cards-model";
import { CardDetailsPage } from "../details/details-page";
import { PromotionsModel } from "../-models/promotions-model";
import { Internationalization } from "~/pages/shared/utilities/internationalization";
import { Page } from "tns-core-modules/ui/page/page";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";
import { General } from "~/pages/shared/utilities/general";
import * as applicationSettings from "tns-core-modules/application-settings";
import { AuthenticationModel } from "~/pages/authentication/-models/authentication-model";

export class CardsViewModel extends Observable {
    
  private _cardsData: any;
  private _internationalization: any;

  constructor() {
    super();
    
    this.getCardsData();
    this.getAcumulatedPoints();
    this.getInternationalization();
    this.updateStatusLogin();
  }

  @ObservableProperty() public haveDataToDisplay: boolean = true;
  @ObservableProperty() public isLoading: boolean = true;
  @ObservableProperty() public dataLength: number = 0;
  @ObservableProperty() public isLogged: boolean = !!applicationSettings.getString("userId");
  @ObservableProperty() public acumulatedPoints: number;

  get cardsData(): any {

    return this._cardsData;
  }

  set cardsData(newValue){
  
    this._cardsData = newValue;
  }

  private async getCardsData() {

    const obj = CardsModel.singleton();
    General.setLoaderAndPlaceholder(obj,this,"cardsData","getCards");
  }

  //G&S internationalization points
  get internationalization(): any{

    return this._internationalization;
  }

  private getInternationalization(){

    let i = Internationalization.singleton();
    this._internationalization = i.getData();
  }

  private getAcumulatedPoints(){

    const obj = CardsModel.singleton(this);
    obj.getAcumulatedPoints().then(points=>{
      
      this.acumulatedPoints = points;
    });
  }

  //Update status login
  private updateStatusLogin(){

    AuthenticationModel.loginStatus.on("propertyChange", (obj) => {
      if(obj.object.get("status")){

        this.isLogged = true;
      }else{

        this.isLogged = false;
      }
    });
  }

  //CardDetails Events Delegate
  get onTapCoin(): (args: EventData)=>void{
    
    return CardDetailsPage.onTapCoin;
  }



}
