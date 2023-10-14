import { CustomMenu } from "~/pages/shared/components/menu/custom-menu";
import { Page, View, EventData, ShowModalOptions } from "tns-core-modules/ui/page/page";
import { fromObject, Observable } from "tns-core-modules/data/observable/observable";
import *  as builder from "tns-core-modules/ui/builder"; 
import { CardsModel } from "../../-models/cards-model";
import { DockLayout } from "tns-core-modules/ui/layouts/dock-layout/dock-layout";
import { ICard } from "../../-entities/entities-interfaces";
import { CustomTabView } from "~/pages/shared/components/tabview/custom-tab-view";
import { Internationalization } from "~/pages/shared/utilities/internationalization";
import * as applicationSettings from "tns-core-modules/application-settings";
import { EPromotion } from "../../-entities/entities";
import { FirebaseUtilities } from "~/pages/shared/utilities/firebase-utilities";
import * as firebase from "nativescript-plugin-firebase";
import { Image } from "tns-core-modules/ui/image/image";
import { General } from "~/pages/shared/utilities/general";
import { HtmlView } from "tns-core-modules/ui/html-view/html-view";
import { ESFrame } from "~/pages/shared/utilities/esframe";

class PromotionsDetailsPage{

  public static page: Page;
  private static promotionData: any;
  private static cardsModel: CardsModel = CardsModel.singleton(); 

  public static onLoaded(args: EventData){

    const page = args.object as Page;
    const internalization = Internationalization.singleton()    
    page.bindingContext = fromObject({data: page.navigationContext, internationalization: internalization.getData()});
    PromotionsDetailsPage.promotionData = page.navigationContext;
    PromotionsDetailsPage.page = page;

    PromotionsDetailsPage.setVisibilityActionButtons();


    FirebaseUtilities.getOnSnapshotData(firebase.firestore.collection("Promotions"),EPromotion,(result)=>{

      result.entities.forEach(r=>{

        if(r.type === "modified"){

          let cp = (page.bindingContext.data as EPromotion);
          let p = ((r.entity as any) as EPromotion);

          if(cp.id.trim() === p.id.trim()){

            page.bindingContext.data = p;
            (page.bindingContext as Observable).notifyPropertyChange("data",p);
          }
        }
      });
      
    });
    
  }

  
  //Setup border radius of thumbail
  public static onThumbnailLayout(data: EventData){

    let image = data.object as View;
    image.style.borderRadius = `${image.getMeasuredWidth() / 2}px`;
  }

  //Subscribe a promotion to points card
  private static onSubscribe(data: EventData){

    if(!applicationSettings.getString("userId")) {
      
      const showModalOptions: ShowModalOptions = {
        closeCallback: (result: any) => {
          if(result.statusLogin){

            exec();
          }
        },
        context: {},
        fullscreen: true
      };

      PromotionsDetailsPage.page.frame.showModal("pages/authentication/login/login-page", showModalOptions);
    }else{

      exec();
    }

    function exec() {

      let cardsModel = PromotionsDetailsPage.cardsModel;
      let card: ICard = {
        myPoints: 0,
        profileId: applicationSettings.getString("userId","").trim(),
        promotionId: PromotionsDetailsPage.promotionData.id,
        createDate: new Date()
      };

      cardsModel.registerCard(card).then(status=>{
        
        if(status){

          PromotionsDetailsPage.setVisibilityActionButtons(true);
        }else{

          PromotionsDetailsPage.setVisibilityActionButtons(false);
        }
      });
    }
    
  }

  //Unsubscribe a promotion to points card
  private static onUnsubscribe(data:  EventData){

    let cardsModel = PromotionsDetailsPage.cardsModel;
   
    cardsModel.removeCard(PromotionsDetailsPage.promotionData.id).then(status=>{
      if(status){
    
        PromotionsDetailsPage.setVisibilityActionButtons(false);
      }else{

        PromotionsDetailsPage.setVisibilityActionButtons(true);
      }
    }); 
  }

  //Toggle visiblity sub/unsub action Buttons
  private static setVisibilityActionButtons(status?: boolean){

    let mainView = (PromotionsDetailsPage.page.layoutView as View);
    let containerAction = (PromotionsDetailsPage.page.layoutView as View).getViewById("container-action") as DockLayout;
    let internationalization = Internationalization.singleton().getData();

    let subButton = builder.parse(`<Button dock="right" text="${internationalization.cards.subscribeButton}" class="sub"></Button>`);
    let unSubButton = builder.parse(`<Button dock="right" text="${internationalization.cards.unsubscribeButton}" class="unsub"></Button>`);

    containerAction.eachChild(v=>{
      if(v.typeName == "Button"){

        containerAction.removeChild(v as View);
      }
      return true;
    });

    PromotionsDetailsPage.cardsModel.isRegistered(PromotionsDetailsPage.promotionData.id.trim()).then(status=>{

      let condition = status != undefined ? status : false;

      if(condition){
  
        unSubButton.on("tap",PromotionsDetailsPage.onUnsubscribe);
        containerAction.addChild(unSubButton);
      }else{
  
        subButton.on("tap",PromotionsDetailsPage.onSubscribe);
        containerAction.addChild(subButton);
      }
    });
  }

  //Open Image Viewer
  public static onOpenImage(args: any) {

    const index = args.object.index;
    const modalModuleName = "pages/shared/components/image-viewer/image-viewer-page";
    const fullscreen = true;
    const context = {
      index,
      images: PromotionsDetailsPage.page.bindingContext.data.slideImages
    };

    CustomTabView.getMainFrame().showModal(modalModuleName, context, null, fullscreen);
  }

  //Setup height HtmlView
  public static onPromotionDescriptionLoaded(data: EventData){

    let htmlView = data.object as HtmlView;
    setTimeout((htmlView)=>{

      htmlView.requestLayout();
    },350,htmlView)
  }

}

export const onLoaded = PromotionsDetailsPage.onLoaded;
export const onThumbnailLayout = PromotionsDetailsPage.onThumbnailLayout;
export const onOpenImage = PromotionsDetailsPage.onOpenImage;
export const setHeightImage = General.setHeightImage;
export const getImage = General.setAndGetImageFromCache;
export const onPromotionDescriptionLoaded = PromotionsDetailsPage.onPromotionDescriptionLoaded;
