import { Page, EventData } from "tns-core-modules/ui/page/page";
import { ESFrame } from "~/pages/shared/utilities/esframe";
import { ProductCategoriesViewModel } from "./product-categories-view-model";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { General } from "~/pages/shared/utilities/general";

class ProductCategoriesPage {

  private static page: Page;
  private static frame: ESFrame;

  public static onLoaded(args: EventData) {

    const page = args.object as Page;
    const viewModel = new ProductCategoriesViewModel();

    page.bindingContext = viewModel;
    
    ProductCategoriesPage.page = page;
    ProductCategoriesPage.frame = page.frame as ESFrame;
  }

  public static onNavigatingTo() {
    //
  }

  public static onOpenProducts(args: any) {

    const categoryData = args.object.categoryData;

    ProductCategoriesPage.frame.present({
      moduleName: "pages/store/product-list/product-list-page",
      transition: {
        name: "slideLeft"
      },
      bindingContext: {
        pageTitle: categoryData.name,
        categoryId: categoryData.id
      }
    });
  }

}

exports.onLoaded = ProductCategoriesPage.onLoaded;
exports.onNavigatingTo = ProductCategoriesPage.onNavigatingTo;
exports.onOpenProducts = ProductCategoriesPage.onOpenProducts;
exports.getImage = General.setAndGetImageFromCache;
