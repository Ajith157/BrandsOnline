const { response } = require('../app');
const cartHelper=require('../helpers/cartHelper')
const orderHelper=require('../helpers/orderHelper')
const couponHelper=require('../helpers/couponHelper')



module.exports={
    // GET ADDDRESS
    getAddress:async(req,res)=>{
        
        try {
            var count = null
      
        let user  = req.session.user
        let userId=req.session.user[0]._id;
     
        if (user)
        {
            var count = await cartHelper.getCartCount(userId)
          
            let address = await orderHelper.getAddress(userId)
            
            let orders = await orderHelper.getOrders(userId)
          
           
            res.render('users/profile',{user , count , address ,orders})
        

            
        }
            
        } catch (error) {
            res.render("users/catchError",{message:error.message})
            
        }
    },

    getLastOrder:async(req,res)=>{
       
        try {
            var count = null
      
            let user  = req.session.user
            let userId=req.session.user[0]._id;
         
            if (user)
            {
                
                let orders = await orderHelper.getOrders(userId)
              
                const lastorder = orders.orders.pop()
               
    
                res.render('users/ordersuccessstatus',{user , count  ,lastorder})
            
    
            }
            
        } catch (error) {
            res.render("users/catchError",{message:error.message})

            
        }
    },
    // POST CHECKOUT
    postAddress:(req,res)=>{
        
        let data=req.body;
        let userId=req.session.user[0]._id;
      
        orderHelper.postAddress(data,userId).then((response)=>{
            res.send(response)
        })
    },

    // GET EDIT ADDRESS
    getEditAddress:(req,res)=>{
        try {
            console.log(req.session.user[0].id,'vvvvvvvvvvvvvv');
            
            let userId=req.session.user[0].id
        
            let addressId=req.params.id
           
    
            orderHelper.getEditAddress(addressId,userId).then((currentAddress)=>{
              
                res.send(currentAddress)
            })
            
        } catch (error) {
            res.render("users/catchError",{message:error.message})
            
        }
    },

    //   PATCH EDIT ADDRESS
      patchEditAddress:(req,res)=>{
          try {
            let addressId = req.params.id
            let userId = req.session.user[0]._id
            let userData = req.body
            orderHelper.patchEditAddress(userId,addressId,userData).then((response)=>{
                res.send(response)
            })
            
        } catch (error) {
            res.render("users/catchError",{message:error.message})
            
        }
    },
//    DELETE ADDRESS
    deleteAddress:(req,res)=>{
        console.log(req.session.user[0]._id,'9999999999999999');
      
        let userId = req.session.user[0]._id
        let addressId = req.params.id
        orderHelper.deleteAddress(userId,addressId).then((response)=>{
            res.send(response)
        })
    },
    // GET CHECKOUT
    getcheckOut:async(req,res)=>{
     
                   
        try {
            let userId=req.session.user[0]._id;
            console.log(req.session.user[0]._id,'useruseruser');
            let user=req.session.user;
           
            let total=await orderHelper.totalCheckOutAmount(userId)
            let count=await cartHelper.getCartCount(userId)
            let address=await orderHelper.getAddress(userId)
            let coupon=await couponHelper. getCouponList()
            
    
            cartHelper.getCartItems(userId).then((cartItems)=>{
                console.log(userId,'hhhhhhhh');
                console.log(cartItems,'kkkkkkkkkkkkkkkkkk');
                 res.render('users/checkout',{user,cartItems,total,count,address,coupon})
            })
            
        } catch (error) {
            res.render("users/catchError",{message:error.message})
            
        }
    },
    // POST CHECKOUT 

    postCheckout: async (req, res) => {
        console.log(req.body, 'body');
        try {
            let userId = req.session.user[0]._id
            let data = req.body;
            let total = data.discountedAmount
            let couponCode = data.couponCode
            
            await couponHelper.addCouponToUser(couponCode, userId)
            try {
                const response = await orderHelper.placeOrder(data);
               
                if (data.payment_option === "COD") {
                    res.json({ codStatus: true });
                } else if (data.payment_option === "razorpay") {
                    const order = await orderHelper.generateRazorpay(req.session.user[0]._id, total);
                    console.log(order, ';;');
                    res.json(order);
                } else if (data.payment_option === 'wallet') {
                    
                    res.json({ orderStatus: true, message: 'order placed successfully' })
                }
            } catch (error) {
              
            
                res.render("users/catchError",{message:error.message})
            }
        } catch (error) {
            res.render("users/catchError",{message:error.message})
        }
    },



    verifyPayment: (req, res) => {
        orderHelper.verifyPayment(req.body).then(() => {
          orderHelper
            .changePaymentStatus(req.body["order[receipt]"])
            .then(() => {
              res.json({
                status: true,
                orderId: req.body["order[receipt]"],
                addresId: req.body["order[notes][address]"],
              });
            })
            .catch((err) => {
                res.render("users/catchError",{message:error.message})
            });
        });
      },
   
    
    orderDetails:async(req,res)=>{
        
        try {
            let user =req.session.user[0]._id;
          
            let count =await cartHelper.getCartCount(user._id)
            let userId=req.session.user;
            let orderId=req.params.id;
          
            orderHelper.findOrder(orderId,user).then((orders)=>{
             
                orderHelper.findAddress(orderId,user).then((address)=>{
                    
                   orderHelper.findProduct(orderId,user).then((product)=>{
    
                  let data= orderHelper.createData(orders,product,address)
                    
                   
                        res.render('users/orderDetails',{user,count,product,address,orderId,orders,data})
                    })
                })
            })
            
        } catch (error) {
            res.render("users/catchError",{message:error.message})
            
        }
    },

    // ORDER CANCEL
    cancelOrder:(req,res)=>{
    
        let orderId=req.query.id;
        
        let total=req.query.id;
        let userId=req.session.user[0]._id;
       
      
       orderHelper.cancelOrder(orderId).then((canceled)=>{
        orderHelper.addWallet(userId,total).then((walletStatus)=>{
            
            res.send(canceled)
        })
            
        })
    },
    // RETURN ORDER
    returnOrder:(req,res)=>{
     
            let orderId=req.query.id;
            
            let total=req.query.total
           
            let userId=req.session.user[0]._id;
           
    
            orderHelper.returnOrder(orderId,userId).then((returnOrderStatus)=>{
    
                orderHelper.addWallet(userId,total).then((walletStatus)=>{
                   
                    orderHelper.updatePaymentStatus(orderId,userId).then((paymentStatus)=>{
                        res.send(returnOrderStatus)
    
                })
              
                
                })
              
            })

       
    },

  //to change order Status 
  changeOrderStatus: (req, res) => {
    

    let orderId = req.body.orderId
    
   
    let status = req.body.status
    orderHelper.changeOrderStatus(orderId, status).then((response) => {
        console.log(response);
        res.send(response)
    })
},
    


}