
import { messaging, Message } from "nativescript-plugin-firebase/messaging";
import { alert, confirm } from "tns-core-modules/ui/dialogs";
import { IosPushSettings, IosInteractivePushSettings } from "nativescript-plugin-firebase/messaging/messaging";
import { isIOS } from "tns-core-modules/platform";
import * as applicationSettings from "tns-core-modules/application-settings";
import * as httpModule from "tns-core-modules/http";
import { FirebaseUtilities } from "~/pages/shared/utilities/firebase-utilities";
import { firestore } from "nativescript-plugin-firebase";
import { ESettings } from "~/pages/shared/utilities/-entities/entities";

export class Notifications {

  private static APP_REGISTERED_FOR_NOTIFICATIONS = "APP_REGISTERED_FOR_NOTIFICATIONS";
	private static APP_REGISTERED_FOR_NOTIFICATIONS_IT_COUNT = "APP_REGISTERED_FOR_NOTIFICATIONS_IT_COUNT";  

	constructor() {

		if(!applicationSettings.getBoolean(Notifications.APP_REGISTERED_FOR_NOTIFICATIONS, false)){
			this.registerForPushNotifications();
		}

		this.getCurrentNotificationToken();
	}    

	public getCurrentNotificationToken() {

		messaging.getCurrentPushToken().then((token) => {
				
			this.sendTokenToFirebase(token);
		});
	}

	private registerForPushNotifications(){

		messaging.registerForPushNotifications({
			onPushTokenReceivedCallback: (token) => { },
			onMessageReceivedCallback: (message) => {	},
			showNotifications: true,
			showNotificationsWhenInForeground: true,
		}).then((success) => {

			applicationSettings.setBoolean(Notifications.APP_REGISTERED_FOR_NOTIFICATIONS, true);
		}).catch((error) => {

			applicationSettings.setBoolean(Notifications.APP_REGISTERED_FOR_NOTIFICATIONS, false);
		});
	}

	private registerNotificationsHandlers(){

		messaging.addOnPushTokenReceivedCallback((token) => {

			console.log(`PH-TOKEN: ${token}`);

			applicationSettings.setBoolean(Notifications.APP_REGISTERED_FOR_NOTIFICATIONS,true);
		});

		messaging.addOnMessageReceivedCallback((message) => {

			console.log("---------- Received Notification ----------");
			console.log(message);
		});

	} 

	private registerForInteractiveNotifications(){

		if(!isIOS) {	return;	}

		const model = new messaging.PushNotificationModel();

		model.iosSettings = new IosPushSettings();
		model.iosSettings.alert = true;
		model.iosSettings.badge = true;
		model.iosSettings.sound = true;
		model.iosSettings.interactiveSettings = new IosInteractivePushSettings();
		model.iosSettings.interactiveSettings.actions = [
			{
				identifier: "OPEN_ACTION",
				title: "Open the app (if closed)",
				options: messaging.IosInteractiveNotificationActionOptions.foreground
			},
			{
				identifier: "AUTH",
				title: "Open the app, but only if device is not locked with a passcode",
				options: messaging.IosInteractiveNotificationActionOptions.foreground | messaging.IosInteractiveNotificationActionOptions.authenticationRequired
			},
			{
				identifier: "INPUT_ACTION",
				title: "Tap to reply without opening the app",
				type: "input",
				submitLabel: "Fire!",
				placeholder: "Load the gun..."
			},
			{
				identifier: "INPUT_ACTION",
				title: "Tap to reply and open the app",
				options: messaging.IosInteractiveNotificationActionOptions.foreground,
				type: "input",
				submitLabel: "OK, send it",
				placeholder: "Type here, baby!"
			},
			{
				identifier: "DELETE_ACTION",
				title: "Delete without opening the app",
				options: messaging.IosInteractiveNotificationActionOptions.destructive
			}
		];

		model.iosSettings.interactiveSettings.categories = [
			{identifier: "GENERAL"}
		];

		model.onNotificationActionTakenCallback = (actionIdentifier: String,message: String, inputText?: String) => {

			// console.log(`onNotificationActionTakenCallback fired! \n\r Message: ${JSON.stringify(message)}, \n\r Action taken: ${actionIdentifier}`);

			alert({
				title: "Interactive push action",
				message: `Message: ${JSON.stringify(message)}, \n\r Action taken: ${actionIdentifier}` + (inputText ? `, \n\r Input text: ${inputText}` : ""),
				okButtonText: "Nice!"
			});
		}

		messaging.registerForInteractivePush(model);

		// console.log(this.getCurrentNotificationToken());
		// console.log("Registered for interactive push");
	}     

	private requestConsent() {
			
		confirm({
			title: "We'd like to send notifications",
			message: "Do you agree? Please do, we won't spam you. Promised.",
			okButtonText: "Yes",
			cancelButtonText: "Maybe later"
		}).then((allowedPush) => {

			if(allowedPush) {

				applicationSettings.setBoolean(Notifications.APP_REGISTERED_FOR_NOTIFICATIONS,true);
				this.registerNotificationsHandlers();
			}
		});
	}

	private sendTokenToFirebase(token: string) {

		if(applicationSettings.getNumber(Notifications.APP_REGISTERED_FOR_NOTIFICATIONS_IT_COUNT, 0) < 10){

			FirebaseUtilities.getQueryData(firestore.collection("Settings"), ESettings).then((result) => {

				if((result.entities as Array<any>).length > 0){

					let settings = (result.entities[0] as ESettings);

					httpModule.request({
						url: `https://iid.googleapis.com/iid/v1/${token}/rel/topics/default`,
						method: "POST",
						headers: { 
							"Content-Type": "application/json",
							"Authorization": `key=${settings.notificationsKey.trim()}`
						}
					}).then(
						(response) => {

							if(response.statusCode === 200) {
								applicationSettings.setBoolean("NotificationTokenSaved", true);
							}					
						}
					);
				}
			});

			applicationSettings.setNumber(Notifications.APP_REGISTERED_FOR_NOTIFICATIONS_IT_COUNT,applicationSettings.getNumber(Notifications.APP_REGISTERED_FOR_NOTIFICATIONS_IT_COUNT, 0) + 1);
		}
	}

}