import { Internationalization } from "~/pages/shared/utilities/internationalization";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { AuthenticationModel } from "~/pages/authentication/-models/authentication-model";
import * as appSettings from "tns-core-modules/application-settings";

export class MainModel {

  private menuData: ObservableArray<any> = new ObservableArray([]);
    
  public getData(): any {
    
    const inter = Internationalization.singleton().getData();
    
    const data = [
      {
        icon: String.fromCharCode(0xf24b),
        label: inter.more.AboutTitle,
        moduleName: "pages/more/information/about/about-page"
      }
    ];

    const accountOption = {
      icon: String.fromCharCode(0xf364),
      label: inter.account.AccountPageTitle,
      moduleName: "pages/more/account/account-page"
    };
    
    this.menuData.push(data);

    if(appSettings.getString("userId")) {

      this.menuData.unshift(accountOption);
    }

    AuthenticationModel.loginStatus.on("propertyChange", (obj) => {

      if(obj.object.get("status")) {

        this.menuData.unshift(accountOption);
      } else {

        this.menuData.shift();
      }
    });

    return this.menuData;
  }

}
