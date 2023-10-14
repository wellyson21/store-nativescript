import { Observable } from "tns-core-modules/data/observable/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { firestore } from "nativescript-plugin-firebase";
import { Internationalization } from "~/pages/shared/utilities/internationalization";
import { ENotification, INotification, ENotificationCategory, INotificationCategory } from "../-entities/notification";

export class NotificationsModel {

  private static _singleton: NotificationsModel;
  public static singleton(): NotificationsModel {
    if(NotificationsModel._singleton === undefined){
      NotificationsModel._singleton = new NotificationsModel();
    }
    return NotificationsModel._singleton;
  }

  private isLoading: boolean = false;

  private timelineData: any = new ObservableArray([]);
  private timelineDataArray: any = Array();

  private checkTimelineSectionInserted = [];
  private checkTimelineSubsectionInserted = [];

  private notificationsData: any = Array();
  private notificationsCategoriesData: any = new ObservableArray([]);

  private totalNotifications: number = 0;
 
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
  
  public finished: boolean = false;

  constructor() {
    this.requestDataFirebase();
  }

  public getNotifications(): any {  
    return this.timelineData;
  }

  private requestDataFirebase(): void {

    firestore.collection("Notifications").limit(200).orderBy("date", "desc").onSnapshot((snapshotNotifications) => {

      this.totalNotifications = snapshotNotifications.docSnapshots.length;

      if(this.totalNotifications == 0){

        (<any>this.isFinishedQuest).reset(true);
        this.isFinishedQuest.set("status", false);

        (<any>this.removedData).reset();
        this.removedData.set("length", 0);

        this.finished = true;

        return;
      }

      snapshotNotifications.docChanges().forEach((change) => {

        const type = change.type;
        const docId = change.doc.id;
        const docData = change.doc.data();
        const categoryId = docData.category.id;

        if (type === "added") {

          docData.category.onSnapshot((snapshotCategories) => {

            const categoryData: INotificationCategory = {
              id: categoryId,
              name: snapshotCategories.data().name
            };
  
            const notificationData: INotification = {
              id: docId,
              category: categoryData,
              thumbnail: docData.thumbnail,
              title: docData.title,
              subtitle: docData.subtitle,
              message: docData.message,
              images: docData.images,
              date: docData.date
            };

            this.notificationsCategoriesData.push(new ENotificationCategory(categoryData));

            this.mountObjectForTimeline(notificationData, change.newIndex);
          });
        } else if (type === "modified") {
          
        } else if (type === "removed") {

        }
      });
    });
  }

  private mountObjectForTimeline(data: any, index: number) {

    this.notificationsData.push(new ENotification(data));

    const objBase = {
      date: data.date,
      dateFormatted: this.getDateFormatted(data.date),
      sections: new ObservableArray([
        {
          category: data.category,
          notifications: new ObservableArray(data)
        }
      ])
    };

    if (!this.isLoading) {

      if (this.timelineDataArray.length > 0) {

        this.timelineDataArray.forEach((val) => {

          if (val.date.toLocaleDateString() === data.date.toLocaleDateString()) {
  
            val.sections.forEach((val1) => {
  
              if (val1.category.id === data.category.id) {
  
                val1.notifications.push(data);
                this.checkTimelineSubsectionInserted.push(data.category.id);
              } else {
  
                if (this.checkTimelineSubsectionInserted.indexOf(data.category.id) === -1) {
  
                  val.sections.push({
                    category: data.category,
                    notifications: Array(data)
                  });
  
                  this.checkTimelineSubsectionInserted.push(data.category.id);
                }
              }
            });
          } else if (this.checkTimelineSectionInserted.indexOf(data.date.toLocaleDateString()) === -1) {
  
            this.timelineDataArray.push(objBase);
            this.checkTimelineSectionInserted.push(data.date.toLocaleDateString());
          }
        });
      } else {
  
        this.timelineDataArray.push(objBase);
        this.checkTimelineSectionInserted.push(data.date.toLocaleDateString());
      }
      
      if (index === (this.totalNotifications - 1)) {
  
        this.timelineData.push(this.timelineDataArray);

        this.isLoading = true;
        this.finished = true;

        (<any>this.isFinishedQuest).reset();
        this.isFinishedQuest.set("status", true);
      }
    } else {

      if (this.checkTimelineSectionInserted.indexOf(data.date.toLocaleDateString()) === -1) {

        this.timelineData.unshift(objBase);
        this.checkTimelineSectionInserted.unshift(data.date.toLocaleDateString());
      } else {

        this.timelineDataArray.forEach((val) => {
  
          if (val.date.toLocaleDateString() === data.date.toLocaleDateString()) {

            for(let i = 0; i < val.sections.length; i++) {
              const val1 = val.sections.getItem(i);

              if (val1.category.id === data.category.id) {
  
                val1.notifications.unshift(data);                
                break;
              } else {
  
                val.sections.unshift({
                  category: data.category,
                  notifications: Array(data)
                });                
                break;
              }
            }
          
          }
        });
      }
    }
  }

  private getDateFormatted(date: Date): string {

    const notificationDate = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    const todayDate = new Date();
    const currentDate = `${todayDate.getFullYear()}-${todayDate.getMonth()}-${todayDate.getDate()}`;

    const interData = Internationalization.singleton().getData();

    const dateFormatted = `${date.getDate()} ${interData.notifications.date.months[date.getMonth()]}, ${date.getFullYear()}`;

    return (notificationDate === currentDate ? interData.notifications.date.today : dateFormatted);
  }

}
