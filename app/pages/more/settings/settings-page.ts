import { Page } from "tns-core-modules/ui/page";
import { EventData, fromObject } from "tns-core-modules/data/observable";
import { ListPicker } from "tns-core-modules/ui/list-picker";

class SettingsPage {

  public static page: Page;

  public static onPageLoaded(args: EventData) {

    const page = args.object as Page;

    SettingsPage.page = page;
  }

  public static onNavigatingTo(args: EventData) {

    const page = <Page>args.object;
    const vm = fromObject({
        items: [
            { id: 1, name: "Portuguese", role: "pt-BR" },
            { id: 2, name: "English", role: "en" },
            { id: 3, name: "Spanish", role: "es" }
        ],
        index: 1
    });

    page.bindingContext = vm;
  }

  public static onListPickerLoaded(args: EventData) {

    const listPicker = <ListPicker>args.object;
    const vm = listPicker.page.bindingContext;

    listPicker.on("selectedIndexChange", () => {
        vm.set("index", listPicker.selectedIndex);
        console.log(`ListPicker selected value: ${(<any>listPicker).selectedValue}`);
        console.log(`ListPicker selected index: ${listPicker.selectedIndex}`);
    });
  }

}

exports.onPageLoaded = SettingsPage.onPageLoaded;
exports.onNavigatingTo = SettingsPage.onNavigatingTo;
exports.onListPickerLoaded = SettingsPage.onListPickerLoaded;
