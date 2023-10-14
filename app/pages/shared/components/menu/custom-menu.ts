import { ScrollView } from "tns-core-modules/ui/scroll-view";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout/stack-layout";
import { AbsoluteLayout } from "tns-core-modules/ui/layouts/absolute-layout/absolute-layout";
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout/grid-layout";
import { TouchGestureEventData, SwipeGestureEventData } from "tns-core-modules/ui/gestures/gestures";
import { CustomTabView } from "~/pages/shared/components/tabview/custom-tab-view";
import { View, ViewBase, Page } from "tns-core-modules/ui/page/page";
import { Image } from "tns-core-modules/ui/image";
import { Label } from "tns-core-modules/ui/label";
import * as observableArrayModule from "tns-core-modules/data/observable-array/observable-array";
import * as observableModule from "tns-core-modules/data/observable";
import * as builder from "tns-core-modules/ui/builder/builder";
import * as UIEnums from "tns-core-modules/ui/enums/enums";

export class CustomMenu extends AbsoluteLayout {

  public static shared: CustomMenu;

  private customMenuOverlayContentView: StackLayout = new StackLayout();

  private menuSideView: StackLayout = new StackLayout();
  private menuContainerScrollView: ScrollView;
  private menuContainerGrid: GridLayout;
  
  private menuHeaderContainer: StackLayout;
  private menuItemsContainer: StackLayout;

  private _mainContent: View;
  private selectedMenuItemPath: string;
  private isSetupiedMenuSideView: boolean = false;

  public get mainContent(): View{

    return this._mainContent;
  }

  public set mainContent(newValue){

    let oldValue = this.mainContent;
    this._mainContent = newValue;
    this.mainContentChanged(this,oldValue,newValue);
  }

  private allItemsWithPath: Array<StackLayout> = [];
  private menuState: number = 0;

  private _headerData: observableModule.Observable = observableModule.fromObject({});

  public get headerData(): observableModule.Observable{

    return this._headerData;
  }

  public set headerData(newValue){

    this._headerData = newValue;
    this.menuHeaderContainer.bindingContext = newValue;
  }

  private _itemsData: observableArrayModule.ObservableArray<MenuItem> = new observableArrayModule.ObservableArray(0); 

  public get itemsData(): observableArrayModule.ObservableArray<MenuItem>{

    return this._itemsData;
  }

  public set itemsData(newValue){

    this._itemsData = newValue;
    this._itemsData.on("propertyChange",this.changedMenuData);
    this.changedMenuData();
  }

  constructor(){
    super();

    this.customMenuOverlayContentView.className = "custom-menu-overlay-view";
    this.className = "custom-menu-view";
    this.menuSideView.className = "menu-side-view";
  
    this.opacity = 0;
    this.menuSideView.opacity = 0;
    this.customMenuOverlayContentView.opacity = 0;
    this.addChild(this.customMenuOverlayContentView);
    this.addChild(this.menuSideView);

    this.addCssFile(__dirname + "/custom-menu.css");

    this.menuContainerScrollView = builder.parse('<ScrollView><GridLayout rows="auto,*" id="custom-menu-container-grid"></GridLayout></ScrollView>') as ScrollView;
    this.menuContainerGrid = this.menuContainerScrollView.getViewById("custom-menu-container-grid");
    this.menuSideView.addChild(this.menuContainerScrollView);
    this._itemsData.on("propertyChange",this.changedMenuData);

    //Setup mainContent
    let mainContentinterval = setInterval(()=>{
      if(this.getChildrenCount() === 3){
        this.eachChild(view=>{
          if((view as any).mainContent === "true"){

            view.cssClasses.add("menu-main-content-view");
            view.className = this.getCssClassesOf(view);
            
            this._mainContent = view as View;
            this.removeChild(this.menuSideView);
            this.insertChild(this.menuSideView,this.getChildIndex(view as View) + 1);
            
            let sv = (view as ScrollView);
            if(sv != undefined){

              sv.scrollToVerticalOffset(0,false);
            }

            // this.opacity = 1;

            //Toggle menu from swipe
            this.toggleMenuStateFromSwipe();
            clearInterval(mainContentinterval);
          }
          return true;
        });
      }
    },0);

    //Initial setup sideMenu
    let menuSideViewInterval = setInterval(()=>{

      if(this.menuSideView.getMeasuredWidth() > 0){

        this.menuSideView.animate({
          duration: 0,
          curve: UIEnums.AnimationCurve.linear,
          translate: {
            x: -this.menuSideView.getMeasuredWidth(),
            y: 0
          }
        }).then(()=>{
          setTimeout(()=>{

            this.menuSideView.opacity = 1;
            this.isSetupiedMenuSideView = true;
          },70);
        });
        clearInterval(menuSideViewInterval);
      }
    },0);
    
    //Mount Menu
    this.setHeader();
    CustomMenu.shared = this;
  }


