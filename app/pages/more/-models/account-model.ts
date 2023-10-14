import * as appSettings from "tns-core-modules/application-settings";
import { EProfile, EAddress } from "../-entities/profile";
import { firestore } from "nativescript-plugin-firebase";
import { Observable, fromObject } from "tns-core-modules/data/observable/observable";

export class AccountModel {
  
  private static _singleton: AccountModel;
  public static singleton(): AccountModel {

    if(AccountModel._singleton === undefined){

      AccountModel._singleton = new AccountModel();
    }

    return AccountModel._singleton;
  }

  public isFinishedQuest: Observable = new Observable();
  public finished = false;

  private profile = new EProfile();

  constructor() {
    
    this.requestData();
  }
    
  public getProfile() {

    return this.profile;
  }

  private requestData() {

    firestore.collection("Profiles").where("email", "==", appSettings.getString("email")).onSnapshot((snapshotProfile) => {

      snapshotProfile.forEach((val) => {

        const data = val.data();

        this.profile.id = val.id;
        this.profile.photo = appSettings.getString("profilePhoto") ? appSettings.getString("profilePhoto") : "~/assets/images/account/placeholder-profile.png";
        this.profile.name = data.name;
        this.profile.email = data.email;
        this.profile.password = data.password;
        this.profile.phone = data.phone;
        this.profile.address = new EAddress({
          local: data.address.local,
          city: data.address.city,
          state: data.address.state,
          postalCode: data.address.postalCode,
          country: data.address.country
        });

        this.finished = true;
        this.isFinishedQuest.set("status", true);
      });
    });
  }

  public updateProfile(data: any,section: string){
    firestore.collection("Profiles").where("email", "==", appSettings.getString("email")).get().then((snapshotProfile)=> {

      if(snapshotProfile.docs.length > 0){

        snapshotProfile.docs[0].ref.set( section.toLowerCase() == "address" ? {address: data} :(section.toLowerCase() == "password") ? {password: data} : {phone: data},{merge: true});
      }
    });
  }

}
