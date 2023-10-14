import { Observable } from "tns-core-modules/data/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";
import { ProductsModel } from "../-models/products-model";
import { Internationalization } from "~/pages/shared/utilities/internationalization";

export class ProductListViewModel extends Observable {
    
    private _internationalization: any = Internationalization.singleton().getData();    
    private _products: any;

    private categoryId: string;

    private _searchItems = new ObservableArray([]);
    @ObservableProperty() public totalSearchItems = 0; 
    @ObservableProperty() public noResults = false;   

    constructor(categoryId: string) {
        super();

        this.categoryId = categoryId;

        this.getProducts();
    }

    get internationalization(): any {
  
        return this._internationalization;
    }
    
    get listItems(): any {

        return this._products;
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

    private getProducts() {

        const obj = new ProductsModel({
            categoryId: this.categoryId
        });      

        this._products = obj.getProducts();
    }
    
}
