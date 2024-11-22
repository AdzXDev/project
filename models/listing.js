const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const review = require("./review.js")
//DEFINING SCHEMA
const listingSchema = new Schema({
 title: {
    type:String,
    required:true
 },
 description: String,
 image: {
    type:String,    //here we are setting a default value for image.
   default:"https://images.unsplash.com/photo-1710609942195-b9dab8f48fc6?q=80&w=1227&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    set:(v)=>
    v===""
    ? "https://images.unsplash.com/photo-1710609942195-b9dab8f48fc6?q=80&w=1227&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
     : v,
 },
 price: Number,
 location: String,
 country: String,
 reviews:[                 //one to many
    {
      type: Schema.Types.ObjectId,
      ref:"Review"     //reference model
    }
 ]

});

listingSchema.post('findOneAndDelete',async(listing)=>{
   if(listing){
           await Review.deleteMany({_id:{$in: listing.reviews} });
   }
});

//CREATING MODEL OF SCHEMA
const Listing = mongoose.model("Listing",listingSchema);
module.exports=Listing;