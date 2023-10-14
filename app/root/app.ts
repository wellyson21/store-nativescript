/*
In NativeScript, the app.ts file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/
import * as app from "tns-core-modules/application";
import * as platform from "tns-core-modules/platform";
import * as firebase from "nativescript-plugin-firebase";
import { ESFrame } from "~/pages/shared/utilities/esframe";
import { AuthenticationModel } from "~/pages/authentication/-models/authentication-model";
import * as applicatonSettings from "tns-core-modules/application-settings";

// Setting Firebase
firebase.init({
  persist: true,
  iOSEmulatorFlush: true
}).then(() => {

  firebase.login({
    type: firebase.LoginType.PASSWORD,
    passwordOptions: {
      email: '',
      password: ''
    }
  }).then((e)=>{

    applicatonSettings.setBoolean("isFirebaselogged", true);
    AuthenticationModel.singleton();
  });
},(error) => {});

// Setting style sheets
app.setCssFileName(platform.isIOS ? "~/root/app.ios" : "~/root/app.android");

// Setting Google Maps for IOS
if(platform.isIOS) {
  // GMSServices.provideAPIKey("AIzaSyCVALMG6P7GFfsNuf7FxPMBB1e83qWGexM");
}

// Initialize the App
app.run({
  create: () => {

    const frame = new ESFrame();
    frame.id = "main-frame";
    frame.navigate("pages/main/main-page");

    return frame;
  }
});
