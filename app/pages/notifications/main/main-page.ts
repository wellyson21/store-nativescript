import { Page } from "tns-core-modules/ui/page";
import { EventData } from "tns-core-modules/data/observable";
import { ESFrame } from "~/pages/shared/utilities/esframe";
import { MainViewModel } from "./main-view-model";
import { General } from "~/pages/shared/utilities/general";

export class MainPage {
  
  public static page: Page;
  public static frame: ESFrame;

  public static onLoaded(args: EventData) {

    const page = args.object as Page;
    const frame = page.frame as ESFrame;
    const viewModel = new MainViewModel();

    page.bindingContext = viewModel;

    MainPage.page = page;
    MainPage.frame = frame;
  }

  public static onNavigatedTo(args: EventData) {
    //
  }

  public static onOpenNotification(args: any) {
    
    const data = args.object.notificationData;

    MainPage.frame.present({
      moduleName: "pages/notifications/details/details-page",
      bindingContext: {
        data
      },
      transition: {
        name: "slideLeft"
      }
    });
  }

}

exports.onLoaded = MainPage.onLoaded;
exports.onNavigatedTo = MainPage.onNavigatedTo;
exports.onOpenNotification = MainPage.onOpenNotification;
exports.getImage = General.setAndGetImageFromCache;
