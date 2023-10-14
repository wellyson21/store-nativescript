
import * as builder from "tns-core-modules/ui/builder/builder";
import { View, EventData, Observable, Property, CustomLayoutView, ViewBase, Color, Length, PercentLength } from "tns-core-modules/ui/core/view";
import { Page } from "tns-core-modules/ui/page/page";
import * as frameModule from "tns-core-modules/ui/frame/";
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout/grid-layout";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { fromObject, PropertyChangeData } from "tns-core-modules/data/observable/observable";
import * as platform from "tns-core-modules/platform";
import { ESFrame } from "~/pages/shared/utilities/esframe";

export class CustomTabView extends GridLayout {

  private selectedIndex: number;
  private currentTabIndex: number = 0;
  private tabContainer: StackLayout;
  private tabView: View;
  private selectedFrame: ESFrame;
  private static sharedInstance: CustomTabView;
  private tabBarContainer: StackLayout;
  private tabViewFramesContainer: StackLayout;

  private centerTab: StackLayout;  

  //TabView Style
  private styles: Observable = fromObject({
    "selected-tab-item-background-color": "transparent",
    "unselected-tab-item-background-color": "transparent",
    "selected-tab-item-tint-color": new Color("#aaa"),
    "unselected-tab-item-tint-color": new Color("gray"),
    "selected-tab-center-item-tint-color": new Color("#eee"),
    "unselected-tab-center-item-tint-color": new Color(255,255,255,255)
  });

  set selectedTabItemLabelColor(value){

    this.styles.set("selected-tab-item-label-color",value);
  }

  set selectedTabItemTintColor(value){

    this.styles.set("selected-tab-item-tint-color",value);
  }

  set selectedTabItemIconColor(value){

    this.styles.set("selected-tab-item-icon-color",value);
  }

  set selectedTabItemBackgroundColor(value){

    this.styles.set("selected-tab-item-background-color",value);
  }

  set unselectedTabItemLabelColor(value){

    this.styles.set("unselected-tab-item-label-color",value);
  }

  set unselectedTabItemIconColor(value){

    this.styles.set("unselected-tab-item-icon-color",value);
  }

  set unselectedTabItemTintColor(value){

    this.styles.set("unselected-tab-item-tint-color",value);
  }

  set unselectedTabItemBackgroundColor(value){

    this.styles.set("unselected-tab-item-background-color",value);
  }

  set tabViewBackgroundColor(value){

    this.styles.set("tab-view-background-color",value);
  }

  set tabViewHeight(value){

    this.styles.set("tab-view-height",value);
  }

  set tabsContainerBackgroundColor(value){

    this.styles.set("tabs-container-background-color",value);
  }


  static get shared(): CustomTabView{
    
    return CustomTabView.sharedInstance;
  }
 
  static selectedIndexChange(target: CustomTabView, oldValue: number, newValue: number){

    target.setup(newValue);
  }
  

  constructor(startIndex: number = 0,loadeFromXml: boolean = true){
    super();

    if(!loadeFromXml){

      this.setup(startIndex);
    }

    this.styles.on("propertyChange",this.changeTabViewStyleProperty);
  }

  //Initialize and Select start TabItem
  private setup(startIndex: number){

    this.tabView = builder.load(__dirname + '/custom-tab-view.xml') as View;
    this.addChild(this.tabView);
    this.tabViewFramesContainer = this.tabView.getViewById("tab-view-frames-container");
    this.tabBarContainer = this.tabView.getViewById("tab-bar-container");
    this.tabContainer = this.tabView.getViewById("tabs-container") as StackLayout;
    this.tabView.addCssFile(__dirname + "/custom-tab-view.css");
    const selectTab = this.tabContainer.getChildAt(startIndex) as any;
    const framesIsAdded = this.tabViewFramesContainer.getChildrenCount() > 0 ? true : false;


    if(selectTab == undefined){

      console.log("Undefined Selected Tab Index...");
      return;
    }

    if(!framesIsAdded){

      if(platform.isIOS){

        this.tabContainer.eachChild(view=>{

          let tabItemFrame = new ESFrame();
          tabItemFrame.visibility = "hidden";
          (tabItemFrame as any).loaded = false;
          this.tabViewFramesContainer.addChild(tabItemFrame);

          return true;
        });
      }else{

        let tabItemFrame = new ESFrame();
        (tabItemFrame as any).loaded = false;
        this.tabViewFramesContainer.addChild(tabItemFrame);
        this.selectedFrame = tabItemFrame;
      }
    }

    let tabsCount = this.tabContainer.getChildrenCount();


    if(tabsCount % 2 > 0){

      let centerTabBarItem = this.tabContainer.getChildAt(Math.floor(tabsCount / 2)) as StackLayout;

      centerTabBarItem.getChildAt(0).cssClasses.add("tab-bar-highlighted-center-tab");
      centerTabBarItem.getChildAt(0).className = this.getCssClassesOf(centerTabBarItem.getChildAt(0));
      this.centerTab = centerTabBarItem;
    }else{

    }

    this.tabContainer.eachChild(tabItem=>{

      let tb = tabItem as StackLayout;
      tb.setInlineStyle(`width: ${10 / tabsCount * 10}%`);
      return true;
    });

   
   
    //Show Tab Frame
    this.showTabFrame(startIndex);
    CustomTabView.sharedInstance = this;
    this.currentTabIndex = startIndex;
    this.setStyleIn(true,startIndex,true,true,true,true);
    this.tabView.bindingContext = this;

    if(this.centerTab != undefined){

      if(Math.floor(tabsCount / 2) == startIndex){

        this.setStyleInCenterTab(this.centerTab,true);
      }else{

        this.setStyleInCenterTab(this.centerTab,false);
      }
    }
  }



