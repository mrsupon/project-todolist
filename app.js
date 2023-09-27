//jshint esversion:6

import express from "express";
import mongoose from "mongoose";

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

const i = ["Buy Food", "Cook Food", "Eat Food"];

//mongoDB using
const db = "todoList";
async function main() {
  await mongoose.connect('mongodb+srv://admin:Ss12345678@cluster0.twlafbw.mongodb.net/'+db);
  //await mongoose.connect('mongodb://127.0.0.1:27017/'+db);
}
main().catch(err => console.log(err));

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({name:"Buy Food"});
const item2 = new Item({name:"Cook Food"});
const item3 = new Item({name:"Eat Food"});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items:[itemsSchema]
};
const List = mongoose.model("List",listSchema);


app.get("/", async(req, res) =>{
  await Item.find({}).then( foundItems =>{ 
    if(foundItems.length === 0 ){
        Item.insertMany(defaultItems).then(() =>{
            console.log("Data inserted")  // Success 
        }).catch(function(error){
            console.log(error)            // Failure
        });
        res.redirect("/");
    }
    else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  }).catch(function(error){
    console.log(error)                  // Failure
  });

});

app.get("/:listName", async (req,res)=>{
  const listName = req.params.listName;
  await List.findOne({name:listName})
  .then( foundList =>{ 
    if(foundList === null ){
        const list = new List({name:listName, items:defaultItems});
        list.save().then(() =>{
            console.log("New List: "+listName+" is created." )  // Success 
        }).catch(function(error){
            console.log(error)            // Failure
        });
        res.redirect("/"+listName);
    }
    else{
        res.render("list", {listTitle: listName, newListItems: foundList.items});
    }
  })
  .catch(function(error){
    console.log(error)                  // Failure
  });  

});

app.post("/", async(req, res) =>{
  const newItem = req.body.newItem; 
  const listName = req.body.listName; 
  const item = new Item({name: newItem});

  if(listName === "Today"){
      item.save();
      res.redirect("/");
  }
  else{ 
      await List.findOne({name:listName})
      .then( foundList =>{
        foundList.items.push(item);     // Success 
        foundList.save();
        res.redirect("/"+listName);
      })
      .catch( error =>{
        console.log(error)              // Failure
      });
      
  }

});

app.post("/delete", async(req, res) =>{
  const deletingId = req.body.checkbox ;
  const listName = req.body.listName;
  if(listName === "Today"){
    await Item.findByIdAndRemove({_id:deletingId})
    .then( deletedItem =>{
      console.log("Sucessfully deleted checked item!")
      res.redirect("/");       
    })
    .catch( error=>{
      console.log(error)                  // Failure
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{ $pull: { items: { _id: deletingId } } })
    .then( foundList =>{
      res.redirect("/"+listName);
    })
    .catch( error=>{
      console.log(error) 
    });
  }
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
