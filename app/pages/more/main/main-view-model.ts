import { Observable } from "tns-core-modules/data/observable";
import { MainModel } from "../-models/main-model";

export class MainViewModel extends Observable {

    private _optionItems: Array<any>;

    constructor() {
        super();
       
        this.getOptionItems();
    }

    get optionItems(): Array<any> {

        return this._optionItems;
    }

    private getOptionItems() {
        const obj = new MainModel();

        this._optionItems = obj.getData();
    }
    
}
