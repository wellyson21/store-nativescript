import { CustomMenu } from "~/pages/shared/components/menu/custom-menu";
import { Page, View, EventData, PercentLength } from "tns-core-modules/ui/page/page";
import { CardsPage } from "~/pages/cards/main/cards-page";
import { PromotionsViewModel } from "./promotions-page-view-model";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout/stack-layout";
import { ESFrame } from "~/pages/shared/utilities/esframe";
import { PromotionsModel } from "../-models/promotions-model";
import { MainPage } from "~/pages/main/main-page";
import { ScrollView } from "tns-core-modules/ui/scroll-view/scroll-view";
import { General } from "~/pages/shared/utilities/general";

class PromotionsPage {

  public static page: Page;
  public static sideMenu: CustomMenu;
  public static model: PromotionsModel = PromotionsModel.singleton();

  public static onNavigatingTo(args: EventData){

    const page = args.object as Page;
    const sideMenu = page.layoutView.getViewById("custom-menu") as CustomMenu;
  
    PromotionsPage.sideMenu = sideMenu;
    PromotionsPage.page = page;
    sideMenu.setup(__filename);
    CardsPage.settingSideMenu(sideMenu);
  }

  public static onLoaded(args: EventData){

    const page = args.object as Page;
    page.bindingContext = new PromotionsViewModel();

  }

  //SideMenu
  public static onToggleMenu(){

    PromotionsPage.sideMenu.toggleMenuState();
  }


  //Show promotions details
  public static onOpenPromotion(data: EventData){
    
    PromotionsPage.model.getPromotion(((data as any).view).id).then(result=>{

      (<any>result).hasMoreImages = result.slideImages.length > 3;
      (<any>result).moreImages = result.slideImages.length - 3;

      (PromotionsPage.page.frame  as ESFrame).present({
        moduleName: "pages/cards/promotions/details/details-page",
        context: result
      });
    });
  }

  public static setHeightImage(data: EventData){

    let image = (data.object as StackLayout);
    
    setTimeout(()=>{

      image.height = PercentLength.parse(`${(image.getMeasuredWidth().valueOf() / 1.3)}px`);
    },5);
   
  }


}

exports.onNavigatingTo = PromotionsPage.onNavigatingTo;
exports.onLoaded = PromotionsPage.onLoaded;
exports.onToggleMenu = PromotionsPage.onToggleMenu;
exports.onOpenPromotion = PromotionsPage.onOpenPromotion;
exports.onPromotionImageLayout = PromotionsPage.setHeightImage;
exports.onPromotionLoaded = MainPage.onRepeaterSetupBindingContext;


