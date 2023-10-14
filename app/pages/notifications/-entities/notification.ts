import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";
import { Observable } from "tns-core-modules/data/observable";

export class ENotification extends Observable implements INotification {

  @ObservableProperty() public id: string;
  @ObservableProperty() public category: INotificationCategory;
  @ObservableProperty() public thumbnail: string;
  @ObservableProperty() public title: string;
  @ObservableProperty() public subtitle: string;
  @ObservableProperty() public message: string;
  @ObservableProperty() public images: string;
  @ObservableProperty() public date: string;

  constructor(data: INotification) {
    super();

    this.id = data.id;
    this.category = data.category;
    this.thumbnail = data.thumbnail;
    this.title = data.title;
    this.subtitle = data.subtitle;
    this.message = data.message;
    this.images = data.images;
    this.date = data.date;
  }

}

export class ENotificationCategory extends Observable implements INotificationCategory {

  @ObservableProperty() public id: string;
  @ObservableProperty() public name: string;

  constructor(data: INotificationCategory) {
    super();

    this.id = data.id;
    this.name = data.name;
  }

}

export interface INotification {
  id: string;
  category: INotificationCategory;
  thumbnail: string;
  title: string;
  subtitle: string;
  message: string;
  images: string;
  date: string;
}

export interface INotificationCategory {
  id: string;
  name: string;
}
