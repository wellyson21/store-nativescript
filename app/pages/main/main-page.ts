import { Page, View, PercentLength, ShowModalOptions } from "tns-core-modules/ui/page";
import { EventData } from "tns-core-modules/data/observable";
import { Internationalization } from "../shared/utilities/internationalization";
import { Notifications } from "~/root/start-classes/notifications";
import * as dialogs from "tns-core-modules/ui/dialogs/dialogs";
import { FirebaseUtilities } from "../shared/utilities/firebase-utilities";
import { firestore } from "nativescript-plugin-firebase";
import { ESettings } from "../shared/utilities/-entities/entities";
import * as platform from "tns-core-modules/platform";
import { General } from "../shared/utilities/general";

export class MainPage {

  private static page: Page;
  private static inter: any = Internationalization.singleton().getData();

  public static onLoaded(args: EventData) {

    const page = args.object as Page;
    page.actionBarHidden = true;

    MainPage.page = page;
    
    // Setting Notifications
    const _ = new Notifications();

    // appSettings.setString("email", "");    
    // appSettings.setString("userId", "");
  }

  public static onNavigatedTo() {
    //
  }

  public static onRepeaterSetupBindingContext(data: EventData) {

    const view = data.object as View;
    const bindingContext = Object.create(view.bindingContext);

    bindingContext.internationalization = Internationalization.singleton().getData();
    view.bindingContext = bindingContext;
  }

  //Dispach alert when promotion expires
  public static alertExpiredPromotion() {

    dialogs.alert({title: "",message: MainPage.inter.cards.alerts.promotionExpired, okButtonText: "Ok"});
  }

  public static chekForUpdates(){

    FirebaseUtilities.getQueryData(firestore.collection("Settings"),ESettings).then((result)=>{
      if(result.entities.length > 0){
        let settings = (<ESettings>result.entities[0]);
        if(settings.version){
          let version = platform.isIOS ? settings.version.ios : settings.version.android;
          if(version){
            if(version.requestUpdate){
              if((General.getVersion() as any * 1) == (version.value as any * 1)){

                // console.log(true);

                let modalOptions: ShowModalOptions = {
                  context: {},
                  fullscreen: true,
                  closeCallback: ()=>{}
                };

                // MainPage.page.showModal("pages/update-app/update-app-page", modalOptions)
              }
            }
          }
        }
      }
    });
  }

}

exports.onLoaded = MainPage.onLoaded;
exports.onNavigatedTo = MainPage.onNavigatedTo;
exports.onRepeaterSetupBindingContext = MainPage.onRepeaterSetupBindingContext;
