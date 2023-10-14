import { Observable } from "tns-core-modules/data/observable";
import { AccountModel } from "~/pages/more/-models/account-model";
import { Internationalization } from "~/pages/shared/utilities/internationalization";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";
import { AuthenticationModel } from "~/pages/authentication/-models/authentication-model";
import * as appSettings from "tns-core-modules/application-settings";

export class ConfirmationViewModel extends Observable {
  
  @ObservableProperty() public internationalization: any;
  @ObservableProperty() public profile: any;
  @ObservableProperty() public requestLogin: any;

  constructor() {
    super();
    
    this.getProfile();
    this.getInternationalization();
  }

  private getProfile() {

    const that = this;
    
    if(!appSettings.getString("userId")) { that.requestLogin = true; } else { query(); }

    AuthenticationModel.loginStatus.on("propertyChange", () => { query(); });

    function query() {

      that.requestLogin = false;
      
      const data = AccountModel.singleton();

      const timer = setTimeout(() => {

        if(data.getProfile().id !== "") {

          that.profile = data.getProfile();
          clearInterval(timer);
        }
      }, 100);
      
      
    }
  }

  private getInternationalization() {
    
    this.internationalization = Internationalization.singleton().getData();
  }
    
}
