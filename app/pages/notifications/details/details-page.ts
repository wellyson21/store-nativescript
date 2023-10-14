import { Page, EventData } from "tns-core-modules/ui/page";
import { fromObject } from "tns-core-modules/data/observable";
import { ESFrame } from "~/pages/shared/utilities/esframe";
import { CustomTabView } from "~/pages/shared/components/tabview/custom-tab-view";
import { Internationalization } from "~/pages/shared/utilities/internationalization";
import { General } from "~/pages/shared/utilities/general";

class DetailsPage {

  private static page: Page;
  private static frame: ESFrame;

  public static onLoaded(args: EventData) {
    const page = args.object as Page;

    DetailsPage.ajustBindingContext(page);

    DetailsPage.page = page;
    DetailsPage.frame = page.frame as ESFrame;
  }

  public static onOpenImage(args: any) {

    CustomTabView.getMainFrame().showModal("pages/shared/components/image-viewer/image-viewer-page", {
      closeCallback: () => {},
      fullscreen: true,
      context: {
        index: args.object.index,
        images: DetailsPage.page.bindingContext.data.images
      }
    });
  }

  private static ajustBindingContext(page: Page) {
 
    if (page.bindingContext.data) {
      const arrData: any = page.bindingContext.data;
      const lengthImages = page.bindingContext.data.images.length;

      arrData.moreImages = lengthImages > 3 ? (lengthImages - 3) : lengthImages;
      arrData.hasMoreImages = lengthImages > 3;

      page.bindingContext = fromObject({
        data: arrData,
        internationalization: Internationalization.singleton().getData()
      });
    }
  }

}

exports.onLoaded = DetailsPage.onLoaded;
exports.onOpenImage = DetailsPage.onOpenImage;
exports.setHeightImage = General.setHeightImage;
exports.getImage = General.setAndGetImageFromCache;
