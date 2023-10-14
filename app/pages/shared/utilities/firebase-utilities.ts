import * as firebase from "nativescript-plugin-firebase";

interface IFirebaseUtilitiesResult{
  querySnapshot?: firebase.firestore.QuerySnapshot | firebase.firestore.DocumentSnapshot;
  entities?: Array<any> | any;
}

interface IFirebaseUtilitiesOnResultEntity{
  type?: string;
  entity?: Array<any>;
}


interface IFirebaseUtilitiesOnResultSnapshot{
  entities?: Array<IFirebaseUtilitiesOnResultEntity>;
}

export class FirebaseUtilities{

  public static async getQueryData(query: firebase.firestore.Query | firebase.firestore.CollectionReference,entityObject: any,getQuerySnapshots?: boolean): Promise<IFirebaseUtilitiesResult>{

    let map: IFirebaseUtilitiesResult = {};

    await query.get().then(docsSnapshot=>{

      let dataArr = [];

      if(getQuerySnapshots){

        map.querySnapshot = docsSnapshot;
      }

      docsSnapshot.docs.forEach(docSnapshot=>{

        let entity = new entityObject();
        let data = docSnapshot.data();
        entity.id = docSnapshot.id;
        
        for(let key in data){
  
          entity[key] = data[key];
        }
        dataArr.push(entity);
      });

      map.entities = dataArr;
    });

    return await new Promise<IFirebaseUtilitiesResult>((resolve)=>{

      resolve(map);
    });
  }

  public static async getDocData(document: firebase.firestore.DocumentReference,entityObject: any): Promise<IFirebaseUtilitiesResult>{

    let map: IFirebaseUtilitiesResult = {};

    await document.get().then(docSnapshot=>{   
      
      if(docSnapshot.exists){

        map.querySnapshot = docSnapshot;
        let entity = new entityObject();
        entity.id = docSnapshot.id;
        let data = docSnapshot.data();
        for(let key in data){

          entity[key] = data[key];
        }

        map.entities = entity;
      }
    });

    return await new Promise<IFirebaseUtilitiesResult>((resolve)=>{

      resolve(map);
    });
  }

  public static getOnSnapshotData(query: firebase.firestore.Query | firebase.firestore.CollectionReference,entityObject: any,callback: (data: IFirebaseUtilitiesOnResultSnapshot)=> void,getQuerySnapshots?: boolean): Promise<IFirebaseUtilitiesResult>{

    query.onSnapshot(result=>{

      let map: IFirebaseUtilitiesOnResultSnapshot = {
        entities: []
      };

      result.docChanges().forEach(docC=>{

        let resultObj: IFirebaseUtilitiesOnResultEntity = {};
        let entity = new entityObject();
        let data = docC.doc.data();


        resultObj.type = docC.type;
        entity.id = docC.doc.id;
        for(let key in data){
  
          entity[key] = data[key];
        }

        resultObj.entity = entity;
        map.entities.push(resultObj);
      });

      callback(map);
    },(e)=>{

      console.log("************ firebase fetch data error **************");
      console.log(e);
    });

    return;
  }

  public static getDocOnSnapshotData(query: firebase.firestore.DocumentReference,entityObject: any,callback: (data: IFirebaseUtilitiesOnResultSnapshot)=> void,getQuerySnapshots?: boolean): Promise<IFirebaseUtilitiesResult>{

    query.onSnapshot(result=>{

      let map: IFirebaseUtilitiesOnResultSnapshot = {
        entities: []
      };

      if(!result.exists){

        callback(map);
        return;
      }

      let doc = result.ref;
      let resultObj: IFirebaseUtilitiesOnResultEntity = {};
      let entity = new entityObject();
      let data = result.data();

      resultObj.type = "docChange";
      entity.id = doc.id;

      for(let key in data){

        entity[key] = data[key];
      }

      resultObj.entity = entity;
      map.entities.push(resultObj);

      callback(map);
    });
    return;
  }
  
}