import { Observable } from "tns-core-modules/data/observable";
import { Internationalization } from "~/pages/shared/utilities/internationalization";
import { OrderListModel } from "../-models/order-list-model";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { General } from "~/pages/shared/utilities/general";
import { AuthenticationModel } from "~/pages/authentication/-models/authentication-model";
import * as appSettings from "tns-core-modules/application-settings";

export class OrderListViewModel extends Observable {

  private _internationalization: any = Internationalization.singleton().getData();
  private _products: any;

  @ObservableProperty() public requestLogin: any;

  private _searchItems = new ObservableArray([]);
  @ObservableProperty() public totalSearchItems = 0;
  @ObservableProperty() public noResults = false;
  
  @ObservableProperty() public haveDataToDisplay: boolean = true;
  @ObservableProperty() public isLoading: boolean = true;
  @ObservableProperty() public dataLength: number = 0;

  constructor() {
    super();

    this.getOrders();
  }

  get internationalization(): any {

    return this._internationalization;
  }
  
  get listItems(): any {

    return this._products;
  }

  set listItems(newValue){

    this._products = newValue;
  }

  get searchItems(): any {

    return this._searchItems;
  }

  public search(string: any): number {

    this.searchClear();

    if(string != "") {

      this._products.forEach((v: any) => {
          
        if (v.title.toLowerCase().search(string.toLowerCase()) != -1) {
            
          this._searchItems.push(v);
          this.totalSearchItems++;
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

  private getOrders() {

    const that = this;
    
    if(!appSettings.getString("userId")) {

      that.requestLogin = true;
      that.isLoading = false;
    } else { query(); }

    AuthenticationModel.loginStatus.on("propertyChange", () => { query(); });

    function query() {

      that.requestLogin = false;
      that.isLoading = true;

      const data = OrderListModel.singleton();
      General.setLoaderAndPlaceholder(data, that, "listItems", "getListItems");
    }
    
  }
}
