import { Observable } from "tns-core-modules/data/observable/observable";
import { AuthenticationModel } from "../-models/authentication-model";
import { General } from "~/pages/shared/utilities/general";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";

export class AuthenticationViewModel extends Observable {

  private _setting: any;

  @ObservableProperty() public haveDataToDisplay: boolean = true;
  @ObservableProperty() public isLoading: boolean = true;
  @ObservableProperty() public dataLength: number = 0;

  constructor() {
    super();

    this.getSetting();
  }

  get setting(): any {

    return this._setting;
  }

  set setting(newValue) {

    this._setting = newValue;
  }

  private getSetting() {

    General.setLoaderAndPlaceholder(AuthenticationModel.singleton(), this, "setting", "getSetting");
  }
}