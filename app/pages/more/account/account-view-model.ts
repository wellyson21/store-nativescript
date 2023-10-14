import { Observable, fromObject } from "tns-core-modules/data/observable";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";
import { AccountModel } from "../-models/account-model";
import { Internationalization } from "~/pages/shared/utilities/internationalization";
import { EAddress } from "../-entities/profile";

export class AccountViewModel extends Observable {

  private _internationalization: any;

  private _profile: any; 


  constructor() {
    super();
      
    this.getProfile();
    this.getInternationalization();
  }

  @ObservableProperty() hasData = true;

  get internationalization(): any {

    return this._internationalization;
  }

  get profile(): any {
      
    return this._profile;
  }

  private getProfile() {

    const obj = AccountModel.singleton();    
    this._profile = obj.getProfile();

    obj.isFinishedQuest.on("propertyChange",()=>{

      AccountViewModel.checkIfHasData(this.profile,this);
    });
  }

  private getInternationalization() {

    const inter = Internationalization.singleton();
    this._internationalization = inter.getData();
  }


  public static checkIfHasData(profile: any,viewModel){

          
    if(profile != undefined){

      let address = ((profile.address as EAddress));

      if(
        address.city == "" &&
        address.state == "" &&
        address.country == "" &&
        address.postalCode == "" &&
        address.addressLine == ""
      ){

        viewModel.hasData = false;
      }else{

        viewModel.hasData = true;
      }
    }
  }
    
}