  public onLayoutTabItem(data: EventData){

    let view  = data.object as StackLayout;

    if(this.centerTab.getChildAt(0) == view){

      // let icon = this.centerTab.getChildAt(0);


      // this.stylesE = fromObject({
      //   width: "70px"
      //   // width: `${view.getMeasuredWidth() + 30}px`
      // });

      // let c = Object.create(this) as CustomTabView;
      // c.stylesE = fromObject({
      //   style: "width: 40px"
      //   // width: `${view.getMeasuredWidth() + 30}px`
      // });
      // this.tabView.bindingContext = c;

      // this.tabContainer.eachChild(tabItem=>{

      //   let tb = tabItem as StackLayout;

      //   // tb.setInlineStyle(`width: ${view.getMeasuredWidth()}%`);
      //   tb.setInlineStyle(`width: ${10 / 5 * 10 + 10}%`);
      //  
      //   return true;
      // });

 
      // console.log(this.centerTab.getChildAt(0).getMeasuredWidth());

      // let centerTabBarItem = this.tabContainer.getChildAt(Math.floor(5 / 2)) as StackLayout;

      // centerTabBarItem.getChildAt(0).setInlineStyle(`width: ${view.getMeasuredWidth()}px`);
      

      // view.set
      // view.setInlineStyle("width: 20pt");

      // console.log(view);
      // view.style.width = 
      // height: 80%;
      // border-radius: 100%;
      // background-color: red;

      // view.addCss(`
      //   .tab-bar-highlighted-center-tab{ 
      //     height: 80%;
      //     width: ${view.getMeasuredHeight()}px;
      //     border-radius: 100%;
      //     background-color: red;
      //   }
      // `)


      // view.requestLayout();

      // console.log(view.getMeasuredWidth());
    }
  
  }

  //Get classes string of a specifc view
  private getCssClassesOf(item: ViewBase): string{

    let classesStr = "";
    item.cssClasses.forEach(className =>{classesStr += " " + className;});
    return classesStr;
  }

  //Click in Tab Item
  private onTabItem(args: any){

    this.notify({
      eventName: "willSelectTabItem",
      object: this
    });

    let view = args.view as View;
    this.selectTabViewIndex(this.tabContainer.getChildIndex(view));    
  }

  //select tab View Index
  selectTabViewIndex(index: number){

    if(this.getSelectedIndex() == index){return;}

    const selectTab = this.tabContainer.getChildAt(index) as StackLayout;
    if(selectTab != null){

      this.currentTabIndex = index;
      this.setStyleIn(false,undefined,true,true,true,true);
      this.setStyleIn(true,index,true,true,true,true);
      this.showTabFrame(index);
      this.notify({
        eventName: "didSelectTabItem",
        object: this
      });
    }
  }

