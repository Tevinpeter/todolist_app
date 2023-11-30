//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemSchema = {
    name: String
};
const Item = mongoose.model("Item",itemSchema);

const item1 =new Item( {
  name:"Welcome to your to do list"
});
const item2 =new Item( {
  name:"Hit the + button to aff a new item"
});
const item3 =new Item( {
  name:"<-- hit this to delete an item"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name:String,
  items: [itemSchema]
};
const List = mongoose.model("list", listSchema) 




app.get("/", function(req, res) {

  Item.find({},function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err);
          }
          else console.log("inserted successfully");
        });
        res.redirect("/");
    }
    else{res.render("list", {listTitle: "Today", newListItems: foundItems});}

    
  });

 
});
app.get("/:customListName", function(req,res){
   let customListName = req.params.customListName;

  List.findOne({name: customListName}, function(err, foundlist)
  {
        if(!err){
          if(!foundlist){
            const list = new List({
              name: customListName,
              items: defaultItems
            });
            list.save();
            res.redirect(`/${customListName}`);
          }
        else{ res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items})};
        }
  });
  // list.save();
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item =new Item( {
    name: itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name: listName},function(err,foundList){
      if(!err){
       let arr = foundList.items
        arr.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }

    }
    );
  }});


app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId,function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("successfully removed!");
    }
  })
  res.redirect("/")
}) 

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
