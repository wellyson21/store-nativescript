import { Page,View } from "tns-core-modules/ui/page/page";
import { Frame, EventData, NavigationEntry, BackstackEntry, PercentLength } from "tns-core-modules/ui/frame";
import { GridLayout, ItemSpec, GridUnitType } from "tns-core-modules/ui/layouts/grid-layout/grid-layout";
import * as builder from "tns-core-modules/ui/builder";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout/stack-layout";
import { CardsViewModel } from "../main/cards-view-model";
import { Image } from "tns-core-modules/ui/image/image";
import { ECard } from "../-entities/entities";
import { fromObject } from "tns-core-modules/data/observable/observable";
import { CardDetailsViewModel } from "./details-view-model";
import { CardsModel } from "../-models/cards-model";
import { ITicket } from "../-entities/entities-interfaces";
import { TicketsModel } from "../-models/tickets-model";
import { ESFrame } from "~/pages/shared/utilities/esframe";
import {AnimationCurve} from "tns-core-modules/ui/enums";
import { CardsPage } from "../main/cards-page";
import { Button } from "tns-core-modules/ui/button";
import * as applicationSettings from "tns-core-modules/application-settings";
import { General } from "~/pages/shared/utilities/general";

export class CardDetailsPage{

  static page: Page;
  private static cardData: ECard;
  private static cardsModel: CardsModel = CardsModel.singleton();
  private static acumulatedPoints: number;

  static onLoaded(args){

    let page = args.object as Page;
    let view = page.layoutView as View;
    let self = CardDetailsPage;
    let bindingContext =  new CardDetailsViewModel();

    self.page = page;
    self.cardsModel.getAcumulatedPoints().then(points=>{

      self.acumulatedPoints = points;
    });

    self.cardData = page.navigationContext as ECard;
  
  
    bindingContext.setCardData(CardDetailsPage.cardData);
    page.bindingContext = bindingContext;

    self.setupCreateTicketButtonVisibility();
    self.setupFillCardButtonVisivility();

    setTimeout(() => {

      self.listPoints();
    }, 0);
    
  }

  //Setup createTicketdButton visibility
  private static setupCreateTicketButtonVisibility(){
    let createTicketButton = (CardDetailsPage.page.layoutView as View).getViewById("create-ticket") as Button;

    if(CardDetailsPage.cardData.myPoints == CardDetailsPage.cardData.totalPoints){

      createTicketButton.visibility = "visible";
    }else{

      createTicketButton.visibility = "collapse";
    }
  }

  //Setup fillCardButton visibility
  private static setupFillCardButtonVisivility(){

    let fillCardsButton = (CardDetailsPage.page.layoutView as View).getViewById("fill-card") as Button;
    if(CardDetailsPage.cardData.myPoints == CardDetailsPage.cardData.totalPoints){

      fillCardsButton.visibility = "collapse";
    }else{

      fillCardsButton.visibility = "visible";
    }
  }

  //Event Handlers
  static onTapCoin(data: EventData){

    let view = (data.object as StackLayout);
    let isChecked: boolean;
    let self = CardDetailsPage;

    if(self.acumulatedPoints == 0){return;}

    //Toggle coin state
    if(view.cssClasses.has("enabled")){

      let image = (view.getChildAt(0) as Image);
      image.className = "disabled";
      image.src = "res://close";
      view.className = "disabled";
      isChecked = false;
      (view as any).status = false;
    }else{

      let image = (view.getChildAt(0) as Image);
      image.className = "enabled";
      image.src = "~/assets/images/coin.png";
      view.className = "enabled";
      (view as any).status = true;
      isChecked = true;
    }

    //Update Binding Context
    let bindingContext =  Object.create(self.page.bindingContext) as CardDetailsViewModel;
    let currentPoints = isChecked ? new Number(self.cardData.myPoints).valueOf() + 1 : self.cardData.myPoints - 1;
    let acumulatedPoints = isChecked ? self.acumulatedPoints - 1 : self.acumulatedPoints + 1;
    
    self.cardData.myPoints = currentPoints;
    self.acumulatedPoints = acumulatedPoints;
  
    bindingContext.setCardData(self.cardData);
    bindingContext.acumulatedPoints = acumulatedPoints;

    self.page.bindingContext = bindingContext;
    CardDetailsPage.cardData = self.cardData;

    //Seup action Button visibility
    let saveCardButton = (self.page.layoutView as View).getViewById("save-card") as Button;
    saveCardButton.visibility = "visible";

    self.setupCreateTicketButtonVisibility();
    self.setupFillCardButtonVisivility();
  }

  //Save Changes in Card
  static onSaveCard(data: EventData){

    if(!General.checkConnection()) { return; }

    CardDetailsPage.cardsModel.updateCardAndAcumulatedPoints(CardDetailsPage.cardData,CardDetailsPage.acumulatedPoints);
    let saveCardButton = (CardDetailsPage.page.layoutView as View).getViewById("save-card") as Button;
    saveCardButton.visibility = "collapse";
  }

