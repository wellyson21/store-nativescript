import { Page, EventData, PercentLength } from "tns-core-modules/ui/page/page";
import { ESFrame } from "~/pages/shared/utilities/esframe";
import { Carousel } from "nativescript-carousel";
import { Paralax } from "~/pages/shared/utilities/paralax";
import { StoreAssistant } from "../-shared/utilities/store-assistant";
import { General } from "~/pages/shared/utilities/general";
import { CartModel } from "../-models/cart-model";
import { CustomTabView } from "~/pages/shared/components/tabview/custom-tab-view";


class ProductDetailsPage {

  private static page: Page;
  private static frame: ESFrame;

  public static onLoaded(args: EventData) {

    const page = args.object as Page;
    const frame = page.frame as ESFrame;

    ProductDetailsPage.page = page;
    ProductDetailsPage.frame = frame;
  }

  public static onNavigatingTo() {
    //
  }

  public static onScroll(args: any) {

    const obj = new Paralax(ProductDetailsPage.page);

    obj.active(args);
  }

  public static onOpenImage(args: any) {
   
    const carousel = ProductDetailsPage.page.getViewById("myCarousel") as Carousel;
  
    CustomTabView.getMainFrame().showModal("pages/shared/components/image-viewer/image-viewer-page", {
      closeCallback: (response) => {
        carousel.selectedPage = response.index;
      },
      fullscreen: true,
      context: {
        index: carousel.selectedPage,
        images: ProductDetailsPage.page.bindingContext.data.images
      }
    });
  }

}

exports.onLoaded = ProductDetailsPage.onLoaded;
exports.onNavigatingTo = ProductDetailsPage.onNavigatingTo;
exports.onScroll = ProductDetailsPage.onScroll;
exports.onOpenCart = StoreAssistant.onOpenCart;
exports.onOpenProductDetails = StoreAssistant.onOpenProductDetails;
exports.onOpenProductOptions = StoreAssistant.onOpenProductOptions;
exports.onOpenImage = ProductDetailsPage.onOpenImage;
exports.setHeightImage = General.setHeightImage;
