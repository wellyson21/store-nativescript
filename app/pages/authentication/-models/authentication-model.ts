import { IProfile, EProfile } from "~/pages/more/-entities/profile";
import * as applicationSettings from "tns-core-modules/application-settings";
import * as firebase from "nativescript-plugin-firebase";
import { FirebaseUtilities } from "~/pages/shared/utilities/firebase-utilities";
import * as frameModule from "tns-core-modules/ui/frame";
import { ESFrame } from "~/pages/shared/utilities/esframe";
import { RegisterPage } from "../register/register-page";
import { firestore } from "nativescript-plugin-firebase";
import { Observable, fromObject } from "tns-core-modules/data/observable/observable";

export class AuthenticationModel {

  private static _singleton: AuthenticationModel;
  public static singleton(): AuthenticationModel {

    if(AuthenticationModel._singleton === undefined){

      AuthenticationModel._singleton = new AuthenticationModel();
    }

    return AuthenticationModel._singleton;
  }

  private firestore = firebase.firestore;
  private setting: Observable = fromObject({});

  public isFinishedQuest: Observable = new class extends Observable{
    private _status: boolean = false;
    get status(): boolean { return this._status; }
    set status(value) { this._status = value; }
    public reset(value = false) { this._status = value; }
  }();

  public removedData: Observable = new class extends Observable{
    private _length: number = 0;
    get length(): number { return this._length; }
    set length(value) { this._length = value; }
    public reset() { this._length = this._length === 0 ? -1 : 0; }
  }();

  public static loginStatus: Observable = new class extends Observable {
    private _status: boolean = false;
    get status(): boolean { return this._status; }
    set status(value){ this._status = value; }
    public reset(value = false) { this._status = value; }
  }();
  
  public finished: boolean = false;

  constructor() {

    setTimeout(() => {this.resquetSettings(); }, 600);
  }

  public static isLoged(){

    return applicationSettings.getString("email", "") !== "";
  }

  public getSetting(): Observable {

    return this.setting;
  }

  public login(data: ILoginData, callback: any = null) {

    FirebaseUtilities.getQueryData(
      this.firestore.collection("Profiles").where("email", "==", data.email.trim()).where("password", "==", data.password.trim()),
      EProfile
    ).then((result) => {

      if((<Array<any>>result.entities).length === 1) {

        applicationSettings.setString("email", result.entities[0].email.trim());
        applicationSettings.setString("userId", result.entities[0].id.trim());

        (<any>AuthenticationModel.loginStatus).reset(false);
        AuthenticationModel.loginStatus.set("status", true);

        callback("success");
      } else {

        callback("fail");
      }
    });
  }

  public register(profile: IProfile, callback: any = null) {

    FirebaseUtilities.getQueryData(
      this.firestore.collection("Profiles").where("email", "==", profile.email.trim()).where("password", "==", profile.password.trim()),
      EProfile
    ).then((result) => {

      if((<Array<any>>result.entities).length == 0){

        this.firestore.collection("Profiles").add(profile).then(()=>{

          FirebaseUtilities.getQueryData(
            this.firestore.collection("Profiles").where("email", "==", profile.email.trim()).where("password", "==", profile.password.trim()),
            EProfile
          ).then((result) => {

            if((<Array<any>>result.entities).length === 1){

              applicationSettings.setString("email",result.entities[0].email.trim());
              applicationSettings.setString("userId",result.entities[0].id.trim());

              (<any>AuthenticationModel.loginStatus).reset(false);
              AuthenticationModel.loginStatus.set("status", true);
              
              callback("success");
            }
          });
        });
      } else {
        
        callback("fail");
      }
    });
  }

  private resquetSettings() {

    firestore.collection("Authentication").onSnapshot((snapshotSettings) => {

      snapshotSettings.docChanges().forEach((changes) => {
        
        this.setting.set("phrase", changes.doc.data().phrase);
        this.setting.set("background", changes.doc.data().background);
      });

      setTimeout(() => {
        this.finished = true;

        (<any>this.isFinishedQuest).reset();
        this.isFinishedQuest.set("status", true);
      }, 2000);
    });
  }

}

interface ILoginData{
  email: string;
  password: string;
}
