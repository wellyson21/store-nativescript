import { Observable } from "tns-core-modules/ui/page/page";

export class ESettings extends Observable{

  public paypal = new class{
    clientId: string;
    appSecret: string;
    currency = new class{
      name: string;
      symbol: string;
    };   
  };

  public serverUrl: string;
  public notificationsKey: string;

  public version = new class{
    android = new class{
      value: number;
      requestUpdate: boolean;
    };  
    ios = new class{
      value: number;
      requestUpdate: boolean;
    };  
  }; 

}