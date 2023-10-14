import { Page, EventData, bindingContextProperty, View, Observable } from "tns-core-modules/ui/page/page";
import { ESFrame } from "~/pages/shared/utilities/esframe";
import { CartViewModel } from "./cart-view-model";
import { Repeater } from "tns-core-modules/ui/repeater/repeater";
import { ViewManipulation } from "~/pages/shared/utilities/view-manipulation";
import { MainPage } from "~/pages/main/main-page";
import { CartModel } from "../-models/cart-model";

class CartPage {

  private static page: Page;
  private static frame: ESFrame;

  private static priceTotal = (update: boolean = false): number => {

    if (update) {

      const items = CartPage.page.bindingContext.cartItems;
      let priceTotal : number = 0;

      items.forEach((item) => {
        priceTotal += ( parseFloat(item.product.price) * parseFloat(item.quantity) );
      });

      CartPage.page.bindingContext.priceTotal = priceTotal.toFixed(2);

      return priceTotal;
    }

    return ( CartPage.page.bindingContext.priceTotal ).toFixed(2);
  }

  private static quantity = (index: number, quantity: number = null): number => {

    if (quantity > 0 && quantity <= CartPage.page.bindingContext.cartItems.getItem(index).product.quantity) {
      
      const priceBase = CartPage.page.bindingContext.cartItems.getItem(index).product.price;
      const priceSend = CartPage.page.bindingContext.cartItems.getItem(index).priceSend;

      CartPage.page.bindingContext.cartItems.getItem(index).priceSubtotal = ( priceBase * quantity ).toFixed(2);
      CartPage.page.bindingContext.cartItems.getItem(index).priceTotal = ( priceBase * quantity ).toFixed(2);

      CartPage.page.bindingContext.cartItems.getItem(index).quantity = quantity;

      CartPage.page.bindingContext.updateItem(index, CartPage.page.bindingContext.cartItems.getItem(index));

      CartPage.priceTotal(true);
    }

    return CartPage.page.bindingContext.cartItems.getItem(index).quantity;
  }

  public static onLoaded(args: EventData) {

    const page = args.object as Page;
    const viewModel = new CartViewModel();

    page.bindingContext = viewModel; 
    
    CartPage.page = page;
    CartPage.frame = page.frame as ESFrame;

    CartModel.singleton().isFinishedQuest.on("propertyChange", () => {
      
      if(viewModel.cartItems && (<Array<any>>viewModel.cartItems).length > 0) {
        CartPage.settingIntialValues();
      }
    });
  }

  public static onNavigatingTo() {
    //
  }

  public static onRemoveItem(args: any) {
    
    const itemId = args.object.itemId;
    const repeater = CartPage.page.getViewById("repeaterCartItems") as Repeater;

    CartPage.page.bindingContext.deleteItem(itemId, () => {
      CartPage.priceTotal(true);
    });

    repeater.refresh();
  }

  public static onQuantityControl(args: any) {
    
    const view = args.object as View;
    const mode = args.object.mode;
    const itemId = ViewManipulation.getParent(view, 2).itemId;
    const repeater = CartPage.page.getViewById("repeaterCartItems") as Repeater;

    let value = CartPage.quantity(itemId);

    if (mode === "increment") {

      CartPage.quantity(itemId, ++value);
    } else if (mode === "decrement") {

      CartPage.quantity(itemId, --value);
    }
    
    repeater.refresh();
  }
  
  public static onShowDetails() {
    //
  }

  public static onBuy() {

    CartPage.frame.present({
      moduleName: "pages/store/confirmation/confirmation-page",
      context: {
        items: CartPage.page.bindingContext
      }
    });
  }

  private static settingIntialValues() {
    
    const bindingContext = CartPage.page.bindingContext;
    const items = bindingContext.cartItems;

    let priceTotal: number = 0;

    if((<Array<any>>items).length > 0) {

      items.forEach((item) => {

        priceTotal += parseFloat(item.priceTotal);
      });
    }

    bindingContext.priceTotal = ( priceTotal ).toFixed(2);
  }

}

exports.onLoaded = CartPage.onLoaded;
exports.onNavigatingTo = CartPage.onNavigatingTo;
exports.onRemoveItem = CartPage.onRemoveItem;
exports.onQuantityControl = CartPage.onQuantityControl;
exports.onBuy = CartPage.onBuy;
exports.onShowDetails = CartPage.onShowDetails;
exports.onCartItemLoaded = MainPage.onRepeaterSetupBindingContext;
