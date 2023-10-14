import { fromObject } from "tns-core-modules/data/observable/observable";
import { ObservableProperty } from "./observable-property-decorator";
import { FirebaseUtilities } from "./firebase-utilities";
import { firestore } from "nativescript-plugin-firebase";
import { ESettings } from "./-entities/entities";
import * as applicatonSettings from "tns-core-modules/application-settings";

export class Internationalization {

  private static _singleton: Internationalization;
  public static singleton(): Internationalization {

    if(Internationalization._singleton === undefined){

      Internationalization._singleton = new Internationalization();
    }

    return Internationalization._singleton;
  }


  private constructor(){

    let it = setInterval(()=>{
      if(applicatonSettings.getBoolean("isFirebaselogged",false)){

        FirebaseUtilities.getOnSnapshotData(firestore.collection("Settings"),ESettings,(result)=>{

          if(result.entities.length > 0){
    
            (result.entities).forEach(obj=>{
    
              let settings = (obj.entity as any as ESettings);
    
              this.data.en["_settings"]["currency"] = settings.paypal.currency;
              this.data.pt["_settings"]["currency"] = settings.paypal.currency;
    
              this.data.en.notifyPropertyChange("_settings",this.data.en["_settings"]);
              this.data.pt.notifyPropertyChange("_settings",this.data.pt["_settings"]);
            });
    
          }
        });
        clearInterval(it);
      }
    });

  
  }

  public getData(): any{

    return this.data.pt;
  }

