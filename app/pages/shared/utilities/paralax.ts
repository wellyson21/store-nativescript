import { Page } from "tns-core-modules/ui/page/page";
import { ScrollEventData } from "tns-core-modules/ui/scroll-view/scroll-view";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout/stack-layout";
import { Label } from "tns-core-modules/ui/label/label";

export class Paralax {

  private page: Page;

  constructor(page: Page) {
    
    this.page = page;
  }

  public active(args: any, actionBarSettings: object = null){

    const event = args as ScrollEventData;
    const header = this.page.getViewById("container-scrolling") as StackLayout;
    
    if (event.scrollY < header.height) {
      const offset = event.scrollY / 2;

      if (args.ios) {
        header.animate({ translate: { x: 0, y: offset } });
      } else {
        header.translateY = Math.floor(offset);
      }
      
      this.changeActionBarTitle("start", actionBarSettings);
    } else {

      this.changeActionBarTitle("end", actionBarSettings);
    }

  }

  private changeActionBarTitle(position: string, actionBarSettings: any) {

    if (actionBarSettings != null) {

      const actionBarLabel = this.page.getViewById(actionBarSettings.id) as Label;

      switch (position) {
        case "start":
          actionBarLabel.text = actionBarSettings.valueStart;
          break;
        case "end":
          actionBarLabel.text = actionBarSettings.valueEnd;
          break;
      }
    }
  }

}
