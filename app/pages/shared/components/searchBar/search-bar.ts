import * as builder from "tns-core-modules/ui/builder/builder";
import { Page, EventData } from "tns-core-modules/ui/page/page";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout/stack-layout";
import { TextField } from "tns-core-modules/ui/text-field/text-field";
import { Button } from "tns-core-modules/ui/button/button";
import { Internationalization } from "~/pages/shared/utilities/internationalization";

export class SearchBar extends StackLayout {

    public static shared: SearchBar; 

    private static searchField: TextField;
    private static searchButton: Button;
    private static searchClear: Button;

    constructor(bindingContext: any) {
        super();

        const innerComponent = builder.load(__dirname + "/search-bar.xml") as StackLayout;     

        this.addChild(innerComponent);
        this.addCssFile(__dirname + "/search-bar.css");

        SearchBar.searchField = this.getViewById("searchField") as TextField;
        SearchBar.searchButton = this.getViewById("searchButton") as Button;
        SearchBar.searchClear = this.getViewById("searchClear") as Button;

        SearchBar.searchField.on("textChange", this.onTextChangeST);       

        this.on("loaded", (args: EventData) => {

            const bindingContext = {...this.bindingContext};                          

            bindingContext.internationalization = Internationalization.singleton().getData();              
            bindingContext.onSearchSubmit = this.onSearchSubmit;
            bindingContext.onSearchClear = this.onSearchClear;
            innerComponent.bindingContext = bindingContext; 

            const text = SearchBar.searchField.text;          

            if(text != "") {               

                setTimeout(() => {                                      

                    innerComponent.page.bindingContext.search(text);               
                }, 200);         
            }
        });

        SearchBar.shared = this;
    }  

    public get onSearchSubmit(): (args: any) => void {

        return this.onSearchSubmitST;
    }

    public get onSearchClear(): (args: any) => void {

        return this.onSearchClearST;
    }
    
    private onTextChangeST(args: any) {

        const text = SearchBar.searchField.text;
        const bindingContext = args.object.page.bindingContext;

        if(text != ""){

            SearchBar.searchClear.visibility = "visible";
        } else {

            SearchBar.searchClear.visibility = "collapse";
            bindingContext.search("");
        }
    }

    private onSearchSubmitST(args: any) {
        
        const text = SearchBar.searchField.text;
        const bindingContext = args.object.page.bindingContext;

        if(args.object.id == "searchButton") {

            setTimeout(() => {

                SearchBar.searchField.dismissSoftInput();
            }, 100);
        }    

        const result = bindingContext.search(text);

        if(result == 0) { ()=>{} }
    }

    private onSearchClearST(args: any) {

        const bindingContext = args.object.page.bindingContext;

        SearchBar.searchField.text = "";
        bindingContext.searchClear();    
    }

}
