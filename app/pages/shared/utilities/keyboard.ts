import * as frame from "tns-core-modules/ui/frame/frame";
import * as utils from "tns-core-modules/utils/utils";
import { isIOS, isAndroid } from "tns-core-modules/platform";

export class Keyboard {
 
  public static dismissKeyboard() {

    if (isIOS) {
      frame.topmost().nativeView.endEditing(true);
    } else if (isAndroid) {
      utils.ad.dismissSoftInput();
    }
  }
  
}

export class KeyboardStatus {

  private lastStatus: boolean = false;

  constructor(callback: any = null) {

    if (global.android) {
      this.trackAndroidKeyboard(callback);
    } else {
      this.trackiOSKeyboard(callback);
    }
  }
  
  public isShowing() {

    return this.lastStatus;
  }

  private trackAndroidKeyboard(callback: any) {
      
    if (!frame.topmost()) { setTimeout(this.trackAndroidKeyboard, 100); return; }
    if (!frame.topmost().currentPage) { setTimeout(this.trackAndroidKeyboard, 100); return; }

    const that = this;
    const currentView = frame.topmost().currentPage.android.getRootView();

    currentView.getViewTreeObserver().addOnGlobalLayoutListener(new android.view.ViewTreeObserver.OnGlobalLayoutListener({
      onGlobalLayout() {

        const rect = new android.graphics.Rect();

        currentView.getWindowVisibleDisplayFrame(rect);

        const screenHeight = currentView.getHeight();
        const heightDiff = screenHeight - rect.height();

        let status = false;
        if (heightDiff > (screenHeight * 0.15)) { status = true; }

        that.notifyKeyboard(status, callback);
      }
    }));
  }

  private trackiOSKeyboard(callback: any) {

    const that = this;
    const application = require("application");

    application.ios.addNotificationObserver(UIKeyboardDidShowNotification, () => {
      that.notifyKeyboard(true, callback);
    });

    application.ios.addNotificationObserver(UIKeyboardDidHideNotification, () => {
      that.notifyKeyboard(false, callback);
    });
  }
  
  private notifyKeyboard(status: boolean, callback: any) {

    if (status === this.lastStatus) { return; }
    
    callback(status);
    
    this.lastStatus = status;
  }

}
