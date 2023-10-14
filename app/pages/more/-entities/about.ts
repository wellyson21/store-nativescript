import { Observable } from "tns-core-modules/data/observable/observable";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";

export class EAboutSection extends Observable implements IAboutSection {

  @ObservableProperty() public title: string;
  @ObservableProperty() public description: string;

  constructor(data: IAboutSection = null) {
    super();

    if (data) {

      this.title = data.title;
      this.description = data.description;
    }
  }

}

export interface IAboutSection {
  title: string;
  description: string;
}