  //Create Tiket and show all tickets
  static onCreateTicket(data: EventData){

    if(!General.checkConnection()) { return; }

    if(CardDetailsPage.cardData == undefined){return;}

    if(CardDetailsPage.cardData.myPoints != CardDetailsPage.cardData.totalPoints){return;}

    let view = (data.object as StackLayout);
    view.isEnabled = false;

    let ticket: ITicket = {
      code: "T"+ new Date().getTime(),
      createDate: new Date(),
      profileId:  applicationSettings.getString("userId","").trim(),
      promotionId: CardDetailsPage.cardData.promotionId
    };

    CardDetailsPage.cardData.myPoints = 0;
    CardDetailsPage.cardsModel.updateCardAndAcumulatedPoints(CardDetailsPage.cardData,CardDetailsPage.acumulatedPoints);

    let ticketsModel = TicketsModel.singleton();

    ticketsModel.createTicket(ticket).then(status=>{});
  
    setTimeout(()=>{
      view.isEnabled = true;
      (CardDetailsPage.page.frame as ESFrame).present({
        moduleName: "pages/cards/tickets/tickets-page",
        clearHistory: true,
        animated: false
      });
    },1000);
    
  }

  //Try card fill
  static onFillCard(){

    if( CardDetailsPage.cardData.myPoints ==  CardDetailsPage.cardData.totalPoints){

      return;
    }


    let view = CardDetailsPage.page.layoutView as View;
    let cardPointsGrid = view.getViewById("card-points-grid") as GridLayout;
    let acumulatedPoints = CardDetailsPage.acumulatedPoints;
    let points = 0;
    
    cardPointsGrid.eachChild(point=>{
      if((point as any).status === false && acumulatedPoints > 0){

        let image = ((point as StackLayout).getChildAt(0) as Image);
        point.className = "enabled";
        image.className = "enabled";
        image.src = "~/assets/images/coin.png";
        (point as any).status = true;
        acumulatedPoints--;
        points++;
      }
      return true;
    });

    let bindingContext = Object.create(CardDetailsPage.page.bindingContext) as CardDetailsViewModel;
    let cardData = CardDetailsPage.cardData;
    cardData.myPoints = cardData.myPoints + points;
    bindingContext.acumulatedPoints = acumulatedPoints;
    bindingContext.setCardData(cardData);

    CardDetailsPage.page.bindingContext = bindingContext;
    CardDetailsPage.acumulatedPoints = acumulatedPoints;
    CardDetailsPage.cardData = cardData;

    if(cardData.myPoints == cardData.totalPoints){

      //Seup action Button visibility
      let fillCardsButton = (CardDetailsPage.page.layoutView as View).getViewById("fill-card") as Button;
      fillCardsButton.visibility = "collapse";
        
      let saveCardButton = (CardDetailsPage.page.layoutView as View).getViewById("save-card") as Button;
      saveCardButton.visibility = "visible";

      CardDetailsPage.setupCreateTicketButtonVisibility();
    }
  }


  //UIMount
  private static async listPoints(){

    let cardsModel = CardsModel.singleton();
    let view = CardDetailsPage.page.layoutView as View;
    let cardPointsGrid = view.getViewById("card-points-grid") as GridLayout;
    cardPointsGrid.removeRows();

    for(let i = 0, columnCount = 0,rowCount = 0;i < CardDetailsPage.cardData.totalPoints;i++){

      let isSelected = i < CardDetailsPage.cardData.myPoints;

      if(columnCount === 0){

        cardPointsGrid.addRow(new ItemSpec(0,GridUnitType.AUTO));
      }

      let coinImage = isSelected ? "~/assets/images/coin.png" : "res://close";
      let point = builder.parse(`<StackLayout class="point" tap="{{ onTapCoin }}" row="${rowCount}" col="${columnCount}"><Image src="${coinImage}" /></StackLayout>`) as StackLayout;
      (point as any).status = isSelected;
      cardPointsGrid.addChild(point);

      point.className = isSelected ? "enabled" : "disabled";
      ((point as StackLayout).getChildAt(0) as View).className = isSelected ? "enabled" : "disabled";

      point.on(StackLayout.layoutChangedEvent,(data: EventData)=>{

        let view = data.object as StackLayout;
        view.borderRadius = `${view.getMeasuredWidth()}px`;
        (view.getChildAt(0) as View).borderRadius = `${view.getMeasuredWidth()}px`;       
      });

      if(columnCount === 3){

        columnCount = 0;
        rowCount++;
      }else{

        columnCount++;
      }
    }

    CardDetailsPage.page.bindingContext.isLoading = false;

  }
}


exports.onLoaded = CardDetailsPage.onLoaded;
exports.onTapCoin = CardDetailsPage.onTapCoin;
exports.onSaveCard = CardDetailsPage.onSaveCard;
exports.onCreateTicket = CardDetailsPage.onCreateTicket;
exports.onFillCard = CardDetailsPage.onFillCard;