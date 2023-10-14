import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";
import { Observable } from "tns-core-modules/ui/page/page";
import * as appSettings from "tns-core-modules/application-settings";

export class EProfile extends Observable implements IProfile {

  @ObservableProperty() public id: string;
  @ObservableProperty() public photo: string;
  @ObservableProperty() public name: string;
  @ObservableProperty() public email: string;
  @ObservableProperty() public password: string;
  @ObservableProperty() public phone?: string;
  @ObservableProperty() public address: IAddress;
  @ObservableProperty() public myPoints: number;
  @ObservableProperty() public capturePoints: number;

  constructor(data: IProfile = null) {
    super();

    this.photo = appSettings.getString("profilePhoto") ? appSettings.getString("profilePhoto") : "~/assets/images/account/placeholder-profile.png";

    if(data) {
      this.id = data.id;
      this.name = data.name;
      this.email = data.email;
      this.password = data.password;
      this.phone = data.phone;
      this.address = data.address;
      this.myPoints = data.myPoints;
      this.capturePoints = data.capturePoints;
    }    
  }

}

export class EAddress extends Observable implements IAddress {

  @ObservableProperty() public addressLine: string;
  @ObservableProperty() public city: string;
  @ObservableProperty() public state: string;
  @ObservableProperty() public postalCode: string;
  @ObservableProperty() public country: string;

  constructor(data: IAddress) {
    super();

    this.addressLine = data.local;
    this.city = data.city;
    this.state = data.state;
    this.postalCode = data.postalCode;
    this.country = data.country;
  }

}

export interface IProfile {
  id?: string;
  photo?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: any;
  myPoints?: number;
  capturePoints?: number;
}

export interface IAddress {
  local?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}