  //Setting the header
  private setHeader(){
    
    this.menuHeaderContainer = builder.parse('<StackLayout row="0" class="container-header" id="custom-menu-header"><GridLayout columns="*,auto,*" rows="*,*"><StackLayout col="1" row="0" class="container-image"><Image src="{{thumbnail}}" /></StackLayout><StackLayout colSpan="3" row="1" class="container-user-info"><Label text="{{name}}" class="name" /><Label text="{{email}}" class="email" /></StackLayout></GridLayout></StackLayout>') as StackLayout;
    this.menuContainerGrid.addChild(this.menuHeaderContainer);
    this.menuHeaderContainer.bindingContext = this.headerData;
  }

  //Setting menu items
  private setMenuItems(items: observableArrayModule.ObservableArray<MenuItem>){

    if(this.menuItemsContainer != undefined){

      this.menuContainerGrid.removeChild(this.menuItemsContainer);
    }

    this.menuItemsContainer = builder.parse('<StackLayout row="1" class="container-body" id="custom-menu-body"></StackLayout>') as StackLayout;
  
    items.forEach((menuItem)=>{

      let hasSubmenu = menuItem.submenu.length > 0 ? true : false;
      let menuItemContainer = new StackLayout();
      menuItemContainer.className = "item";
      (menuItemContainer as any).hasSubmenu = hasSubmenu;

      let item = builder.parse('<GridLayout rows="*" columns="auto,*" class="item-option"></GridLayout>') as GridLayout;
      let icon: any;

      if(menuItem.icon.length === 4){

        icon = new Label();
        icon.text = String.fromCharCode(parseInt(menuItem.icon,16));     
      }else{

        icon = new Image();
        icon.src = menuItem.icon;
      }

      icon.className = "icon";
      icon.row = 0;
      icon.col = 0;

      let label = new Label();
      label.text = menuItem.label;
      label.row = 0;
      label.col = 1;

      item.addChild(icon);
      item.addChild(label);

      if(!hasSubmenu){

        (menuItemContainer as any).path = menuItem.path;
        menuItemContainer.on("tap",this.openPage);
      }else{

        menuItemContainer.on("tap",this.onTap);
      }

      menuItemContainer.addChild(item);

      if(hasSubmenu){

        let submenuItemsContainer = builder.parse('<StackLayout class="submenu" visibility="visible"></StackLayout>') as StackLayout;
        
        menuItem.submenu.forEach(menuItem=>{

          let submenuItemContainer = new StackLayout();
          submenuItemContainer.className = "item-sm";
          (submenuItemContainer as any).path = menuItem.path;

          let submenuItem = builder.parse('<GridLayout rows="*" columns="auto,*" class="item-option item-option-sm"></GridLayout>') as GridLayout;
          let icon: any;
          
          if(menuItem.icon.length === 4){

            icon = new Label();
            icon.text = String.fromCharCode(parseInt(menuItem.icon,16));     
          }else{
    
            icon = new Image();
            icon.src = menuItem.icon;
          }
  
          let label = new Label();
          label.text = menuItem.label;
          label.row = 0;
          label.col = 1;
  
          submenuItem.addChild(icon);
          submenuItem.addChild(label);

          submenuItemContainer.on("tap",this.openPage);
          submenuItemContainer.addChild(submenuItem);
          submenuItemsContainer.addChild(submenuItemContainer);
        });
        
        menuItemContainer.addChild(submenuItemsContainer);
      }

      this.menuItemsContainer.addChild(menuItemContainer);
    });

    this.menuContainerGrid.addChild(this.menuItemsContainer);
  }

  //Dispached when change menu data
  private changedMenuData(){
    
    let self = CustomMenu.shared;
    self.setMenuItems(self.itemsData);
    self.checkAvtiveMenuItem();
  }

  //Dispached when clicked in menu with submenu
  private onTap(args){

    // console.log("tap");
  }

  //Open a page
  private openPage(args){

    let view = args.view;
    let self = CustomMenu.shared;
    self.toggleMenuState();

    if(view.path !== self.selectedMenuItemPath){
      setTimeout(()=>{

        CustomTabView.shared.getSelectedFrame().present({
          moduleName: view.path,
          animated: false,
          clearHistory: true
        });
      },270);
    }
  }


  //Setup CssFile of main View content and mark active menu
  setup(filename: string){

    let appPath = filename.substring(filename.indexOf("/app") + 5).split(".")[0];
    let modulePath = filename.substring(0,filename.lastIndexOf("/"));
    let moduleName = filename.substring(filename.lastIndexOf("/") + 1).split(".")[0] as string;
    
    let interval = setInterval(()=>{
      if(this.mainContent != undefined){

        this.mainContent.page.on(Page.loadedEvent,this.updateScrollOfMainContent);
        this.mainContent.addCssFile(modulePath + "/"+ moduleName + ".css");

        setTimeout(()=>{

          this.opacity = 1;
        },100);
        clearInterval(interval);
      }
    },0);

    this.selectedMenuItemPath = appPath;
    this.checkAvtiveMenuItem();
    CustomMenu.shared = this;
  }

  //Update Scroll of main view
  private updateScrollOfMainContent(){

    let self = CustomMenu.shared;
    let sv = (self.mainContent as ScrollView);
    if(sv != undefined){

      sv.scrollToVerticalOffset(0,false);
    }
  }

