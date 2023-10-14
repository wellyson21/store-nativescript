import { Page } from "tns-core-modules/ui/page";
import { EventData, fromObject } from "tns-core-modules/data/observable";
import { MainViewModel } from "./main-view-model";
import { ESFrame } from "~/pages/shared/utilities/esframe";
import {MainPage  as RootPage} from "~/pages/main/main-page";
import { General } from "~/pages/shared/utilities/general";

class MainPage {

  private static page: Page;
  private static frame: ESFrame;

  public static onPageLoaded(args: EventData) {

    const page = args.object as Page;
    const frame = page.frame as ESFrame;
    const viewModel = new MainViewModel();

    page.bindingContext = viewModel;

    MainPage.page = page;
    MainPage.frame = frame;
  }

  public static openEstablishment(args: any) {

    const id = args.object.eid.trim();
    let bc = (MainPage.page.bindingContext as MainViewModel);

    for(let i = 0;i < bc.establishments.length;i++){

      let e = bc.establishments.getItem(i);
      if(id == e.id.trim()){

        e.hasMoreImages = e.slideImages.length > 3;
        e.moreImages = e.slideImages.length - 3;
        MainPage.frame.present({
          moduleName: "pages/more/information/location/location-page",
          context: {internationalization: bc.internationalization,data: e},
          transition: {
            name: "slideLeft"
          }
        });
        break;
      }
    }
  }

  public static openAbout(){

    (MainPage.page.frame as any).push("pages/more/information/about/about-page");
  }

}

exports.onPageLoaded = MainPage.onPageLoaded;
exports.openEstablishment = MainPage.openEstablishment;
exports.onEstablishmentLoaded = RootPage.onRepeaterSetupBindingContext;
exports.openAbout = MainPage.openAbout;
exports.getImage = General.setAndGetImageFromCache;
