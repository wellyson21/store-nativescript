import { ESFrame } from "~/pages/shared/utilities/esframe";
import { View, Page } from "tns-core-modules/ui/page/page";
import { ViewManipulation } from "~/pages/shared/utilities/view-manipulation";
import { MainViewModel } from "../../main/main-view-model";
import { Internationalization } from "~/pages/shared/utilities/internationalization";

export class StoreAssistant {
  
  private static frame = (args: any): ESFrame => {

    return (<ESFrame>(args.object.page as Page).frame);
  };

  private static navEntry: any = { moduleName: "", transition: { name: "slideLeft" } };

  public static onOpenCart(args: any) {

    StoreAssistant.navEntry.moduleName = "pages/store/cart/cart-page";
    StoreAssistant.frame(args).present(StoreAssistant.navEntry);
  }

  public static onOpenOrderList(args: any) {

    StoreAssistant.navEntry.moduleName = "pages/store/order-list/order-list-page";
    StoreAssistant.frame(args).present(StoreAssistant.navEntry);
  }

  public static onOpenProductCategories(args: any) {

    StoreAssistant.navEntry.moduleName = "pages/store/product-categories/product-categories-page";
    StoreAssistant.frame(args).present(StoreAssistant.navEntry);
  }
  
  public static onOpenProductSearch(args: any) {

    StoreAssistant.navEntry.moduleName = "pages/store/product-search/product-search-page";
    StoreAssistant.frame(args).present(StoreAssistant.navEntry);
  }

  public static onOpenProductDetails(args: any) {

    const productData = args.object.productData;

    StoreAssistant.navEntry.moduleName = "pages/store/product-details/product-details-page";
    StoreAssistant.navEntry.bindingContext = { data: productData, internationalization: Internationalization.singleton().getData(), countCartItems: (new MainViewModel(false)).countCartItems };
    StoreAssistant.frame(args).present(StoreAssistant.navEntry);
  }

  public static onOpenProductOptions(args: any) {
    
    const view = args.object as View;
    const mode = args.object.mode;

    const productData = (): any => {

      const level1 = (ViewManipulation.getParent(view, 1)).productData;
      const level4 = (ViewManipulation.getParent(view, 4)).productData;
      
      return (level1 ? level1 : level4);
    };

    StoreAssistant.navEntry.moduleName = "pages/store/product-options/product-options-page";
    StoreAssistant.navEntry.bindingContext =  { data: productData(), destiny: mode, internationalization: Internationalization.singleton().getData() };
    StoreAssistant.frame(args).present(StoreAssistant.navEntry);
  }

}
