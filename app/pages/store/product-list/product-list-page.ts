import { Page, EventData } from "tns-core-modules/ui/page/page";
import { ESFrame } from "~/pages/shared/utilities/esframe";
import { ProductListViewModel } from "./product-list-view-model";

class ProductListPage {

  private static page: Page;
  private static frame: ESFrame;

  public static onLoaded(args: EventData) {

    const page = args.object as Page;
    const obj = Object.create(page.bindingContext);
    const viewModel = Object.create(new ProductListViewModel(obj.categoryId));
    viewModel.pageTitle = obj.pageTitle;

    setTimeout(() => {
      page.bindingContext = viewModel;
    }, 1000);

    ProductListPage.page = page;
    ProductListPage.frame = page.frame as ESFrame;
  }

  public static onNavigatingTo(args: EventData) {
    //
  }

}

exports.onLoaded = ProductListPage.onLoaded;
exports.onNavigatingTo = ProductListPage.onNavigatingTo;
