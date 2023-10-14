import { Observable } from "tns-core-modules/data/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";
import { InformationMainModel } from "../../-models/information-main-model";
import { Internationalization } from "~/pages/shared/utilities/internationalization";
import { General } from "~/pages/shared/utilities/general";

export class MainViewModel extends Observable {

	private _establishments: any;
	public internationalization: any;

	@ObservableProperty() public haveDataToDisplay: boolean = true;
  @ObservableProperty() public isLoading: boolean = true;
  @ObservableProperty() public dataLength: number = 0;
	
	private _searchItems = new ObservableArray([]);
  @ObservableProperty() public totalSearchItems = 0;
  @ObservableProperty() public noResults = false;  

	constructor() {
		super();
			
		this.getEstablishments();
		this.getInternationalization();
	}

	get establishments(): any {

		return this._establishments;
  }
  
  set establishments(newValue){

		this._establishments = newValue;
	}

	get searchItems(): any {

    return this._searchItems;
  }

  public search(string: any): number {

    this.searchClear();

    if(string != "") {

      this._establishments.forEach((v: any) => {
        
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

	private getEstablishments() {
		const obj = InformationMainModel.singleton();

    General.setLoaderAndPlaceholder(obj,this,"establishments","getEstablishments");
	}

	private getInternationalization(){

		let it = Internationalization.singleton();
		this.internationalization = it.getData();
	}
    
}
