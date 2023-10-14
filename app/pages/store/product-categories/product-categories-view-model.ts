import { Observable } from "tns-core-modules/data/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";
import { ProductsModel } from "../-models/products-model";
import { Internationalization } from "~/pages/shared/utilities/internationalization";

export class ProductCategoriesViewModel extends Observable {

  private _searchItems = new ObservableArray([]);
  private _internationalization: any;
  private _categoryItems: any;  
  
  @ObservableProperty() public totalSearchItems = 0;
  @ObservableProperty() public noResults = false;

  constructor() {
    super();
    
    this.getCategoriesData();
    this.getInternationalization();
  }

  get internationalization(): any {

    return this._internationalization;
  }

  get categoryItems(): any {

    return this._categoryItems;
  }

  get searchItems(): any {

      return this._searchItems;
  }

  public search(string: any): number {

    this.searchClear();

    if(string != "") {

      this._categoryItems.forEach((v: any) => {
          
        if (v.name.toLowerCase().search(string.toLowerCase()) != -1) {
            
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

  private getCategoriesData() {

    const obj = new ProductsModel();

    this._categoryItems = obj.getProductCategories();
  }   

  private getInternationalization() {

    let inter = Internationalization.singleton();
    this._internationalization = inter.getData();
  }
    
}
