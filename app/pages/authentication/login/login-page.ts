import { EventData, fromObject } from "tns-core-modules/data/observable";
import { Page, View, ShowModalOptions } from "tns-core-modules/ui/page";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { General } from "~/pages/shared/utilities/general";
import { ScrollView } from "tns-core-modules/ui/scroll-view";
import { AuthenticationModel } from "../-models/authentication-model";
import { AuthenticationViewModel } from "../-shared/authentication-view-model";
import { Internationalization } from "~/pages/shared/utilities/internationalization";
import { Keyboard, KeyboardStatus } from "../../shared/utilities/keyboard";

const _ = new KeyboardStatus((status: boolean) => {
  if(!status) { General.resetAdjustForm(); }
});

class LoginPage {

  private static page: Page;
  private static closeCallback: any;

  public static onShownModally(args: any) {

    const page = args.object as Page;
    page.actionBarHidden = true;
    const viewModel = new AuthenticationViewModel();

    LoginPage.page = page;
    LoginPage.closeCallback = args.closeCallback;

    page.bindingContext = fromObject({ internationalization: Internationalization.singleton().getData(), onRequest: true, setting: viewModel.setting, hideCloseButton: args.context.hideCloseButton });

    General.adjustForm(
      page.layoutView.getViewById("contForm"),
      page.layoutView.getViewById("contTextFields")
    );

    if(AuthenticationModel.singleton().finished) {
      
      setTimeout(() => {
        page.bindingContext.onRequest = false;
        (page.layoutView.getViewById("scrollView") as ScrollView).setInlineStyle("background-image: url('"+ page.bindingContext.setting.get("background") +"');");
      }, 1000);
    }

    AuthenticationModel.singleton().isFinishedQuest.on("propertyChange", (obj) => {
      page.bindingContext.onRequest = false;
      (page.layoutView.getViewById("scrollView") as ScrollView).setInlineStyle("background-image: url('"+ page.bindingContext.setting.get("background") +"');");
    });
   
  }

  public static onCloseModal() {

    LoginPage.closeCallback({ statusLogin: false });
  }

  public static onRecoverPassword() {

    console.log("recover password");
  }

  public static onLogin() {

    const view = LoginPage.page.layoutView;
    const email = (<string>(view.getViewById("email") as any).text).trim().toLowerCase();
    const password = (view.getViewById("password")  as any).text.trim();
    const model = AuthenticationModel.singleton();

    if(!General.checkConnection()) { return; }

    if(email && password){

      Keyboard.dismissKeyboard();

      LoginPage.page.bindingContext.onRequest = true;

      model.login({
        email, password
      }, (status: string) => {

        if(status === "success") {

          LoginPage.closeCallback({ statusLogin: true });
        } else if(status === "fail") {

          LoginPage.page.bindingContext.onRequest = false;

          setTimeout(() => {

            dialogs.alert({
              message: "Invalid email or password!",
              okButtonText: "ok"
            });
          }, 1000);
        }
      });
    } else {

      dialogs.alert({
        message: "Please fill in all Fields!",
        okButtonText: "ok"
      });
    }
  }

  public static onLoginFacebook() {

    console.log("login facebook");
  }

  public static onLoginGoogle() {

    console.log("login google");
  }

  public static onLoginTwitter() {
    
    console.log("login twitter");
  }

  public static onRegister(args: EventData) {

    const showModalOptions: ShowModalOptions = {
      closeCallback: (result) => {
        if(result && result.statusLogin){

          LoginPage.closeCallback(result);
        }
      },
      fullscreen: true,
      context: {}
    };
    LoginPage.page.showModal("pages/authentication/register/register-page", showModalOptions);
  }

}

exports.onShownModally = LoginPage.onShownModally;
exports.onCloseModal = LoginPage.onCloseModal;
exports.onRecoverPassword = LoginPage.onRecoverPassword;
exports.onLogin = LoginPage.onLogin;
exports.onLoginFacebook = LoginPage.onLoginFacebook;
exports.onLoginGoogle = LoginPage.onLoginGoogle;
exports.onLoginTwitter = LoginPage.onLoginTwitter;
exports.onRegister = LoginPage.onRegister;
