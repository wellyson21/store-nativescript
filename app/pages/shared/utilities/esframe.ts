import { Page } from "tns-core-modules/ui/page/page";
import { NavigationButton } from "tns-core-modules/ui/action-bar/action-bar";
import * as frameModule from "tns-core-modules/ui/frame/frame";
import * as builder from "tns-core-modules/ui/builder";
import * as platform from "tns-core-modules/platform";

export class ESFrame extends frameModule.Frame {
  
  public push(pageModuleName: string) {

    if(platform.isAndroid){

      let page = builder.createViewFromEntry({
        moduleName: pageModuleName
      }) as Page;
  
      this.navigate({
        create: ()=>{
  
          let backButton = new NavigationButton();
          backButton.android.systemIcon = "ic_menu_back";
          page.actionBar.navigationButton = backButton;
          page.actionBar.navigationButton.on("tap",(data)=>{
  
            this.goBack();
          });
          return page;
        }
      });
    }else{

      this.navigate(pageModuleName);
    }
  }
  
  public present(entry: frameModule.NavigationEntry){

    if(platform.isAndroid){

      let clearHistory = entry.clearHistory !== undefined ? entry.clearHistory : false;
      let backStackVisible = entry.backstackVisible !== undefined ? entry.backstackVisible : true;

      if(!clearHistory && backStackVisible){

        let page = builder.createViewFromEntry({
          moduleName: entry.moduleName
        }) as Page;

        entry.moduleName = undefined;
        entry.create = ()=>{

          let backButton = new NavigationButton();
          backButton.android.systemIcon = "ic_menu_back";
          page.actionBar.navigationButton = backButton;
          page.actionBar.navigationButton.on("tap",(data)=>{
            
            this.goBack();
          });
          return page;
        }

        this.navigate(entry);
      }else{

        this.navigate(entry);
      }
    }else{

      this.navigate(entry);
    }
  }

}
