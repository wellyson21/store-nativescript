import { Page, View, ViewBase, EventData } from "tns-core-modules/ui/page/page";
import { action, ActionOptions } from "tns-core-modules/ui/dialogs";
import { ESFrame } from "~/pages/shared/utilities/esframe";
import { Repeater } from "tns-core-modules/ui/repeater/repeater";
import { General } from "~/pages/shared/utilities/general";
import { CartModel } from "../-models/cart-model";
import { Internationalization } from "~/pages/shared/utilities/internationalization";

class ProductOptionsPage {

  private static page: Page;
  private static frame: ESFrame;

  private static priceBase = (): number => {

    return ProductOptionsPage.page.bindingContext.priceBase;
  }

  private static priceTotal = (newValue: number = null): number => {

    if (newValue) {

      ProductOptionsPage.page.bindingContext.priceTotal = (newValue).toFixed(2);
    }

    return ProductOptionsPage.page.bindingContext.priceTotal;
  }

  private static quantityTotal = (): number => {

    return ProductOptionsPage.page.bindingContext.quantityTotal;
  }

  private static quantityChoice = (newValue: number = null): number => {

    if (newValue > 0 && newValue <= ProductOptionsPage.quantityTotal()) {
      
      const newPrice = (ProductOptionsPage.priceBase() * newValue);

      ProductOptionsPage.priceTotal(newPrice);
      ProductOptionsPage.page.bindingContext.quantityChoice = newValue;
    }

    return ProductOptionsPage.page.bindingContext.quantityChoice;
  }

  public static onLoaded(args: EventData) {

    const page = args.object as Page;

    ProductOptionsPage.page = page;
    ProductOptionsPage.frame = page.frame as ESFrame;

    ProductOptionsPage.onSetVariations();
  }

  public static onNavigatingTo(args: any) {
    //
  }

  public static onRadioButton(args: any) {

    const view = args.object as View;
    const itemId = args.object.itemId;
    const type = ProductOptionsPage.getParent(view, 4).type;

    ProductOptionsPage.onSetVariations(itemId, type);
  }

  public static onQuantityControl(args: any) {
    
    const mode = args.object.mode;
    let value = ProductOptionsPage.quantityChoice();
    
    if (mode === "increment") {

      ProductOptionsPage.quantityChoice(++value);
    } else if (mode === "decrement") {

      ProductOptionsPage.quantityChoice(--value);
    }

    ProductOptionsPage.page.bindingContext = Object.create(ProductOptionsPage.page.bindingContext);
  }

  public static onFinalize(args: any) {

    const navEntry: any = { moduleName: "", transition: { name: "slideLeft" } };
    const bindingContext = Object.create(ProductOptionsPage.page.bindingContext);
    const destiny = bindingContext.destiny;
    const inter = Internationalization.singleton().getData().store;
    const actionOptions: ActionOptions = {
      message: inter.addCartSuccessfully,
      actions: [inter.goToCart, inter.keepBuying]
    };
    
    if (destiny === "forCart") {

      CartModel.singleton().addItem({
        productId: ProductOptionsPage.page.bindingContext.data.id,
        quantity: ProductOptionsPage.quantityChoice()
      });
      
      action(actionOptions).then((result) => {
        if (result === inter.goToCart) {

          navEntry.moduleName = "pages/store/cart/cart-page";
          ProductOptionsPage.page.frame.goBack();
          ProductOptionsPage.frame.present(navEntry);
        } else if (result === inter.keepBuying) {

          ProductOptionsPage.page.frame.goBack();
        }
      });

    } else if (destiny === "forBuy") {

      navEntry.moduleName = "pages/store/confirmation/confirmation-page";
      navEntry.context = { destiny: "forBuy" , items: [
        {
          id: ProductOptionsPage.page.bindingContext.data.id,
          title: ProductOptionsPage.page.bindingContext.data.title,
          thumbnail: ProductOptionsPage.page.bindingContext.data.images[0],
          quantity: ProductOptionsPage.quantityChoice(),
          conbination: ProductOptionsPage.page.bindingContext.combination,
          priceBase: ProductOptionsPage.priceBase(),
          priceSubtotal: (ProductOptionsPage.priceBase() * ProductOptionsPage.quantityChoice()).toFixed(2),
          priceTotal: (ProductOptionsPage.priceBase() * ProductOptionsPage.quantityChoice()).toFixed(2)
        }
      ]};

      ProductOptionsPage.frame.present(navEntry);
    }
  }

