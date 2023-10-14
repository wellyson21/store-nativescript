import { Observable } from "tns-core-modules/data/observable";
import { ObservableProperty } from "~/pages/shared/utilities/observable-property-decorator";

export class EProduct extends Observable implements IProduct {
  
  @ObservableProperty() public id: string;
  @ObservableProperty() public category: IProductCategory;
  @ObservableProperty() public name: string;
  @ObservableProperty() public description: string;
  @ObservableProperty() public price?: number;
  @ObservableProperty() public priceRange?: Array<number>;
  @ObservableProperty() public quantity: number;
  @ObservableProperty() public images: Array<object>;
  @ObservableProperty() public variations?: IProductVariation;

  constructor(data: IProduct = null) {
    super();

    if (data) {

      this.id = data.id;
      this.category = data.category;
      this.name = data.name;
      this.description = data.description;
      this.price = data.price;
      this.priceRange = data.priceRange;
      this.quantity = data.quantity;
      this.images = data.images;
      this.variations = data.variations;
    }
  }

}

export class EProductCategory extends Observable implements IProductCategory {

  @ObservableProperty() public id: string;
  @ObservableProperty() public name: string;
  @ObservableProperty() public backgroundImage: string;

  constructor(data: IProductCategory = null) {
    super();

    if (data) {

      this.id = data.id;
      this.name = data.name;
      this.backgroundImage = data.backgroundImage;
    }
  }

}

export interface IProduct {
  id: string;
  category: IProductCategory;
  name: string;
  description: string;
  price?: number;
  priceRange?: Array<number>;
  quantity: number;
  images: Array<any>;
  variations?: IProductVariation;
}

export interface IProductCategory {
  id: string;
  name: string;
  backgroundImage: string;
}

interface IProductVariation {
  option: Array<IProductVariationOption>;
  conbination: Array<IProductVariationCombination>;
}

interface IProductVariationOption {
  title: string;
  type: string;
  items: any;
}

interface IProductVariationCombination {
  values: any;
  quantity: number;
  price: number;
}