  //Obersever To change TabView Style Property
  private changeTabViewStyleProperty(args: PropertyChangeData){

    let self = CustomTabView.shared;
    if(self.tabContainer != undefined){

      let tabItemStyleProperties = [
        "selected-tab-item-background-color","unselected-tab-item-background-color",
        "selected-tab-item-tint-color","unselected-tab-item-tint-color",
        "selected-tab-item-icon-color","unselected-tab-item-icon-color",
        "selected-tab-item-label-color","unselected-tab-item-label-color",
    ];

      if(tabItemStyleProperties.indexOf(args.propertyName) != -1){

        let tabItem = self.tabContainer.getChildAt(self.currentTabIndex) as StackLayout;

        switch (args.propertyName){
          case "unselected-tab-item-background-color":{

            self.setStyleIn(false,undefined,true);
            break;
          }
          case "selected-tab-item-background-color":{

            self.setStyleIn(true,self.currentTabIndex,true);
            break;
          }
          case "unselected-tab-item-label-color":{

            self.setStyleIn(false,undefined,false,false,false,true);
            break;
          }
          case "selected-tab-item-label-color":{

            self.setStyleIn(true,self.currentTabIndex,false,false,false,true);
            break;
          }
          case "unselected-tab-item-tint-color":{

            self.setStyleIn(false,undefined,false,true);
            break;
          }
          case "selected-tab-item-tint-color":{
  
            self.setStyleIn(true,self.currentTabIndex,false,true);
            break;
          }
          case "unselected-tab-item-icon-color":{

            self.setStyleIn(false,undefined,false,false,true);
            break;
          }
          case "selected-tab-item-icon-color":{

            self.setStyleIn(true,self.currentTabIndex,false,false,true);
            break;
          }
        }
        return true;
      }else{

        switch (args.propertyName){
          case "tab-view-background-color": {

            self.tabBarContainer.backgroundColor = self.styles.get("tabs-container-background-color");
            break;
          }
          case "tab-view-height": {

            self.tabContainer.height = self.styles.get("tab-view-height");
            break;
          }
          case "tabs-container-background-color": {

            self.tabContainer.backgroundColor = self.styles.get("tab-view-background-color");
            break;
          }
        }
      }
    }
  }

  private setStyleIn(selected: boolean,tabItemIndex?: number,isbackgroundColor: boolean = false,isTintColor: boolean = false,isIconColor: Boolean = false,isLabelColor: boolean = false){

    let self = CustomTabView.shared;
    if(tabItemIndex !== undefined){

      let tabItem = self.tabContainer.getChildAt(tabItemIndex) as any;

      if(tabItem == self.centerTab){

        self.setStyleInCenterTab(tabItem,selected);
      }else{

        applyStyle(tabItem);
      }
    }else{

      let selectedTabItem = self.tabContainer.getChildAt(this.currentTabIndex);
      self.tabContainer.eachChild((tabItem: StackLayout)=>{

        if(tabItem !== selectedTabItem){
          if(tabItem == self.centerTab){

            self.setStyleInCenterTab(tabItem,selected);
          }else{

            applyStyle(tabItem);
          }   
        }
        return true;
      });
    }

    function applyStyle(tabItem: any){

      let tabInfoContainer = (tabItem.getChildAt(0) as StackLayout);
      let item1 = tabInfoContainer.getChildAt(0) as any;
      let item2 = tabInfoContainer.getChildAt(1) as any;

      if(isbackgroundColor){

        tabItem.backgroundColor = self.styles.get( selected ? "selected-tab-item-background-color" : "unselected-tab-item-background-color" );
      }

      if(isTintColor){

        let v1 = self.styles.get( selected ? "selected-tab-item-tint-color" : "unselected-tab-item-tint-color" );
        if(v1 !== undefined){

          item1.color = v1;
          item1.tintColor = v1;
        }
      }
      
      if(isIconColor){

        if((item1 as View).cssClasses.has("tab-item-icon")){

          let v1 = self.styles.get( selected ? "selected-tab-item-icon-color" : "unselected-tab-item-icon-color" );

          if(v1 !== undefined){

            item1.color = v1;
            item1.tintColor = v1;
          }
        }
      }

      if(isLabelColor){

        if((item1 as View).cssClasses.has("tab-item-label")){

          let v1 = self.styles.get( selected ? "selected-tab-item-label-color" : "unselected-tab-item-label-color" );
          if(v1 !== undefined){

            item1.color = v1;
          }
        }
      }


      if(item2 !== undefined){

        if(isTintColor){

          let v1 = self.styles.get( selected ? "selected-tab-item-tint-color" : "unselected-tab-item-tint-color" );
          if(v1 !== undefined){

            item2.color = v1;
            item2.tintColor = v1;
          }
        }

        if(isIconColor){

          if((item2 as View).cssClasses.has("tab-item-icon")){
  
            let v1 = self.styles.get( selected ? "selected-tab-item-icon-color" : "unselected-tab-item-icon-color" );
            if(v1 !== undefined){

              item2.color = v1;
              item2.tintColor = v1;
            }
          }
        }

        if(isLabelColor){

          if((item2 as View).cssClasses.has("tab-item-label")){
  
            let v1 = self.styles.get( selected ? "selected-tab-item-label-color" : "unselected-tab-item-label-color" );
            if(v1 !== undefined){

              item2.color = v1;
            }
          }
        } 
      }
    }
  }

