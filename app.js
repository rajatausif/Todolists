const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app= express();


app.set('view engine','ejs');


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/TodolistDB",{useNewUrlParser:true});


const itemsSchema={
    name:String      
}
const Item = mongoose.model("Item",itemsSchema);


const item1 = new Item({
    name:"Welcom to your app"
});
const item2 = new Item({
    name:"Hit the + button to odd a new item"
});
const item3 = new Item({
    name:"Hit this to delete item"
});
const item4 = new Item({
    name:"Hit this to remove"
});

const defaultItems=[item1,item2,item3,item4]

const listSchema={
    name:String,
    items:[itemsSchema]
}
const List = mongoose.model("List",listSchema);

app.get('/',function(req,res){

  Item.find({},function(err,foundItems){
        if(foundItems.lenght=== 0){
        Item.insertMany(defaultItems,function(err){
    if(err){
    console.log(err);
    }else{
        console.log("Succssfully saved the item to DB. add on");
    }
});
    res.redirect("/")
    }else{
        res.render("list",{listTitle:"Today",newListItems:foundItems});
    }

    });
   
});

app.post("/",function(req,res){
    const itemName=req.body.newItem;
    const listName=req.body.list;
    const item= new Item({
    name:itemName
  });

  if(listName==="Today"){
    item.save();
  res.redirect("/") 
  }else{
    List.findOne({name:listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+ listName);
    });
  } 
});
app.post("/delete",function(req,res){
    const checkedItemId =req.body.checkbox;
    const listName=req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                console.log("successfully Delete checked items.");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name:listName},  {$pull:{items:{_id:checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }

    
});

app.get("/:customListName",function(req,res){
const customListName=_.capitalize(req.params.customListName);

List.findOne({name:customListName},function(err,foundList){
    if(!err){
        if(!foundList){
            const list = new List({                         //creating a new lists 
                name:customListName,
                items:defaultItems
            });
            list.save();
            res.redirect("/" + customListName);
        }else{
         res.render ("list",{listTitle:foundList.name,newListItems:foundList.items})                                              // showing exists list
        }
    }
});

});

app.get("/about",function(req,res) {
   res.redirect("about");
});

app.listen(3000,function(){
    console.log("sever is on at port 3000 ");
});