  private data = {
    en: fromObject({
      login: {
        headerTitle: "Access and enjoy the news",
        loaderLabel: "Wait a momnet..",
        alternativeLoginLabel: "Or access with",
        formHints: {
          email: "Email",
          password: "Password"
        },
        formButtons: {
          login: "Login",
          register: "Register Now"
        }
      },
      register: {
        headerTitle: "Register",
        loaderLabel: "Wait a momnet..",
        formHints: {
          name: "Name",
          phone: "Phone",
          email: "Email",
          confirmPassword: "Confirm Password",
          password: "Password"
        },
        formButtons: {          
          register: "Register"
        }
      },
      cards: {
        CardsPageTitle: "Cards",
        CardDetailsPageTitle: "My Point Cards",
        PromotionsPageTitle: "Promotions",
        PromotionDetailsPageTitle: "Promotion Details",
        
        expireLabel: "Expire on: ",
        createInLabel: "Created in: ",
        codeLabel: "Code: ",
      
        neddedPointsLabel: "Needed Points: ",
        unsubscribeButton: "Unsubscribe",
        subscribeButton: "Subscribe",

        menu:{
          cards: "Cards",
          promotions: "Promotions",
          tickets: "Tickets"
        },
        
        placeholders:{
          cards: {  
            title: "You do not have any active cards yet.",
            subtitle: "To get a card you must subscribe to one of our promotions.",
            button: "Check our promotions"
          },
          promotions: {
            title: "No promotion available at this time."
          },
          tickets:{
            title: "You do not have tickets yet",
            subtitle: "Fill in cards to generate tickets."
          },
          login: {
            title: "You are not logged in yet",
            subtitle: "To use this service make login or register",
            button: "Login"
          }
        },

        alerts: {
          noPointsToCapture: "You have no points to capture.",
          pointsCatured: "Points Captureds with success.",
          pointsNotCatured: "Error in the points capture, Please try again.",          
          ticketDown: "Ticket exchange realized with success.",
          ticketNotDown: "Error in the ticket exchange, please try again.",
          promotionExpired: "A promotion has expired, your points was be realocked."
        }
      },
      notifications: {
        NotificationsPageTitle: "Notifcations",
        NotificationDetailsPageTitle: "Notificatioin Details",
        searchHint: "Search notification",
        
        date: {
          today: "Today",
          months: ["January","February","March","April","May","June","July","August","September","October","November","December"]
        },

        placeholder: "You do not have any notifications yet."
      },
      store: {
        StorePageTitle: "Store",
        CartPageTitle: "Cart",
        ConfirmationPageTitle: "Confirmation",
        ProductDetailsPageTitle: "Product Details",
        ProductOptionsPageTitle: "Product Options",
        OrderListPageTitle: "Order List",
        OrderDetailsPageTitle: "Order Items",
        ProductCategoriesPageTitle: "Products Categories",
        ProductsSearchPageTitle: "Products Search",
        PaymentPageTitle: "Payment",

        available: "Available",
        units: "Units",
        buyButton: "Buy",

        addCartSuccessfully: "Product added to cart.\nYou wish?",
        goToCart: "Go to cart",
        keepBuying: "Keep buying",

        deliveryAddress: "Delivery Address",
        checkRequest: "Check Request",
        changeAddress: "Change Address",
        total: "Total",
        quantity: "Quantity",
        price: "Price",
        subtotal: "Subtotal",
        send: "Send",
        confirmButton: "Confirm",

        unitsAvailable: "units available",
        continueButton: "Continue",

        loaderLabel: "Wait a moment..",

        purchaseValue: "Purchase value",
        choosePaymentMethod: "Choose a payment method:",

        modal: {
          title: "Product addeed to cart.\nYou wish?",
          optionOne: "Go to cart",
          optionsTwo: "Keep buying"
        },

        searchCategories: "Search categories",
        searchProducts: "Search products",

        placeholders: {
          cart: "You have no items in your cart.",
          login: {
            title: "You are not logged in yet",
            subtitle: "To use this service make login or register",
            button: "Login"
          }
        }
      },
      account: {
        AccountPageTitle: "Account",

        address: "Address",
        phone: "Phone",
        password: "Password",
        noDataLabel: "No available address information."
      },
      more: {
        AboutTitle: "About Us",
        LocationTitle: "Our location",
        ContactsTitle: "Our contacts"
      },
      information: {
        AboutTitle: "About Us",
        LocationTitle: "Our location",
        ContactsTitle: "Our contacts",
        MainTitle: "Establishments",

        city: "City",
        country: "Country",
        postalCode: "Postal Code",
        line: "Line",
        socialNetworks: "Social Networks",
        traditional: "Traditionals",

        searchPlaceholder: "Search Establishments...",

        placeholders:{
          main:{
            title: "There are no stores at the moment."
          }
        }
      },
      _settings: {
        currency: {
          name: "USD",
          symbol: "$"
        }
      }
    }),

    pt: fromObject({
      login: {
        headerTitle: "Acesse e aproveite as novidades.",
        loaderLabel: "Aguarde um momento..",
        alternativeLoginLabel: "Ou acesse com",
        formHints: {
          email: "E-mail",
          password: "Senha"
        },
        formButtons: {
          login: "Acesse",
          register: "Cadastre-se"
        }
      },
      register: {
        headerTitle: "Cadastre-se",
        loaderLabel: "Aguarde um momento..",
        formHints: {
          name: "Nome",
          phone: "Telefone",
          email: "E-mail",
          password: "Senha",
          confirmPassword: "Confirmar Senha"
        },
        formButtons: {          
          register: "Cadastrar"
        }
      },
      cards: {
        CardsPageTitle: "Cartões",
        CardDetailsPageTitle: "Meu Cartão",
        PromotionsPageTitle: "Promoções",
        PromotionDetailsPageTitle: "Detalhes da Promoção",
      
        expireLabel: "Expira em: ",
        createInLabel: "Criado em: ",
        codeLabel: "Código: ",
        
        neddedPointsLabel: "Pontos necessários: ",
        unsubscribeButton: "Cancelar registro",
        subscribeButton: "Inscrever-se",
        
        menu:{
          cards: "Cartões",
          promotions: "Promoções",
          tickets: "Tickets"
        },

        placeholders: {
          cards: {
            title: "Você ainda não possui cartões ativos",
            subtitle: "Para obter um cartão você deve se inscrever em uma de nossas promoções.",
            button: "Confira nossas promoções"
          },
          promotions: {
            title: "Nenhuma promoção disponivel no momento."
          },
          tickets: {
            title: "Você ainda não possui tickets",
            subtitle: "Preencha cartões para gerar tickets."
          },
          login: {
            title: "Você ainda não está logado",
            subtitle: "Para usar esse serviço faça login ou registre-se.",
            button: "Acessar"
          }
        },

        alerts: {
          noPointsToCapture: "Voçê não tem pontos para capturar.",
          pointsCatured: "Pontos capturados com sucesso.",
          pointsNotCatured: "Erro ao capturar pontos, por favor tente novamente.",
          ticketDown: "Troca do ticket realizada com sucesso.",
          ticketNotDown: "Erro na troca do ticket, por favor tente novamente.",
          promotionExpired: "Uma promoção expirou, seus pontos foram realocados."
        }
      },
      notifications: {
        NotificationsPageTitle: "Notificações",
        NotificationDetailsPageTitle: "Detalhes da Notificação",
        searchHint: "Pesquisar notificação",

        date: {
          today: "Hoje",
          months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
        },

        placeholder: "Você ainda não possui notificações."
      },
      store: {
        StorePageTitle: "Loja",
        CartPageTitle: "Carrinho",
        ConfirmationPageTitle: "Confirmação",
        ProductDetailsPageTitle: "Detalhes do Produto",
        ProductOptionsPageTitle: "Opções do produto",
        OrderListPageTitle: "Lista de pedidos",
        OrderDetailsPageTitle: "Items do pedido",
        ProductCategoriesPageTitle: "Categorias de Produtos",
        ProductsSearchPageTitle: "Pesquisa de Produtos",
        PaymentPageTitle: "Pagamento",

        available: "Disponíveis",
        units: "Unidades",
        buyButton: "Comprar",

        addCartSuccessfully: "Produto adicionado ao carrinho.\nVocê deseja?",
        goToCart: "Ir ao carrinho",
        keepBuying: "Continuar comprando",

        deliveryAddress: "Endereço de Entrega",
        checkRequest: "Conferir Pedidos",
        changeAddress: "Alterar Endereço",
        total: "Total",
        quantity: "Quantidade",
        price: "Preço",
        subtotal: "Subtotal",
        send: "Envio",
        confirmButton: "Confirmar",

        unitsAvailable: "unidades disponívels",
        continueButton: "Continuar",

        loaderLabel: "Aguarde um momento..",

        purchaseValue: "Valor da compra",
        choosePaymentMethod: "Escolha um método de pagamento",

        modal: {
          title: "Produto adicionado ao carrinho.\nVocê deseja?",
          optionOne: "Ir ao carrinho",
          optionsTwo: "Continuar comprando"
        },

        searchCategories: "Buscar categorias",
        searchProducts: "Buscar produtos",

        placeholders: {
          cart: "Você não possui itens no carrinho.",
          login: {
            title: "Você ainda não está logado",
            subtitle: "Para prosseguir faça login ou registre-se.",
            button: "Acessar"
          }
        }
      },
      account: {
        AccountPageTitle: "Conta",

        address: "Endereço",
        phone: "Telefone",
        password: "Senha",
        noDataLabel: "Não há informação de endereço disponível."
      },
      more: {
        AboutTitle: "Sobre nós",
        LocationTitle: "Nossa localização",
        ContactsTitle: "Nossos contatos"
      },
      information: {
        AboutTitle: "Sobre nós",
        LocationTitle: "Nossa localização",
        ContactsTitle: "Nossos contatos",
        MainTitle: "Estabelecimentos",

        city: "Cidade",
        country: "Pàís",
        postalCode: "Código Postal",
        line: "Linha",
        socialNetworks: "Redes Sociais",
        traditional: "Tradicionais",


        searchPlaceholder: "Pesquise estabelecimentos...",

        placeholders:{
          main:{
            title: "Não há Estabelecimentos no momento."
          }
        }
      },
      _settings: {
        currency: {
          name: "BRL",
          symbol: "R$"
        }
      }
    })
  };

}