  //Check active menu
  private checkAvtiveMenuItem(){

    let appPath = this.selectedMenuItemPath;

    if(appPath == undefined){return;}

    if(this.menuItemsContainer != undefined){

      this.menuItemsContainer.eachChild((menuContainer)=>{

        let path = (menuContainer as any).path;
        if(path != undefined && path.trim() === appPath){
  
          menuContainer.cssClasses.add("active");
          menuContainer.className = this.getCssClassesOf(menuContainer);
          
        }else{
  
          menuContainer.cssClasses.delete("active");
          menuContainer.className = this.getCssClassesOf(menuContainer);
        }
  
        if(menuContainer != undefined){
          menuContainer.eachChild(submenuItemsContainer=>{
            if(submenuItemsContainer.typeName == "StackLayout"){
              submenuItemsContainer.eachChild(submenuContainer=>{
  
                let path = (submenuContainer as any).path;
                if(path != undefined && path.trim() === appPath){
  
                  menuContainer.cssClasses.add("active");
                  menuContainer.className = this.getCssClassesOf(menuContainer);
                  submenuContainer.cssClasses.add("active-sm");
                  submenuContainer.className = this.getCssClassesOf(submenuContainer);
                }else{
  
                  submenuContainer.cssClasses.delete("active-sm");
                  submenuContainer.className = this.getCssClassesOf(submenuContainer);
                }
                return true;
              })
            }
            return true;
          }); 
        }
        return true;
      });
    }
  }

  //Get classes string of a specifc view
  private getCssClassesOf(item: ViewBase): string{

    let classesStr = "";
    item.cssClasses.forEach(className =>{classesStr += " " + className;});
    return classesStr;
  }

  //Main Content Change
  private mainContentChanged(target, oldValue, newValue){

    let self = CustomMenu.shared;
    (newValue as any).mainContent = "true";
 
      
    if(self.getChildrenCount() === 3 && oldValue != undefined){

      self.removeChild(oldValue); 
    }

    newValue.opacity = 0;
    newValue.cssClasses.add("menu-main-content-view");
    newValue.className = this.getCssClassesOf(newValue);
    self.insertChild(newValue,0);
    if((newValue as ScrollView) != undefined){

      (newValue as ScrollView).scrollToVerticalOffset(0,false);
    }
    newValue.opacity = 1;
    self.toggleMenuStateFromSwipe();
  }

  //Toggle Menu State
  public toggleMenuState(fromState: number = undefined){

    if(!this.isSetupiedMenuSideView){return;}

    let isOpen = fromState != undefined ? fromState === 0 : this.menuState === 0;

    this.menuSideView.animate({
      duration: 350,
      curve: UIEnums.AnimationCurve.linear,
      translate: {
        x: isOpen ? 0 : -this.menuSideView.getMeasuredWidth(),
        y: 0
      }
    });

    if(isOpen){

       //Close menu By Overlay View
       if(this.getChildAt(this.getChildIndex(this.customMenuOverlayContentView)) != undefined){

        this.removeChild(this.customMenuOverlayContentView);
       }
       
       this.insertChild(this.customMenuOverlayContentView,this.getChildIndex(this.menuSideView));
       this.customMenuOverlayContentView.off("touch");
       this.customMenuOverlayContentView.on("touch",this.closeMenuFromClickOverlayView);
    }

    let oldState = isOpen;

    this.customMenuOverlayContentView.animate({
      duration: 100,
      curve: UIEnums.AnimationCurve.linear,
      opacity: isOpen ? 1 : 0
    }).then(()=>{

      if(!oldState){

        this.customMenuOverlayContentView.off("touch");
        this.removeChild(this.customMenuOverlayContentView);
      }
    });

    this.menuState = isOpen ? 1 : 0;    
    CustomMenu.shared.menuState = this.menuState;    
  }

  //Toggle menu state from swipe
  private toggleMenuStateFromSwipe(){

    this.off("swipe");
    this.on("swipe",(data: SwipeGestureEventData)=>{

      if(data.direction.valueOf() === 1){

        this.toggleMenuState(0);
      }else if(data.direction.valueOf() === 2){

        this.toggleMenuState(1);
      }
    });
  }

  //Close menu from click in overlay view
  private closeMenuFromClickOverlayView(data: TouchGestureEventData){
    
    if(data.action === "down" && CustomMenu.shared.menuState === 1){

      CustomMenu.shared.toggleMenuState();
    }
  }
}



export class Header{

  name: string;
  email: string;
  thumbnail: string;

  constructor(name: string,email: string, thumbnail: string){

    this.name = name;
    this.email = email;
    this.thumbnail = thumbnail;
  }
}

//Create a menu Item
export class MenuItem{
  icon?: string;
  label?: string;
  path?: string;
  submenu?: Array<MenuItem>;

  constructor(icon?: string,label?: string,path?:string, submenu: Array<MenuItem> = []){

    this.icon = icon;
    this.label = label;
    this.path = path;
    this.submenu = submenu;
  }
}



