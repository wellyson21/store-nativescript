import { Observable } from "tns-core-modules/data/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";
import { ProductsModel } from "../-models/products-model";
import { Internationalization } from "~/pages/shared/utilities/internationalization";

export class ProductSearchViewModel extends Observable {

  private _internationalization: any;
  private _listItems: any;

  private _searchItems = new ObservableArray([]);
  @ObservableProperty() public totalSearchItems = 0;
  @ObservableProperty() public noResults = false;   

  constructor() {
    super();
    
    this.getProducts();
    this.getInternationalization();
  }

  get internationalization(): any{

    return this._internationalization;
  }

  get listItems(): any {

    return this._listItems;
  }

  get searchItems(): any {

    return this._searchItems;
  }

  public search(string: any): number {

    this.searchClear();

    if(string != "") {

      this._listItems.forEach((v: any) => {
        
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
  
  private getProducts() {

    const obj = new ProductsModel();

    this._listItems = obj.getProducts();
  }  

  private getInternationalization(){

    let i = Internationalization.singleton();
    this._internationalization = i.getData();
  }
    
}
