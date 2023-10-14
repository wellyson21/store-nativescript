import { Observable } from "tns-core-modules/ui/page/page";
import { IAddress } from "./profile";

interface ICoordenates{
  latitude: number;
  longitude: number;
}

export interface IContacts{
  facebook?: string;
  instagram?: string;
  twiter?: string;
  phone?: string;
  email?: string;
}

export interface IAddress{
  country?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  line: string;
}

export class EEStablishment extends Observable{
 
  id: string;
  address: IAddress;
  position: ICoordenates;
  contacts: IContacts;
  mainImage: string;
  slideImages?: Array<string>;
  name: string;

  constructor(data?: any){
    super();

    if(data !== undefined){

      this.name = data.name;
      this.address = data.address;
      this.position = data.position;
      this.contacts = data.contacts;
      this.mainImage = data.mainImage;
      this.slideImages = data.slideImages;
    }
  }


}

export interface IEstablishment{
  id?: string;
  address?: IAddress;
  position?: ICoordenates;
  contacts?: IContacts;
  mainImage?: string;
  slideImages?: Array<string>;
  name?: string;
}