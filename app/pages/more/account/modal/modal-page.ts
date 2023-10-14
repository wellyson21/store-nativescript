import { Page, View } from "tns-core-modules/ui/page";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { TextField } from "tns-core-modules/ui/text-field/text-field";
import * as dialogs from "tns-core-modules/ui/dialogs/dialogs";

export class ModalPage {

  private static page: Page;
  private static closeCallback: any;

  public static onShownModally(args: any) {

    const page = args.object as Page;
    const context = args.context;

    page.bindingContext = fromObject(context);

    ModalPage.page = page;
    ModalPage.closeCallback = args.closeCallback;

    (page.layoutView.getViewById("main-container")as View).opacity = 1;
  }

  public static onSave() {

    const context = ModalPage.page.bindingContext;
    let result: any;

    if(ModalPage.page.bindingContext.editAddress) {

      result = {
        addressLine: ModalPage.page.bindingContext.data.profile.address.addressLine,
        city: ModalPage.page.bindingContext.data.profile.address.city,
        state: ModalPage.page.bindingContext.data.profile.address.state,
        country: ModalPage.page.bindingContext.data.profile.address.country,
        postalCode: ModalPage.page.bindingContext.data.profile.address.postalCode,
      };

    } else if (ModalPage.page.bindingContext.editPassword) {

      result = {
        currentPassword: (ModalPage.page.layoutView.getViewById("currentPassword") as TextField).text.trim(),
        newPassword: (ModalPage.page.layoutView.getViewById("newPassword") as TextField).text.trim(),
        confirmPassword: (ModalPage.page.layoutView.getViewById("confirmPassword") as TextField).text.trim()
      };

      if(!result.currentPassword || !result.newPassword || !result.confirmPassword){
      
        dialogs.alert({title: "",message: "Please fill all fields!", okButtonText: "Ok"});
        return;
      }

      if(result.currentPassword !== ModalPage.page.bindingContext.data.profile.password){

        dialogs.alert({title: "",message: "Current password is wrong!", okButtonText: "Ok"});
        return;
      }

      if(result.newPassword !== result.confirmPassword){

        dialogs.alert({title: "",message: "Passwords no are same!", okButtonText: "Ok"});
        return;
      }
    }

    ModalPage.closeCallback(result);
  }

  public static onClose(){

    ModalPage.page.closeModal();
  }

}

export const onShownModally = ModalPage.onShownModally;
export const onSave = ModalPage.onSave;
export const onClose = ModalPage.onClose;
