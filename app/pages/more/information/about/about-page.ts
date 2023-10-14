import { Page } from "tns-core-modules/ui/page";
import { EventData } from "tns-core-modules/data/observable";
import { Paralax } from "~/pages/shared/utilities/paralax";
import { AboutViewModel } from "./about-view-model";
import { Repeater } from "tns-core-modules/ui/repeater/repeater";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout/stack-layout";

class AboutPage {

  private static page: Page;
  private static interval: any;

  public static onPageLoaded(args: EventData) {

    const page = args.object as Page;
    const viewModel = new AboutViewModel();
   
    page.bindingContext = viewModel;
    AboutPage.page = page;
  }

  public static onScroll(args: any) {

    const paralax = new Paralax(AboutPage.page);
    paralax.active(args, { id: "actionBarTitle", valueStart: "", valueEnd: "Sobre Nós" });
  }

  public static natigatedFrom(){

  }

  public static onSectionLayout(data: EventData){

    let v = data.object as StackLayout;
    let htmlView = v.getViewById("htmlView");

    setTimeout((htmlView)=>{

      htmlView.requestLayout();
    },350,htmlView)
    return true;

  }

}

exports.onPageLoaded = AboutPage.onPageLoaded;
exports.onScroll = AboutPage.onScroll;
exports.natigatedFrom = AboutPage.natigatedFrom;
exports.onSectionLayout = AboutPage.onSectionLayout;

