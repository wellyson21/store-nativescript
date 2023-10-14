import { Page } from "tns-core-modules/ui/page";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { WebView, LoadEventData } from "tns-core-modules/ui/web-view";

export class Browser {

  private static page: Page;
  private static closeCallback: any;

  public static onShownModally(args: any) {

    const context = args.context;
    context.isLoading = true;

    const page = args.object as Page;
    page.bindingContext = fromObject(context);   

    Browser.page = page;
    Browser.closeCallback = args.closeCallback;
  }

  public static onWebViewLoaded(webargs: any) {

    const webview: WebView = <WebView> webargs.object;

    webview.on(WebView.loadFinishedEvent, (args: LoadEventData) => {
      
      Browser.page.bindingContext.isLoading = false;
    });
  }

  public static onClose() {

    const response = {}

    Browser.closeCallback(response);
  }

}

exports.onShownModally = Browser.onShownModally;
exports.onWebViewLoaded = Browser.onWebViewLoaded;
exports.onClose = Browser.onClose;
