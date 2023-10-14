import { Page, EventData } from "tns-core-modules/ui/page/page";
import { ESFrame } from "~/pages/shared/utilities/esframe";
import { TextField } from "tns-core-modules/ui/text-field";
import { ProductSearchViewModel } from "./product-search-view-model";

class ProductSearchPage {

  private static page: Page;
  private static frame: ESFrame;

  public static onLoaded(args: EventData) {

    const page = args.object as Page;
    const viewModel = new ProductSearchViewModel();
    
    page.bindingContext = viewModel;
    
    ProductSearchPage.page = page;
    ProductSearchPage.frame = page.frame as ESFrame;
  }

  public static onNavigatingTo() {
    //
  }

  public static onSearchSubmit(args: any) {
 
    const searchField = ProductSearchPage.page.getViewById("searchField") as TextField;    
    const text = searchField.text;

    if(args.object.id == "searchButton") {

      setTimeout(() => {        
        searchField.dismissSoftInput();
      }, 100);
    }

    if(text != "") {

      const result = ProductSearchPage.page.bindingContext.search(text);

      if(result > 0) {
        //
      } else {
        //
      }
    } 
  }

  public static onSearchClear() {

    const searchField = ProductSearchPage.page.getViewById("searchField") as TextField;
    searchField.text = "";

    ProductSearchPage.page.bindingContext.searchClear();    
  }

}

exports.onLoaded = ProductSearchPage.onLoaded;
exports.onNavigatingTo = ProductSearchPage.onNavigatingTo;
exports.onSearchSubmit = ProductSearchPage.onSearchSubmit;
exports.onSearchClear = ProductSearchPage.onSearchClear;
