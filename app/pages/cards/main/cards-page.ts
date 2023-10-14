import { Page, EventData, Observable, View, ShowModalOptions } from "tns-core-modules/ui/page/page";
import { ESFrame } from "~/pages/shared/utilities/esframe";
import { CardsViewModel } from "./cards-view-model";
import { CustomMenu, MenuItem } from "~/pages/shared/components/menu/custom-menu";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { CardsModel } from "../-models/cards-model";
import { PromotionsModel } from "../-models/promotions-model";
import  * as plaform from "tns-core-modules/platform";
import {BarcodeScanner} from "nativescript-barcodescanner";

import * as applicationSettings from "tns-core-modules/application-settings";
import { MainPage } from "~/pages/main/main-page";
import { Internationalization } from "~/pages/shared/utilities/internationalization";

import * as firebase from "nativescript-plugin-firebase";
import { FirebaseUtilities } from "~/pages/shared/utilities/firebase-utilities";
import { EProfile } from "~/pages/more/-entities/profile";
import { General } from "~/pages/shared/utilities/general";
import { CustomTabView } from "~/pages/shared/components/tabview/custom-tab-view";
import * as dialogs from "tns-core-modules/ui/dialogs/dialogs";
import { AuthenticationModel } from "~/pages/authentication/-models/authentication-model";

export class CardsPage {

  public static page: Page;
  private static frame: ESFrame;
  private static sideMenu: CustomMenu;

  public static onNavigatingTo(args: EventData){

    const page = args.object as Page;
    const sideMenu = page.layoutView.getViewById("custom-menu") as CustomMenu;
    CardsPage.sideMenu = sideMenu;
    CardsPage.page = page;
    
    sideMenu.setup(__filename);
    CardsPage.settingSideMenu(sideMenu);
  }

  public static onLoaded(args: EventData) {

    const page = args.object as Page;
    const frame = page.frame as ESFrame;
    const viewModel = new CardsViewModel();
    const sideMenu = page.layoutView.getViewById("custom-menu") as CustomMenu;

    page.bindingContext = viewModel;
    CardsPage.page = page;
    CardsPage.frame = frame;
  }

  //Setup menu data
  public static settingSideMenu(sideMenu: CustomMenu){

    if(!applicationSettings.getString("userId")){

      sideMenu.headerData = fromObject({
        thumbnail: applicationSettings.getString("profilePhoto") ? applicationSettings.getString("profilePhoto") : "~/assets/images/account/placeholder-profile.png"
      });
    }else{
      
      query();
    }

    AuthenticationModel.loginStatus.on("propertyChange", (obj) => {
      
      if(obj.object.get("status")){

        query();
      }else{

        sideMenu.headerData = fromObject({
          thumbnail: applicationSettings.getString("profilePhoto") ? applicationSettings.getString("profilePhoto") : "~/assets/images/account/placeholder-profile.png"
        });
      }
    });


    function query(){

      FirebaseUtilities.getOnSnapshotData(firebase.firestore.collection("Profiles").where("email","==", applicationSettings.getString("email","").trim()),EProfile,(data=>{
    
        if(data.entities.length === 0){
  
          sideMenu.headerData = fromObject({
            thumbnail: applicationSettings.getString("profilePhoto") ? applicationSettings.getString("profilePhoto") : "~/assets/images/account/placeholder-profile.png"
          });
        }
  
        data.entities.forEach(obj=>{
  
          let entity = (obj.entity as any) as EProfile;
          sideMenu.headerData = fromObject({
            name: entity.name,
            email: entity.email,
            thumbnail: entity.photo
          });
  
          if(CardsPage.page.bindingContext){
  
            CardsPage.page.bindingContext.acumulatedPoints = entity.myPoints;
          }
        });
      }));
    }
    
   


    let it = Internationalization.singleton().getData();

    sideMenu.itemsData = new ObservableArray([
      new MenuItem("f1aa", it.cards.menu.cards,"pages/cards/main/cards-page"),
      new MenuItem("~/assets/images/promo.png", it.cards.menu.promotions,"pages/cards/promotions/promotions-page"),
      new MenuItem("~/assets/images/tickets.png", it.cards.menu.tickets,"pages/cards/tickets/tickets-page")
    ]);
  }

