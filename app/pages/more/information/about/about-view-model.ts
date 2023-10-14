import { Observable } from "tns-core-modules/data/observable";
import { AboutModel } from "../../-models/about-model";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";

export class AboutViewModel extends Observable {
	
	private _sectionsData: any;

	constructor() {
		super();
	   
		this.getSectionsData();
	}

	get sectionsData(): any {

		return this._sectionsData;
	}

	private getSectionsData() {

		const obj = new AboutModel();
		this._sectionsData = obj.getSectionsData();
	}
	
}