  private static onSetVariations(itemId: number = null, type: string = null) {

    const repeater = ProductOptionsPage.page.getViewById("repeaterReference") as Repeater;
    const bindingContext = Object.create(ProductOptionsPage.page.bindingContext);
    const context: any = bindingContext.data;
    let combination: any = null;

    const hasVariations = (): boolean => {

      const count = context.variations ? Object.keys(context.variations).length : 0;

      return (count > 0 ? true : false);
    };

    if (hasVariations()) {

      const variations = context.variations;
      const valuesCombination = {};
      let valuesTypeTotal = 0;
      
      for (let i = 0; i < (<Array<any>>variations.options).length; i++) {

        let c = 0;

        for (let j = 0; j < (<Array<any>>variations.options[i].items).length; j++) {
          
          if (itemId == null && type == null) {

            context.variations.options[i].items[j].id = c++;
            context.variations.options[i].items[j].checked = (j === 0) ? true : null;

            if (j === 0) {

              valuesCombination[variations.options[i].type] = context.variations.options[i].items[j].value;
              valuesTypeTotal += 1;
            }
          } else {
            
            if (context.variations.options[i].type === type) {

              let value = null;
              if (context.variations.options[i].items[j].id === itemId) {

                value = true;
              }
              context.variations.options[i].items[j].checked = value;
            }

            if (context.variations.options[i].items[j].checked === true) {

              valuesCombination[variations.options[i].type] = context.variations.options[i].items[j].value;
              valuesTypeTotal += 1;
            }
          }
        }
      }

      combination_loop:
      for (let i = 0; i < (<Array<any>>variations.combinations).length; i++) {

        let isValidCombination = 0;
        
        for (const key in variations.combinations[i].values) {
          
          if (variations.combinations[i].values[key] === valuesCombination[key]) {
            isValidCombination++;
            
            if (isValidCombination === valuesTypeTotal) {
              combination = variations.combinations[i];
              break combination_loop;
            }
          } else {

            break;
          }
        }
      }
    }
    
    const obj: any = Object.create(ProductOptionsPage.page.bindingContext);

    if (hasVariations()) {

      obj.combination = combination;
      obj.quantityTotal = combination !== null ? combination.quantity : 0;
      obj.quantityChoice = combination !== null && combination.quantity > 0 ? 1 : 0;
      obj.priceBase = combination !== null ? combination.price : 0.00;
      obj.priceTotal = combination !== null ? combination.price : 0.00;
    } else {

      obj.quantityTotal = context.quantity;
      obj.quantityChoice = 1;
      obj.priceBase = context.price;
      obj.priceTotal = context.price;
    }

    ProductOptionsPage.page.bindingContext = obj;
    repeater.refresh();
  }

  private static getParent(view: View, level: number = 1): any {

    let currentParent: ViewBase = view;

    if (level > 0) {

      for (let i = 0; i < level; i++) {

        currentParent = currentParent.parentNode;
      }
    }

    return currentParent;
  }

}

exports.onLoaded = ProductOptionsPage.onLoaded;
exports.onNavigatingTo = ProductOptionsPage.onNavigatingTo;
exports.onRadioButton = ProductOptionsPage.onRadioButton;
exports.onQuantityControl = ProductOptionsPage.onQuantityControl;
exports.onFinalize = ProductOptionsPage.onFinalize;
exports.getImage = General.setAndGetImageFromCache;
