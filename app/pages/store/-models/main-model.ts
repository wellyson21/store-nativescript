import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { firestore } from "nativescript-plugin-firebase";
import * as applicatonSettings from "tns-core-modules/application-settings";

export class MainModel {

  private banners: any = new ObservableArray([]);

  constructor() {
    let it = setInterval(()=>{
      if(applicatonSettings.getBoolean("isFirebaselogged",false)){

        this.requestBannersAtFirestore();        
        clearInterval(it);
      }
    });
  }

  public getSlideItems(): any {

    return this.banners;
  }

  private requestBannersAtFirestore() {

    firestore.collection("StorePresentation").onSnapshot((snapshotBanners) => {

      snapshotBanners.docChanges().forEach((changes) => {

        const type = changes.type;
        const docData = changes.doc.data();
        docData.id = changes.doc.id;

        if(type === "added") {

          this.banners.push(docData);
        } else if (type === "modified") {

          this.banners.forEach((item, i) => {
            if(item.id === docData.id) {
              this.banners.setItem(i, docData);
            }
          });
        } else if (type === "removed") {

          this.banners.forEach((item, i) => {
            if(item.id === docData.id) {
              this.banners.splice(i, 1);
            }
          });
        }
      });
    });
  }

}
