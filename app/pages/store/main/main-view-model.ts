import { Observable } from "tns-core-modules/data/observable";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";
import { MainModel } from "../-models/main-model";
import { General } from "~/pages/shared/utilities/general";
import { Internationalization } from "~/pages/shared/utilities/internationalization";
import { CartModel } from "../-models/cart-model";
import { ProductsModel } from "../-models/products-model";

export class MainViewModel extends Observable {
    
    private _internationalization: any = Internationalization.singleton().getData();
    private _slideItems: any;
    private _listItems: any;

    @ObservableProperty() public countItems: number = 0;

    @ObservableProperty() public haveDataToDisplay: boolean = true;
    @ObservableProperty() public isLoading: boolean = true;
    @ObservableProperty() public dataLength: number = 0;

    constructor(dataRequest = true) {
        super();
       
        if(dataRequest) {
            this.getSlideItems();
            this.getProducts();
        }
    }

    get internationalization(): any {
  
        return this._internationalization;
    }

    get slideItems(): any {

        return this._slideItems;
    }

    get listItems(): any {

        return this._listItems;
    }

    set listItems(newValue) {

        this._listItems = newValue;
    }
    
    get countCartItems() {

        this.countItems = CartModel.countItems.get("length");

        return (this.countItems <= 9 ? this.countItems : "+9");
    }

    private getSlideItems() {

        const obj = new MainModel();

        this._slideItems = obj.getSlideItems();
    }

    private getProducts() {

        const obj = ProductsModel.singleton();
    
        General.setLoaderAndPlaceholder(obj, this, "listItems", "getProducts");
    }
    
}
