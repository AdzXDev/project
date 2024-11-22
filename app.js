const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing =  require("./models/listing.js"); //requiring listing model 
const path  = require('path');
const MONGO_URL='mongodb://127.0.0.1:27017/wanderlust';
const methodOverride = require("method-override");
const ejsMate= require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError= require("./utils/ExpressError.js");
const{listingSchema,reviewSchema}= require("./schema.js") //for joi server side validation i.e requiring joi schema
const Review=  require("./models/review.js"); //requiring review model

main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);

}

app.set("view engine",'ejs');
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));//to parse data came in the req
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));//for static folder

app.listen(8080,()=>{
  console.log("server is listening to port 8080");
});

app.get("/",(req,res)=>{
    res.send("hi i am root");
});

//function for listing validation (server-side) using joi
const validateListing= (req,res,next)=>{
    let {error}=listingSchema.validate(req.body); 
    if(error)
    {    
        let errMsg= error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}

//function for review validation (server-side) using joi
const validateReview= (req,res,next)=>{
    let {error}=reviewSchema.validate(req.body); 
    if(error)
    {    
        let errMsg= error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}



// Index Route
app.get("/listings",wrapAsync(async(req,res)=>{
   const allListings= await Listing.find({});
    res.render("listings/index.ejs",{allListings});
    }));
    
    
// New Route
 app.get("/listings/new",(req,res)=>{
           res.render("listings/new.ejs");
    });
// Show Route

app.get("/listings/:id",wrapAsync(async(req,res)=>{
     let {id} = req.params;
  const  listing= await Listing.findById(id).populate("reviews");
  res.render("listings/show.ejs",{listing});
}));


//Create Route

app.post("/listings",validateListing,wrapAsync(async(req,res,next)=>{
   //extracting from form 
//    let{title,description,image,price,location,country}=req.body;
//    let listing = req.body;

 //it means they are send listing post req but not data about listing
 //400 means bad request.
  
    const newListing= new Listing (req.body.listing); //module instance
    await newListing.save();
    res.redirect("/listings");


})
);

// Edit Route

app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const  listing= await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});

}));

//Update Route
app.put("/listings/:id",validateListing,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});//deconstructing  the js object i.e listing which has every parameters
    res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));


//Reviews 
//Post Route Review
                                //validateReview middleware
app.post("/listings/:id/reviews",validateReview ,wrapAsync(async (req,res)=>{
   
  let listing= await Listing.findById(req.params.id) //accessing listing by id
  //module instance 
  //when form will be submited-> review object passed to backend
  let newReview = new Review(req.body.review);
  
  listing.reviews.push(newReview);
  await  newReview.save();
  await listing.save();     //await bcoz as save() asynchronous func

  res.redirect(`/listings/${listing._id}`);
}));

//Delete Review Route

app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
 
 let {id,reviewId}= req.params;
 await Listing.findByIdAndUpdate( id,{$pull:{reviews:reviewId}} )
 await Review.findByIdAndDelete(reviewId);
 res.redirect(`/listings/${id}`);
}));


//* means the route which are not defined by us.
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"))
})

//middleware
app.use((err,req,res,next)=>{
    let{statusCode=500,message="something went wrong"}=err;
     res.status(statusCode).render("error.ejs",{err});
    //  res.status(statusCode).send(message);
});










// app.get("/testlisting",async(req,res)=>{
//     // let sampleListing = new Listing({
//     //     title:"My New Villa",                //creating document
//     //     description:" By the mountains ",
//     //     price:1200,
//     //     location:"Kochi,Kerela ",
//     //     Country:"India"        
//     // })
//     // await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing")
// });


