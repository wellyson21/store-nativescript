import { Page } from "tns-core-modules/ui/page";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { Carousel } from "nativescript-carousel";
import { ImageSource } from "tns-core-modules/image-source/image-source";

export class ImageViewerPage {

  private static page: Page;
  private static closeCallback: any;

  public static onShownModally(args: any) {

    const page = args.object as Page;
    const context = args.context;

    page.bindingContext = context;
    page.iosOverflowSafeArea = true;

    ImageViewerPage.page = page;
    ImageViewerPage.closeCallback = args.closeCallback;
  }

  public static onClose() {

    const response = {
      index: (ImageViewerPage.page.getViewById("myCarousel") as Carousel).selectedPage
    };

    ImageViewerPage.closeCallback(response);
  }

}

exports.onShownModally = ImageViewerPage.onShownModally;
exports.onClose = ImageViewerPage.onClose;
