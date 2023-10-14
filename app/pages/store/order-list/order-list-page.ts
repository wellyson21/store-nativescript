import { Page, EventData } from "tns-core-modules/ui/page/page";
import { ESFrame } from "~/pages/shared/utilities/esframe";
import { OrderListViewModel } from "./order-list-view-model";
import { MainPage } from "~/pages/main/main-page";
import { Internationalization } from "~/pages/shared/utilities/internationalization";
import { OrderListModel } from "../-models/order-list-model";

class OrderListPage {

  private static page: Page;
  private static frame: ESFrame;

  public static onLoaded(args: EventData) {

    const page = args.object as Page;
    const frame = page.frame as ESFrame;
    const viewModel = new OrderListViewModel();

    page.bindingContext = viewModel;

    OrderListPage.page = page;
    OrderListPage.frame = frame;
  }

  public static onNavigatingTo() {
    //
  }
 
  public static removeOrder(data: EventData){

    let view = (data.object as any);
    let bc = (OrderListPage.page.bindingContext as OrderListViewModel);
    let length = bc.listItems.length;

    for(let i = 0; i < length;i++){
      let item = bc.listItems.getItem(i);
      if(item.id.trim() == view.orderId.trim()){

        OrderListModel.singleton().removeOrder(view.orderId.trim());
        bc.listItems.splice(i,1);
        OrderListModel.singleton().removedData.set("length",length - 1);
        break;
      }
    }
  }

  public static onOpenOrderDetails(data: EventData){

    if((data.object as any).items.length > 0){

      (OrderListPage.page.frame as ESFrame).present({
         animated: true,
         bindingContext: {items: (data.object as any).items, internationalization: Internationalization.singleton().getData()} ,
         moduleName: "pages/store/order-list/details/details-page"
      });
    }
  }

  public static onLogin() {

    OrderListPage.frame.showModal("pages/authentication/login/login-page", {
      closeCallback: null,
      context: {},
      fullscreen: true
    });
  }

}

export const onLoaded = OrderListPage.onLoaded;
export const onNavigatingTo = OrderListPage.onNavigatingTo;
export const onOrderLoaded = MainPage.onRepeaterSetupBindingContext;
export const onOpenOrderDetails = OrderListPage.onOpenOrderDetails;
export const onLogin = OrderListPage.onLogin;
export const removeOrder = OrderListPage.removeOrder;