  private setStyleInCenterTab(tabItem: View,isSelected: boolean){

    let tb = (tabItem as StackLayout);
    let self = CustomTabView.shared;

    let icon = (tb.getChildAt(0) as StackLayout).getChildAt(0) as any;
    let bc = self.styles.get( isSelected ? "selected-tab-center-item-background-color" : "unselected-tab-center-item-background-color");
    let cl =  self.styles.get( isSelected ? "selected-tab-center-item-color" : "unselected-tab-center-item-color");
    let tc = self.styles.get( isSelected ? "selected-tab-center-item-tint-color" : "unselected-tab-center-item-tint-color");

    if(bc != undefined){

      icon.backgroundColor = bc;
    }

    if(cl != undefined){

      icon.color = cl;
    }

    if(tc != undefined){

      icon.tintColor = tc;
    }
  }

  //show a tab Frame
  private showTabFrame(index: number){

    const selectTab = this.tabContainer.getChildAt(index) as any;
    let moduleName = selectTab.path as string;

    if(platform.isIOS){

      let startTabFrame = this.tabViewFramesContainer.getChildAt(index) as any;
      this.selectedFrame = startTabFrame;

      if(startTabFrame.loaded == false){
      
        startTabFrame.loaded = true;
        (startTabFrame as ESFrame).present({
          moduleName: moduleName,
          clearHistory: true,
          animated: false,
        });

      
        this.modalMonitor(startTabFrame);
      
  
        this.tabViewFramesContainer.eachChild(frame=>{
          if(frame != startTabFrame){
  
            (frame as frameModule.Frame).visibility = "hidden";
          }
          return true;
        });

        startTabFrame.visibility = "visible";
  
      }else{
  
        this.tabViewFramesContainer.eachChild(frame=>{
          if(frame != startTabFrame){
  
            (frame as frameModule.Frame).visibility = "hidden";
          }
          return true;
        });
  
        startTabFrame.visibility = "visible";
        this.modalMonitor(startTabFrame);
      }  
    }else{

      let startTabFrame = this.selectedFrame;
      (startTabFrame as any).loaded = true;
      (startTabFrame as ESFrame).present({
        moduleName: moduleName,
        clearHistory: true,
        animated: false,
      });
    }

        
  }

  //Getters
  getSelectedFrame(): ESFrame{

    return this.selectedFrame;
  }

  static getMainFrame(): ESFrame{

    return frameModule.getFrameById("main-frame") as ESFrame;
  }

  getSelectedIndex(): number{

    return this.currentTabIndex;
  }

  private modalMonitorIt;

  private modalMonitor(frame: ESFrame){

    if(platform.isAndroid){return;}

    let isShow: boolean = false;
    clearInterval(this.modalMonitorIt);
    let it = setInterval(()=>{
      if(frame.ios.controller.view.frame.size.height < CustomTabView.getMainFrame().ios.controller.view.frame.size.height){

        let iosf = frame.ios.controller.view.frame;
        this.modalMonitorIt = setInterval(()=>{
          
          if(frame.modal != null){

              if(!isShow){

                isShow = true;
              }
            }else{
              if(isShow){

                setTimeout(()=>{

                  // console.log(iosf.size.height, frame.ios.controller.view.frame.size.height);
                  frame.ios.controller.view.frame = iosf;
                },500);
                isShow = false;
              }
            }
          },0);
        clearInterval(it);
      }
    },0);
  }

}

export const selectedIndexProperty = new Property<CustomTabView, number>({
  name: "selectedIndex",
  defaultValue: 0,
  affectsLayout: true,
  valueChanged: CustomTabView.selectedIndexChange
});
selectedIndexProperty.register(CustomTabView);

export class CustomTabViewPage extends Page{

  private static tabViewInstance: CustomTabView;

  static get tabView (): CustomTabView{

    return CustomTabViewPage.tabViewInstance;
  }

  constructor(startTabViewIndex: number = 0,tabViewLoadedFromXml: boolean = true){
    super();

    this.setTabBarView(startTabViewIndex, tabViewLoadedFromXml);
  }

  
  private setTabBarView(index: number,tabViewLoadedFromXml: boolean = true){

    CustomTabViewPage.tabViewInstance = new CustomTabView(index,tabViewLoadedFromXml);
    this.content = CustomTabViewPage.tabViewInstance;
  }

  static getMainFrame(): frameModule.Frame{

    return frameModule.getFrameById("main-frame");
  }

  static getTabViewChildFrame(): frameModule.Frame{

    return frameModule.getFrameById("tab-view-child-frame");
  }

  static getTabView(): CustomTabView{

    return CustomTabViewPage.tabView;
  }
}
