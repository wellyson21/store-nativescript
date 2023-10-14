import { Page, ShowModalOptions } from "tns-core-modules/ui/page";
import { EventData } from "tns-core-modules/data/observable";
import { Paralax } from "~/pages/shared/utilities/paralax";
import { alert } from "tns-core-modules/ui/dialogs";
import { CustomTabView } from "~/pages/shared/components/tabview/custom-tab-view";
import * as builder from "tns-core-modules/ui/builder";
import * as Utils from "tns-core-modules/utils/utils";
import { General } from "~/pages/shared/utilities/general";

class LocationPage {

  private static page: Page;

  public static onPageLoaded(args: EventData) {

    const page = args.object as Page;
    LocationPage.page = page;
    page.bindingContext = page.navigationContext;
  }

  public static onScroll(args: any) {

    const paralax = new Paralax(LocationPage.page);

    paralax.active(args, { id: "actionBarTitle", valueStart: "", valueEnd: LocationPage.page.bindingContext.data.name });
  }

  public static onMapReady(args) {
    // var mapView = (args.object as mapsModule.MapView);
    // let it = setInterval(()=>{

    //   if(LocationPage.page.bindingContext.data != undefined){

    //     var marker = new mapsModule.Marker();
    //     marker.position = mapsModule.Position.positionFromLatLng(LocationPage.page.bindingContext.data.position.latitude, LocationPage.page.bindingContext.data.position.longitude);
    //     marker.userData = { index : 1};
    //     mapView.zoom = 25;
    //     mapView.addMarker(marker);
    //     clearInterval(it);
    //   }
    // },0);

  }

  //Open Image Viewer
  public static onOpenImage(args: any) {

    const index = args.object.index;
    const modalModuleName = "pages/shared/components/image-viewer/image-viewer-page";
    const fullscreen = true;
    const context = {
      index: index,
      images: LocationPage.page.bindingContext.data.slideImages
    };

    CustomTabView.getMainFrame().showModal(modalModuleName, context, null, fullscreen);
  }

  //Open Contact
  public static openContact(data: EventData){

    if((data.object as any).url != undefined){

      let url = (data.object as any).type == "whatsapp" ? "https://api.whatsapp.com/send?phone=" + (data.object as any).url : (data.object as any).url;
      Utils.openUrl(url);
    }    
    
  }

}

exports.onPageLoaded = LocationPage.onPageLoaded;
exports.onScroll = LocationPage.onScroll;
exports.onMapReady = LocationPage.onMapReady;
exports.onOpenImage = LocationPage.onOpenImage;
exports.openContact = LocationPage.openContact;
exports.setHeightImage = General.setHeightImage;
exports.getImage = General.setAndGetImageFromCache;
