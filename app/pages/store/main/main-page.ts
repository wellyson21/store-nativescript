import { Page, EventData, PercentLength } from "tns-core-modules/ui/page";
import { ESFrame } from "~/pages/shared/utilities/esframe";
import { Paralax } from "~/pages/shared/utilities/paralax";
import { Carousel } from "nativescript-carousel";
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout/grid-layout";
import { StoreAssistant } from "~/pages/store/-shared/utilities/store-assistant";
import { MainViewModel } from "./main-view-model";

export class MainPage {

  private static page: Page;
  private static frame: ESFrame;
  private static carousel: Carousel;

  private static carouselTimerId: any;
  private static carouselSwipeOccurred: boolean = false;
  private static finishQueue: boolean = false;

  public static onLoaded(args: EventData) {

    const page = args.object as Page;
    const frame = page.frame as ESFrame;
    const viewModel = new MainViewModel();
    const carousel = page.layoutView.getViewById("myCarousel") as Carousel;

    page.bindingContext = viewModel;

    MainPage.page = page;
    MainPage.frame = frame;
    MainPage.carousel = carousel;

    MainPage.carouselSetup();
  }

  public static onScroll(args: any) {

    const obj = new Paralax(MainPage.page);

    obj.active(args);
  }
 
  public static carouselAnimation() {

    const carousel = MainPage.carousel;
    const countItems = (<Array<any>>MainPage.page.bindingContext.slideItems).length;
    
    MainPage.carouselTimerId = setInterval(() => {

      if(carousel.selectedPage < countItems && !MainPage.finishQueue) {

        carousel.selectedPage++;

        if (carousel.selectedPage === (countItems - 1)) {
                
          MainPage.finishQueue = true;
        }

        if (carousel.selectedPage > (countItems - 1)) {
          
          carousel.selectedPage = (countItems - 1);
          MainPage.finishQueue = true;
        }
      } else {

        if(carousel.selectedPage > 0) {

          carousel.selectedPage--;

          if (carousel.selectedPage === 0) {

            MainPage.finishQueue = false;
          }
        } else {

          carousel.selectedPage = 0;
          
          MainPage.finishQueue = false;
        }
      }
    }, 8000);
  }

  public static onCarouselChanged() {

    if(MainPage.carouselSwipeOccurred) {

      clearInterval(MainPage.carouselTimerId);

      MainPage.carouselAnimation();

      MainPage.carouselSwipeOccurred = false;
    }
  }

  public static setHeightImage(data: EventData) {

    const image = (data.object as GridLayout);
    
    setTimeout(() => {
      image.height = PercentLength.parse(`${(image.getMeasuredWidth().valueOf() / 2.17)}px`);
    }, 5);
  }
  
  private static carouselSetup() {

    clearInterval(MainPage.carouselTimerId);
    
    MainPage.carousel.on("swipe", () => {
      MainPage.carouselSwipeOccurred = true;
    });

    setTimeout(() => {
      MainPage.carouselAnimation();
    }, 1000);
  }

}

exports.onLoaded = MainPage.onLoaded;
exports.onScroll = MainPage.onScroll;
exports.onOpenCart = StoreAssistant.onOpenCart;
exports.onOpenOrderList = StoreAssistant.onOpenOrderList;
exports.onOpenProductSearch = StoreAssistant.onOpenProductSearch;
exports.onOpenProductCategories = StoreAssistant.onOpenProductCategories;
exports.onCarouselChanged = MainPage.onCarouselChanged;
exports.setHeightImage = MainPage.setHeightImage;
