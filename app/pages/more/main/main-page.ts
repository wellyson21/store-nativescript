import { Page } from "tns-core-modules/ui/page";
import { EventData, fromObject } from "tns-core-modules/data/observable";
import { MainViewModel } from "./main-view-model";
import { ESFrame } from "~/pages/shared/utilities/esframe";

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

  public static onOpenOption(args: any) {

    const modulePath = args.object.path;

    if (modulePath !== "") {
      
      MainPage.frame.present({
        moduleName: modulePath,
        transition: {
          name: "slideLeft"
        }
      });
    }
  }

}

exports.onPageLoaded = MainPage.onPageLoaded;
exports.onOpenOption = MainPage.onOpenOption;
