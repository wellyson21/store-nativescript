import { Page, View } from "tns-core-modules/ui/page";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { TextField } from "tns-core-modules/ui/text-field/text-field";
import * as dialogs from "tns-core-modules/ui/dialogs/dialogs";

export class UpdateApp {

  private static page: Page;
  private static closeCallback: any;

  public static onShownModally(args: any) {

    const page = args.object as Page;
    const context = args.context;

    page.bindingContext = fromObject(context);

    UpdateApp.page = page;
    UpdateApp.closeCallback = args.closeCallback;
  }
}

export const onShownModally = UpdateApp.onShownModally;
