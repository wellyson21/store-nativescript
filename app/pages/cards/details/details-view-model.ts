import { Observable, EventData } from "tns-core-modules/data/observable";
import { CardsModel } from "../-models/cards-model";
import { PromotionsModel } from "../-models/promotions-model";
import { ECard } from "../-entities/entities";
import { CardDetailsPage } from "./details-page";
import { Internationalization } from "~/pages/shared/utilities/internationalization";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";

export class CardDetailsViewModel extends Observable {
    
  private _cardData: ECard;
  private _internationalization: any;

  @ObservableProperty() public isLoading: boolean = true;
  
  constructor() {
    super();
    
    this.setAcumulatedPoints();
    this.getInternationalization();
  }

  get cardData(): ECard {
  
    return this._cardData;
  }

  @ObservableProperty() public acumulatedPoints: number;

 
  get internationalization(): any{

    return this._internationalization;
  }

  private getInternationalization(){

    let i = Internationalization.singleton();
    this._internationalization = i.getData();
  }


  //Inner setters
  public setCardData(data: ECard){

    this._cardData = data;
  }

  private setAcumulatedPoints(){

    const obj = CardsModel.singleton();
    obj.getAcumulatedPoints().then(points=>{

      this.acumulatedPoints = points;
    });
  }

  //CardDetails Events Delegate
  get onTapCoin(): (args: EventData)=>void{
    
    return CardDetailsPage.onTapCoin;
  }
}
