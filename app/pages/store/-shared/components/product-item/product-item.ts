import * as builder from "tns-core-modules/ui/builder/builder";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout/stack-layout";
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout/grid-layout";
import { EventData } from "tns-core-modules/ui/page/page";
import { StoreAssistant } from "~/pages/store/-shared/utilities/store-assistant";
import { Internationalization } from "~/pages/shared/utilities/internationalization";

export class ProductItem extends StackLayout {

	public static shared: ProductItem;

	constructor() {
		super();

		const innerComponent = builder.load(__dirname + "/product-item.xml") as GridLayout;

		this.addChild(innerComponent);
		this.addCssFile(__dirname + "/product-item.css");

		this.on("loaded", () => {

			const bindingContext = {...this.bindingContext};
			bindingContext.internationalization = Internationalization.singleton().getData();
			bindingContext.onOpenProductDetails = this.onOpenProductDetails;
			bindingContext.onOpenProductOptions = this.onOpenProductOptions;
			innerComponent.bindingContext = bindingContext;
		});

		ProductItem.shared = this;
	}
	
	public get onOpenProductDetails(): (data: EventData) => void {

		return StoreAssistant.onOpenProductDetails;
	}

	public get onOpenProductOptions(): (data: EventData) => void {

		return StoreAssistant.onOpenProductOptions;
	}

}