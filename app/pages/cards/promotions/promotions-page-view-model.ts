import { Observable, EventData, PropertyChangeData } from "tns-core-modules/data/observable";
import { PromotionsModel } from "../-models/promotions-model";
import { Internationalization } from "~/pages/shared/utilities/internationalization";
import { Page } from "tns-core-modules/ui/page/page";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { General } from "~/pages/shared/utilities/general";

export class PromotionsViewModel extends Observable {
    
  private _promotionsData: any;
  private _internationalization: any;

  constructor() {
    super();
    
    this.getPromotionsData();
    this.getInternationalization();
  }

  @ObservableProperty() public haveDataToDisplay: boolean;
  @ObservableProperty() public isLoading: boolean = true;
  @ObservableProperty() public dataLength: number = 0;


  get promotionsData(): any {

    return this._promotionsData;
  }

  set promotionsData(newValue){

    this._promotionsData = newValue;
  }
  
  get internationalization(): any {

    return this._internationalization;
  }
  
  private async getPromotionsData(){

    const obj = PromotionsModel.singleton();

    General.setLoaderAndPlaceholder(obj,this,"promotionsData","getPromotions");
  }

  private getInternationalization() {

    const objInter = Internationalization.singleton();
    this._internationalization = objInter.getData();
  }
  
}
