import { Observable, PropertyChangeData } from "tns-core-modules/ui/page/page";
import { ETicket } from "../-entities/entities";
import { TicketsModel } from "../-models/tickets-model";
import { Internationalization } from "~/pages/shared/utilities/internationalization";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { General } from "~/pages/shared/utilities/general";

export class TicketsViewModel extends Observable{

  private _ticketsData: any;
  private _promotionsData: Internationalization;

  @ObservableProperty() haveDataToDisplay: boolean = true;
  @ObservableProperty() public isLoading: boolean = true;
  @ObservableProperty() public dataLength: number = 0;


  get ticketsData(): any{

    return this._ticketsData;
  }

  set ticketsData(newValue){

    this._ticketsData = newValue;
  }

  get promotionsData(): any{

    return this._promotionsData;
  }

  get internationalization(): any{

    let it = Internationalization.singleton();
    return it.getData();
  }

  constructor(){
    super();

    this.getTicketsData();
  }

  private getTicketsData(){

    let obj = TicketsModel.singleton();
    this.haveDataToDisplay = true;

    General.setLoaderAndPlaceholder(obj,this,"ticketsData","getTickets");
  }

}