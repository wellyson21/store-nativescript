import { CustomMenu } from "~/pages/shared/components/menu/custom-menu";
import { Page, View, EventData } from "tns-core-modules/ui/page/page";
import { CardsPage } from "~/pages/cards/main/cards-page";
import { TicketsViewModel } from "./tickets-view-model";
import { BarcodeScanner } from "nativescript-barcodescanner";
import { PromotionsModel } from "../-models/promotions-model";
import { ESFrame } from "~/pages/shared/utilities/esframe";
import { TicketsModel } from "../-models/tickets-model";
import { ScrollView } from "tns-core-modules/ui/scroll-view/scroll-view";
import { MainPage } from "~/pages/main/main-page";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { General } from "~/pages/shared/utilities/general";
import  * as plaform from "tns-core-modules/platform";
import { CustomTabView } from "~/pages/shared/components/tabview/custom-tab-view";
import { Internationalization } from "~/pages/shared/utilities/internationalization";
import * as dialogs from "tns-core-modules/ui/dialogs/dialogs";


class TicketsPage{

  public static page: Page;
  public static sideMenu: CustomMenu;

  public static onNavigatingTo(args: EventData){

    const page = args.object as Page;
    const sideMenu = page.layoutView.getViewById("custom-menu") as CustomMenu;

    TicketsPage.sideMenu = sideMenu;
    TicketsPage.page = page;

    sideMenu.setup(__filename);
    CardsPage.settingSideMenu(sideMenu);
  }

  public static onLoaded(args: EventData){

    const page = args.object as Page;
    const sideMenu = page.layoutView.getViewById("custom-menu") as CustomMenu;
    page.bindingContext = new TicketsViewModel();

  }

  //Toggle Menu state
  public static onToggleMenu(){

    TicketsPage.sideMenu.toggleMenuState();
  }

  //Make low in ticket
  public static onReadQRCode(data: EventData){

    let barcodescanner = new BarcodeScanner();
    let view = (data.object as View);
    let containerMain = TicketsPage.sideMenu.getViewById("container-main") as ScrollView;

    let iosf;
    let f = TicketsPage.page.frame;

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
      beepOnScan: true,             // Play or Suppress beep on scan (default true)
      torchOn: false,               // launch with the flashlight on (default false)
      closeCallback: () => {

        if(plaform.isIOS){
          
          setTimeout(()=>{

            TicketsPage.page.frame.ios.controller.view.frame = iosf;                  
          },500);
        }
       },
      resultDisplayDuration: 500,   // Android only, default 1500 (ms), set to 0 to disable echoing the scanned text
      // orientation: orientation,     // Android only, default undefined (sensor-driven orientation), other options: portrait|landscape
      openSettingsIfPermissionWasPreviouslyDenied: true // On iOS you can send the user to the settings app if access was previously denied
    }).then((result) => {
      
        setTimeout(()=>{

          let it = Internationalization.singleton().getData();
           // let result = {text: "ticket/down"};
          let routeArr = result.text.trim().split("/");
          if(routeArr.length === 2 && routeArr[0].toLowerCase() === "ticket" && routeArr[1].toLowerCase() === "down"){

            let ticketsModel = TicketsModel.singleton();
            ticketsModel.removeTicket((view as any).ticketId).then(status=>{

              if(status){

                let viewModel = (TicketsPage.page.bindingContext as TicketsViewModel);
                for(let i = 0; i < viewModel.ticketsData.length;i++){

                  let ticket = (viewModel.ticketsData as ObservableArray<any>).getItem(i);
                  if(ticket.id.trim() == (view as any).ticketId.trim()){

                    (viewModel.ticketsData as ObservableArray<any>).splice(i,1);
                    if((viewModel.ticketsData as ObservableArray<any>).length === 0){

                      viewModel.haveDataToDisplay = false;
                    }
                  }
                }

                dialogs.alert({title: "",message: it.cards.alerts.ticketDown, okButtonText: "Ok"});
              }else{

                dialogs.alert({title: "",message: it.cards.alerts.ticketNotDown, okButtonText: "Ok"});
              }
            }).catch(()=>{

              dialogs.alert({title: "",message: it.cards.alerts.ticketNotDown, okButtonText: "Ok"});
            });
          }else{

            dialogs.alert({title: "",message: it.cards.alerts.ticketNotDown, okButtonText: "Ok"});
          }
        },1200);
      }, (errorMessage) => {
        // console.log("No scan. " + errorMessage);
      }
    );


  }

  //Open Promotion
  public static onOpenPromotion(data: EventData){

    let view = (data.object as any);
    let promotionsModel = PromotionsModel.singleton();
    promotionsModel.getPromotion(view.promotionId).then(promotionData=>{

      if(promotionData != undefined){

        (TicketsPage.page.frame as ESFrame).present({
          moduleName: "pages/cards/promotions/details/details-page",
          context: promotionData
        });
      }
    });
  }
   
}

exports.onNavigatingTo = TicketsPage.onNavigatingTo;
exports.onLoaded = TicketsPage.onLoaded;
exports.onToggleMenu = TicketsPage.onToggleMenu;
exports.onReadQRCode = TicketsPage.onReadQRCode;
exports.onOpenPromotion = TicketsPage.onOpenPromotion;
exports.onTicketLoaded = MainPage.onRepeaterSetupBindingContext;
exports.getImage = General.setAndGetImageFromCache;
