import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { firestore } from "nativescript-plugin-firebase";
import { IAboutSection, EAboutSection } from "../-entities/about";

export class AboutModel {

  private sectionsData: ObservableArray<IAboutSection> = new ObservableArray([]);
  private countSections: number = 0;

  constructor() {

    this.requestDataFirestore();
  }

  public getSectionsData(): ObservableArray<IAboutSection> {

    return this.sectionsData;
  }

  private requestDataFirestore() {

    firestore.collection("About").orderBy("date", "asc").onSnapshot((snapshotAbout) => {
      
      // Clear ObservableArray
      this.sectionsData.splice(0);

      // Iterate on the documents
      snapshotAbout.forEach((val) => {

        const data = val.data();
        
        // Inserts data in the ObservableArray
        this.sectionsData.push(new EAboutSection({
          title: data.title,
          description: data.description
        }));

        this.countSections++;
      });
    });
  }

}