  //Event Handlers
  public static onReadQRCode(data: EventData) {

    let barcodescanner = new BarcodeScanner();
    let view  = (data.object as any);
    let iosf;
    let f = CardsPage.page.frame;

    if(plaform.isIOS){
      let it = setInterval(()=>{
        if(f.ios.controller.view.frame.size.height < CustomTabView.getMainFrame().ios.controller.view.frame.size.height){
         
          iosf = f.ios.controller.view.frame;
          clearInterval(it);
        }
      });
    }
    

    barcodescanner.scan({
      formats: "QR_CODE, EAN_13",
      // cancelLabel: "EXIT. Also, try the volume buttons!", // iOS only, default 'Close'
      cancelLabelBackgroundColor: "#333333", // iOS only, default '#000000' (black)
      message: "Use the volume buttons for extra light", // Android only, default is 'Place a barcode inside the viewfinder rectangle to scan it.'
      showFlipCameraButton: false,   // default false
      preferFrontCamera: false,     // default false
      showTorchButton: false,        // default false
      beepOnScan: false,             // Play or Suppress beep on scan (default true)
      torchOn: false,               // launch with the flashlight on (default false)
      closeCallback: () => {

        if(plaform.isIOS){
          
          setTimeout(()=>{

            CardsPage.page.frame.ios.controller.view.frame = iosf;                  
          },500);
        }

        // console.log("Scanner closed")
      }, // invoked when the scanner was closed (success or abort)
      resultDisplayDuration: 500,   // Android only, default 1500 (ms), set to 0 to disable echoing the scanned text
      // orientation: orientation,     // Android only, default undefined (sensor-driven orientation), other options: portrait|landscape
      openSettingsIfPermissionWasPreviouslyDenied: true // On iOS you can send the user to the settings app if access was previously denied
    }).then((result) => {
      
        let it = Internationalization.singleton().getData();

        setTimeout(()=>{

               // let result = {text: "card-point/ct0001"};
          let cardsModel = CardsModel.singleton();
          cardsModel.hasPointToCapture().then(p=>{
  
            let points = parseInt(p as any);
            if(points <= 0){

              dialogs.alert({title: "",message: it.cards.alerts.noPointsToCapture, okButtonText: "Ok"});
              return; 
            }
  
            let routeArr = result.text.trim().split("/");
            if(routeArr.length === 2 && routeArr[0].trim().toLowerCase() === "card-point"  && routeArr[1].trim().toLowerCase() === "catch"){
  
              let viewModel = (CardsPage.page.bindingContext);
              if(view.storage === "card"){
  
                for(let i = 0; i < cardsModel.getCards().length;i++){

                  let card = cardsModel.getCards().getItem(i);
                  if(card.id.trim() == (view as any).cardId.trim()){

                    let cpoints = 0;
                    let extra = 0;
                    if((points + parseInt(card.myPoints as any)) > parseInt(card.totalPoints as any)){

                      cpoints = card.totalPoints; 
                      extra = points - (card.totalPoints - card.myPoints);
                    }else{

                      cpoints = points + parseInt(card.myPoints as any);
                    }

                    let csd = ((CardsPage.page.bindingContext as CardsViewModel).cardsData  as ObservableArray<any>)
                      
                    card.myPoints = cpoints;
                    csd.splice(i,1,card);
                    cardsModel.updateCard(card).then(()=>{

                      dialogs.alert({title: "", message: it.cards.alerts.pointsCatured, okButtonText: "Ok"});
                    }).catch(()=>{

                      dialogs.alert({title: "", message: it.cards.alerts.pointsNotCatured, okButtonText: "Ok"});
                    });

                    if(extra > 0){
  
                      cardsModel.getAcumulatedPoints().then(p=>{
    
                        let acpoints = extra + parseInt(p as any);
                        CardsPage.page.bindingContext.acumulatedPoints = acpoints;
                        cardsModel.setAcumulatedpoints(acpoints);
                      });
                    }

                    cardsModel.removeCapturedPoints();
                  }
                }
              }else if(view.storage === "acumulated"){
  
                cardsModel.getAcumulatedPoints().then(acp=>{
  
                  cardsModel.removeCapturedPoints();
                  let acpoints = points + parseInt(acp as any);
                  CardsPage.page.bindingContext.acumulatedPoints = acpoints;
                  cardsModel.setAcumulatedpoints(acpoints).then(()=>{

                    dialogs.alert({title: "",message: it.cards.alerts.pointsCatured, okButtonText: "Ok"});
                  }).catch(()=>{

                    dialogs.alert({title: "",message: it.cards.alerts.pointsNotCatured, okButtonText: "Ok"});
                  });
                });
              }
            }
            
          });
         
        },1000);

      }, (errorMessage) => {
        // console.log("No scan. " + errorMessage);
      }
    );
  }

  //Open Promotion
  public static onOpenPromotion(data: any) {

    let promotionsModel = PromotionsModel.singleton();

    promotionsModel.getPromotion((data.object as any).promotionId).then(result=>{

      (<any>result).hasMoreImages = result.slideImages.length > 3;
      (<any>result).moreImages = result.slideImages.length - 3;

      CardsPage.frame.present({
        moduleName: "pages/cards/promotions/details/details-page",
        context: result,
        transition: {
          name: "slideLeft"
        }
      });
    });
    
  }

  //Opne Card
  public static onOpenCard(data: any) {
    
    let bindingContext = Object.create(CardsPage.page.bindingContext) as CardsViewModel;

    for(let i = 0;i < bindingContext.cardsData.length;i++){

      let card = bindingContext.cardsData.getItem(i);
      if(card.id.trim() == (data.object as any).cardId.trim()){

        CardsPage.frame.present({
          moduleName: "pages/cards/details/details-page",
          context: Object.create(card),
          transition: {
            name: "slideLeft"
          }
        });
        break;
      }
    }
  }

  //Toggle menu state
  public static onToggleMenu(){

    CardsPage.sideMenu.toggleMenuState();
  }

  //Show Pormotions page
  public static onOpenPromotions() {

    CardsPage.frame.present({
      moduleName: "pages/cards/promotions/promotions-page",
      transition: {
        name: "slideLeft"
      },
      clearHistory: false
    });
  }

  //Show Login page
  public static onOpenLogin(){

    if(!applicationSettings.getString("userId")) {
      
      const showModalOptions: ShowModalOptions = {
        closeCallback: (result: any) => {},
        context: {},
        fullscreen: true
      };

      CardsPage.frame.showModal("pages/authentication/login/login-page", showModalOptions);
    }
  }

}

//Handlers exported to XML environment
export const onNavigatingTo = CardsPage.onNavigatingTo;
export const onLoaded = CardsPage.onLoaded;
export const onToggleMenu = CardsPage.onToggleMenu;
export const onReadQRCode = CardsPage.onReadQRCode;
export const onOpenPromotion = CardsPage.onOpenPromotion;
export const onOpenCard = CardsPage.onOpenCard;
export const onCardLoaded = MainPage.onRepeaterSetupBindingContext;
export const onOpenPromotions = CardsPage.onOpenPromotions;
export const getImage = General.setAndGetImageFromCache;
export const onOpenLogin = CardsPage.onOpenLogin;
