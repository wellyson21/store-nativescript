import { EventData, fromObject } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { General } from "~/pages/shared/utilities/general";
import { IProfile } from "~/pages/more/-entities/profile";
import { AuthenticationModel } from "../-models/authentication-model";
import { AuthenticationViewModel } from "../-shared/authentication-view-model";
import { Internationalization } from "~/pages/shared/utilities/internationalization";
import { ScrollView } from "tns-core-modules/ui/scroll-view/scroll-view";

var keyboard = require( "nativescript-keyboardshowing" );

export class RegisterPage {

  static page: Page; 
  static closeCallback: (result: any)=> void;

  static onShownModally(args: any) {

    const page = args.object as Page;
    page.actionBarHidden = true;
    RegisterPage.closeCallback = args.closeCallback;

    page.bindingContext = fromObject({ internationalization: Internationalization.singleton().getData(), onRequest: false, setting: (new AuthenticationViewModel()).setting });

    General.adjustForm(
      page.layoutView.getViewById("contForm"),
      page.layoutView.getViewById("contTextFields")      
    );
    
    (page.layoutView.getViewById("scrollView") as ScrollView).setInlineStyle("background-image: url('"+ page.bindingContext.setting.get("background") +"');");
   
    RegisterPage.page = page;
  }

  static onNavigatedTo() {
    //
  }

  static onBack() {

    RegisterPage.page.closeModal();
  }

  static onRegister(args: EventData) {

    let view = RegisterPage.page.layoutView;
    let model = AuthenticationModel.singleton();

    // let phone = (view.getViewById("phone") as any).text.trim();
    let name = (view.getViewById("name") as any).text.trim();
    let email = (<string>(view.getViewById("email") as any).text).trim().toLowerCase();
    let password = (view.getViewById("password")  as any).text.trim();
    let cpassword = (view.getViewById("confirm-password")  as any).text.trim();    

    if(!General.checkConnection()) { return; }

    if(password != cpassword){

      dialogs.alert({
        message: "The passwords are differents!",
        okButtonText: "ok"
      });
      return;
    }

    if(!name || !email || !password){

      dialogs.alert({
        message: "Please fill in all fields!",
        okButtonText: "ok"
      });
      return;
    }

    RegisterPage.page.bindingContext.onRequest = true;

    let profile: IProfile = {
      phone: "",
      address: {
        city: "",
        addressLine: "",
        postalCode: "",
        country: "",
        state: ""
      },
      name: name,
      email: email,
      myPoints: 0,
      capturePoints: 0,
      password: password
    };

    model.register(profile, (status: string) => {

      RegisterPage.page.bindingContext.onRequest = false;
      if(status == "fail") {

        setTimeout(() => {

          dialogs.alert({
            message: "Failed to register!",
            okButtonText: "ok"
          });       
        }, 1000); 
      }else{

        RegisterPage.closeCallback({statusLogin: true});
      }
    });
  }
}

exports.onShownModally = RegisterPage.onShownModally;
exports.onNavigatedTo = RegisterPage.onNavigatedTo;
exports.onBack = RegisterPage.onBack;
exports.onRegister = RegisterPage.onRegister;
exports.onKeyboard = function (evt) {

  if(!evt.showing) {

    General.resetAdjustForm();
  }
};
