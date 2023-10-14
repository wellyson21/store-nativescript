import { Page, ShowModalOptions } from "tns-core-modules/ui/page";
import { EventData } from "tns-core-modules/data/observable";
import { AccountViewModel } from "./account-view-model";
import { ImageSource } from "tns-core-modules/image-source";
import * as fileSystem from "tns-core-modules/file-system";
import * as imagePicker from "nativescript-imagepicker";
import * as appSettings from "tns-core-modules/application-settings";
import { ImageAsset } from "tns-core-modules/image-asset/image-asset";
import * as builder from "tns-core-modules/ui/builder/builder";
import { AccountModel } from "../-models/account-model";
import { CustomTabView } from "~/pages/shared/components/tabview/custom-tab-view";
import * as platform from "tns-core-modules/platform";
import { General } from "~/pages/shared/utilities/general";

class AccountPage {

  private static page: Page;

  public static onPageLoaded(args: EventData) {

    const page = args.object as Page;
    const viewModel = new AccountViewModel();

    page.bindingContext = viewModel;
    AccountPage.page = page;

  }

  public static onChoosePhoto(args: any) {

    const context = imagePicker.create({ mode: "single" });

    context.authorize().then(() => {

      return context.present();
    }).then((selection) => {

      selection.forEach((item) => {

        const source = new ImageSource();
        source.fromAsset(item).then((imageSource: ImageSource) => {

          const time = (new Date()).getTime();
          const folderPath: string = fileSystem.knownFolders.documents().path;
          const filePath = fileSystem.path.join(folderPath, `${time}.png`);
          const saved: boolean = imageSource.saveToFile(filePath, "png");

          if (saved) {

            appSettings.setString("profilePhoto", filePath);
            AccountPage.page.bindingContext.profile.photo = filePath;
            AccountPage.page.bindingContext.notifyPropertyChange("profile",AccountPage.page.bindingContext.profile);
          }
        });
      });
    });
    
  }

  public static onOpenModal(args: any) {

    const view = builder.createViewFromEntry({
      moduleName: "pages/more/account/modal/modal-page"
    });

    const command: string = args.object.command;
    let context = {
      data: AccountPage.page.bindingContext
    };

    switch (command) {
      case "editAddress":

        context["editAddress"] =  true;
        break;
      case "editPhone":
        
        context["editPhone"] = true;
        break;
      case "editPassword":

        context["editPassword"] = true;
        break;
    }

    let beforeFrame = platform.isIOS ? AccountPage.page.frame.ios.controller.view.frame : undefined;
    let modalOptions: ShowModalOptions = {
      context: context,
      fullscreen: true,
      closeCallback: (result)=>{

        if(platform.isIOS){

          AccountPage.page.frame.ios.controller.view.frame = beforeFrame;
        }
        if (result != undefined) {

          if(context["editPassword"]){

            AccountModel.singleton().updateProfile(result.newPassword,"password");
          }else if(context["editAddress"]){

            AccountModel.singleton().updateProfile(result,"address");

            let p = AccountPage.page.bindingContext.profile;
            AccountViewModel.checkIfHasData(p,AccountPage.page.bindingContext);
            AccountPage.page.bindingContext.notifyPropertyChange("profile",p);
          }
        }
      }
    }
    AccountPage.page.showModal(view, modalOptions)
  }

}

export const onPageLoaded = AccountPage.onPageLoaded;
export const onChoosePhoto = AccountPage.onChoosePhoto;
export const onOpenModal = AccountPage.onOpenModal;