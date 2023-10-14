import { Page, EventData } from "tns-core-modules/ui/page/page";
import { ESFrame } from "~/pages/shared/utilities/esframe";
import { ConfirmationViewModel } from "./confirmation-view-model";
import { MainPage } from "~/pages/main/main-page";
import { EProfile } from "~/pages/more/-entities/profile";
import { alert } from "tns-core-modules/ui/dialogs/dialogs";

class ConfirmationPage {

  private static page: Page;
  private static frame: ESFrame;

  public static onLoaded(args: EventData) {

    const page = args.object as Page;
    const frame = page.frame as ESFrame;
    
    ConfirmationPage.page = page;
    ConfirmationPage.frame = frame;
  }

  public static onNavigatingTo(args: any) {
    
    const page = args.object as Page;
    const context: any = args.context;
    const viewModel = new ConfirmationViewModel();

    viewModel.set("items", context.items);
    viewModel.set("destiny", context.destiny);
    
    page.bindingContext = viewModel;
  }

  public static onProfileChange() {

    ConfirmationPage.frame.present({ 
      moduleName: "pages/more/account/account-page",
      transition: {
        name: "slideLeft"
      }
    });
  }

  public static onConfirm() {

    let p = (ConfirmationPage.page.bindingContext.profile as EProfile);

    if(!p.address.local || !p.address.state || !p.address.city || !p.address.postalCode || !p.address.country){

      alert({title: "",message: "Please set delivery address!", okButtonText: "Ok"});
      return;
    }

    ConfirmationPage.frame.present({ 
      moduleName: "pages/store/payment/payment-page",
      transition: {
        name: "slideLeft"
      },
      context: ConfirmationPage.page.bindingContext
    });
  }

  public static onLogin() {

    ConfirmationPage.frame.showModal("pages/authentication/login/login-page", {
      closeCallback: null,
      context: {},
      fullscreen: true
    });
  }

}

exports.onLoaded = ConfirmationPage.onLoaded;
exports.onNavigatingTo = ConfirmationPage.onNavigatingTo;
exports.onLogin = ConfirmationPage.onLogin;
exports.onProfileChange = ConfirmationPage.onProfileChange;
exports.onConfirm = ConfirmationPage.onConfirm;
exports.onOrderListLoaded = MainPage.onRepeaterSetupBindingContext;
