import { View, ViewBase } from "tns-core-modules/ui/page/page";

export class ViewManipulation {

  public static getParent(view: View, level: number = 1): any {

    let currentParent: ViewBase = view;

    if (level > 0) {

      for (let i = 0; i < level; i++) {

        currentParent = currentParent.parentNode;
      }
    }

    return currentParent;
  }

}
