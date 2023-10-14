import { PropertyChangeData, EventData, View, Page, PercentLength } from "tns-core-modules/ui/page/page";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { Cache } from "tns-core-modules/ui/image-cache"
import { Image } from "tns-core-modules/ui/image/image";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout/stack-layout";
import { TextField } from "tns-core-modules/ui/text-field/text-field";
import { fromNativeSource, ImageSource } from "tns-core-modules/image-source/image-source";
import * as connectivity from "tns-core-modules/connectivity";
import * as dialogs from "tns-core-modules/ui/dialogs";
import * as platform from "tns-core-modules/platform";
import * as application from "tns-core-modules/application";

export class General{

  private static _cacheSingleton: Cache;
  public static cacheSingleton(): Cache {

    if(General._cacheSingleton === undefined){

      General._cacheSingleton = new Cache();
    }

    return General._cacheSingleton;
  };

  //Loader and placeholder setup
  public static setLoaderAndPlaceholder(model: any, viewModel: any, dataPropertyName: string, getDataPropertyName: string){

    viewModel.haveDataToDisplay = true;

    if(model.finished){

      viewModel[dataPropertyName] = model[getDataPropertyName]();
      viewModel.isLoading = false;
      viewModel.dataLength = model[getDataPropertyName]().length;

      if(viewModel.dataLength == 0){

        viewModel.haveDataToDisplay = false;
      }
    }else{

      viewModel[dataPropertyName] = model[getDataPropertyName]();
    }
    

    model.removedData.on("propertyChange",(data: PropertyChangeData)=>{
      if((data.object).get("length") == 0){

        viewModel.haveDataToDisplay = false;
      }
      viewModel.dataLength = parseInt((data.object).get("length"));
    });


    (viewModel[dataPropertyName] as ObservableArray<any>).on("change",(data)=>{

      let td = (data.object as ObservableArray<any>);
      viewModel.dataLength = td.length;
      const dataLength = td.length;

      if(dataLength > 0 && viewModel.haveDataToDisplay == false){
        
        viewModel.haveDataToDisplay = true;
      }

      if(dataLength > 0 && viewModel.isLoading){

        viewModel.isLoading = false;        
      }
    });

    model.isFinishedQuest.on("propertyChange",(data: PropertyChangeData)=>{
      
      let s = (data.value as boolean);
        if(!s){

          viewModel.haveDataToDisplay = false;
        }
        viewModel.isLoading = false;
    });

    
  }

  //Seup image height
  public static setHeightImage(data: EventData) {

    let view = (data.object as View);
    General.getMeasured(view).then(value=>{
      if((<any>value).width !== (<any>value).height){

        view.height = PercentLength.parse(`${(<any>value).width}pt`);
      }
    });
  }

  //Image Cache
  public static async setAndGetImageFromCache(data: EventData): Promise<SGImageFromCache>{

    let resolveWS: (data: SGImageFromCache)=> void;

    let interval = setInterval((data)=>{

      // console.log("|-------------------------------|", (data.object as any).url);

      if((data.object as any).url == undefined || typeof (data.object as any).url != "string"){return;}

      const url = (data.object as any).url.trim();
      const cache = General.cacheSingleton();
      let cachedImageSource: ImageSource;      
      const ext = [ "jpg", "jpeg", "jpng", "png", "gif" ];

      let slices = url.split("?");
      slices = slices[0].split(".");

      if(slices.length < 2 || ext.indexOf(slices[slices.length - 1]) == -1) {
        clearInterval(interval);
        return; 
      }

      cache.maxRequests = 10;
      cache.enableDownload();
      const myImage = cache.get(url);
  
      if(myImage){
  
        cachedImageSource = fromNativeSource(myImage);
        (data.object as Image).src = cachedImageSource;
        resolveWS({
          key: url,
          url: url,
          imageSource: cachedImageSource,
          source: "cache"
        });
      } else {
        cache.push({
          key: url,
          url: url,
          completed: (image, key) => {
            if (url === key) {
  
              cachedImageSource = fromNativeSource(image);
              (data.object as Image).src = cachedImageSource;
              resolveWS({
                key: key,
                url: url,
                imageSource: cachedImageSource,
                source: "web"
              });
            }
          }
        });
      }

      clearInterval(interval);
    },0,data);

    return await new Promise<SGImageFromCache>(resolve=>{

      resolveWS = resolve;
    });
  }

  // Check connection
  public static checkConnection(): boolean {

    const currentConnectionType = connectivity.getConnectionType()
      
    if(currentConnectionType == connectivity.connectionType.none) {

      dialogs.alert({
        message: "Connect to the internet to continue!",
        okButtonText: "ok"
      });
      
      return false;
    } else {

      return true;
    }
  }

  // Adjust form
  private static containerForm: StackLayout;

  public static adjustForm(containerForm: StackLayout, containerTextFields: StackLayout) {
    
    const length = containerTextFields.getChildrenCount();

    let i = 1;
    containerTextFields.eachChild((textField: any) => {
      
      textField.order = i;
      
      textField.on("focus", onFocus);

      if(i == length) {

        textField.on("returnPress", onReturnPress);
      }      
      i++;

      return true;
    });

    General.containerForm = containerForm;

    function onReturnPress(args: any) {

      containerForm.translateY = 0;
    }
  
    function onFocus(args: any) {
  
      const order = args.object.order;
      const height = (<TextField>args.object).height;
  
      containerForm.translateY = -(<number>height * order);  
    }

  }

  public static resetAdjustForm() {

    General.containerForm.translateY = 0;
  }

  //Get View Meassure
  public static getMeasured(view, timeout = 100){
    const scale = platform.screen.mainScreen.scale;
    return new Promise(res => {
      setTimeout(() => {
        res({
          width: view.getMeasuredWidth() / scale,
          height: view.getMeasuredHeight() / scale
        });
      }, timeout);
    })
  }

  public static getVersion(): string{
    if(platform.isAndroid) {
        var PackageManager = android.content.pm.PackageManager;
        var pkg = application.android.context.getPackageManager().getPackageInfo(application.android.context.getPackageName(), PackageManager.GET_META_DATA);
        return java.lang.Integer.toString(pkg.versionCode);
    } else {
        var version = NSBundle.mainBundle.objectForInfoDictionaryKey("CFBundleShortVersionString");
        return version;
    }
  }

}

interface SGImageFromCache {
  key?: string;
  url?: string;
  imageSource: ImageSource;
  source: string;
}