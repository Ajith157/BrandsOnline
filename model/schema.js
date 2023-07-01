const mongoose = require('mongoose')


const userschema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    wallet: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phonenumber: {
        type: Number,
        required: true,
        unique: true,
    },
    blocked:{
        type:Boolean,
        default:false
    }


    
        }
    )
    const adminSchema = new mongoose.Schema({
        email:{
            type: String
        },
        password:{
            type: String
        }
    })

    const productSchema = new mongoose.Schema({
        name:{
            type:String,required:true,
        },
        brand:{
            type:String,required:true,
        },
        description:{
            type:String,required:true,
        },
        price:{
            type:Number,required:true,
        },
        quantity:{
            type:Number,required:true,
        },
        category:{
            type:String,required:true,
        },
        discountedPrice: {
            type: Number,
            default: 0
          },
        img:{
            type:Array,required:true,
        }
    })
    const categorySchema = new mongoose.Schema({
        category: {
          type: String,
        },
        sub_category: {
          type: Array,
        },
      });

    const cartSchema=new mongoose.Schema({
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        },
        cartItems:[
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
                quantity: { type: Number, default: 1 },
                price: { type: Number },
            },
        ]

    });
    const orderSchema = new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
      
        orders: [
            {
                fname: { type: String },
                lname: { type: String },
                phone: { type: Number },
                paymentMethod: { type: String },
                paymentStatus: { type: String },
                totalPrice: { type: Number },
                totalQuantity: { type: Number },
                productDetails: { type: Array },
                shippingAddress: { type: Object },
                paymentMethod: String,
                status: {
                    type: Boolean,
                    default: true
                },
                paymentType: String,
                createdAt: {
                    type: Date,
                    default: new Date()
                },
                orderConfirm: { type: String, default: "ordered" }
            }
        ]
      })
      const addressSchema = new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
      
        Address: [
            {
                fname: { type: String },
                lname: { type: String },
                street: { type: String },
                appartment: { type: String },
                city: { type: String },
                state: { type: String },
                zipcode: { type: String },
                phone: { type: String },
                email: { type: String }
            }
        ]
      
      })
      const wishListSchema = new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        wishList: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'product'
                },
    
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    })

    const couponSchema = new mongoose.Schema({
        couponCode: {
            type: String
        },
        validity: {
            type: Date,
            default : new Date
         },
         minAmount : { type : Number },
         minDiscountPercentage : { type : Number },
         maxDiscountValue : { type : Number},
         description : { type : String},
         createdAt : {
            type : Date,
            default : new Date
         }
    
    })
    const bannerSchema = new mongoose.Schema({
        title: {
            type: String
        },
        image: {
            type: String
        },
        description: {
            type: String
        },
        createdAt: {
            type: Date,
            default: new Date()
        },
        updatedAt: {
            type: Date
        }
    })
    
    

 
    
    module.exports = {
        user: mongoose.model("user", userschema),
        admin:mongoose.model("admin",adminSchema),
        product:mongoose.model("products",productSchema),
        Category:mongoose.model("category",categorySchema),
        Cart:mongoose.model("cart",cartSchema),
        Address :mongoose.model('address',addressSchema),
        Order : mongoose.model('order',orderSchema),
        Wishlist: mongoose.model('wishlist', wishListSchema),
        Coupon : mongoose.model('coupon', couponSchema),
        Banner : mongoose.model('banner',bannerSchema)

        
    }