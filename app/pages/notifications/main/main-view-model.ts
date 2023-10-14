import { Observable } from "tns-core-modules/data/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";
import { NotificationsModel } from "../-models/notifications-model";
import { General } from "~/pages/shared/utilities/general";
import { Internationalization } from "~/pages/shared/utilities/internationalization";

export class MainViewModel extends Observable {
  
  private _searchItems = new ObservableArray([]);
  private _notificationItems: any;
  private _internationalization: any;

  @ObservableProperty() public haveDataToDisplay: boolean = true;
  @ObservableProperty() public isLoading: boolean = true;
  @ObservableProperty() public dataLength: number = 0;
  
  @ObservableProperty() public totalSearchItems = 0;
  @ObservableProperty() public noResults = false;

  constructor() {
    super();
    
    this.getNotifications();
    this.getInternationalization();
  }

  get notificationItems(): any {

    return this._notificationItems;
  }

  set notificationItems(newValue){

		this._notificationItems = newValue;
	}
  
  get internationalization(): any {

    return this._internationalization;
  }

  get searchItems(): any {

    return this._searchItems;
  }

  public search(string: any): number {

    this.searchClear();

    if(string != "") {

      this._notificationItems.forEach((v1: any, k1: number) => {
        
        const objBase = {
          date: v1.date,
          dateFormatted: v1.dateFormatted,
          sections: new ObservableArray([])
        };

        let totalNotifications = 0;

        v1.sections.forEach((v2: any, k2: number) => {
          
          objBase.sections.push({
            category: v2.category,
            notifications: new ObservableArray([])             
          });
          
          let hasCombinationInSection = false;

          v2.notifications.forEach((v3: any, k3: number) => {

            if (v3.title.toLowerCase().search(string.toLowerCase()) != -1) {

              objBase.sections.getItem(k2).notifications.push(v3);

              hasCombinationInSection = true;
              totalNotifications++;
              this.totalSearchItems++;
            }
          });

          if(!hasCombinationInSection) {

            objBase.sections.pop();
          }
        });

        if(totalNotifications > 0) {

          this._searchItems.push(objBase);
        }
      });

      if(this.totalSearchItems == 0) {

        this.noResults = true;
      }
      
    }

    return this.totalSearchItems;
  }

  public searchClear() {

    this._searchItems.splice(0, this.totalSearchItems);
    this.totalSearchItems = 0;
    this.noResults = false;
  }

  private getNotifications() {
    const obj = NotificationsModel.singleton();

    General.setLoaderAndPlaceholder(obj, this, "notificationItems", "getNotifications");
  }

  private getInternationalization(){

    const inter = Internationalization.singleton();
    this._internationalization = inter.getData();
  }

}
