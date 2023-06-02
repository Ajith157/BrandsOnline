const couponModel=require('../model/schema')
const voucherCode = require('voucher-code-generator')
const userModel=require('../model/schema')




module.exports={

    generatorCouponCode:()=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let couponCode = voucherCode.generate({
                    length:6,
                    count:1,
                    charset:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                    prefix:"promo-",


                })
                resolve({status:true,couponCode:couponCode[0]});
            }
            catch(error){
                console.log(error.message);
            }
        })
    },

    /* Post Add Coupone Page. */
    postaddCoupon: (data) => {
        try {
            return new Promise((resolve, reject) => {
                couponModel.Coupon.findOne({ couponCode: data.couponCode }).then((coupon) => {
                    if (coupon) {
                        resolve({ status: false })
                    } else {
                        couponModel.Coupon(data).save().then((response) => {
                           
                            resolve({ status: true })
                        })
                    }
                })
            })
        } catch (error) {
            console.log(error.message);
        }
    },

      /* GET Coupon List Page. */
      getCouponList:()=>{
        try {
            return new Promise((resolve,reject)=>{
                couponModel.Coupon.find().then((coupons)=>{
                   
                    resolve(coupons)
                })
            })
        } catch (error) {
            console.log(error.message);
        }
    },

    
    /* DELETE Coupon  Page. */
    removeCoupon: (couponId) => {
        try {
            return new Promise((resolve, reject) => {
                couponModel.Coupon.deleteOne({ _id: couponId }).then(() => {
                    resolve()
                })
            })
        } catch (error) {
            console.log(error.message);
        }
    },

     // to verify the coupon code
     verifyCoupon: (userId, couponCode) => {
        try {
            return new Promise((resolve, reject) => {
                couponModel.Coupon.find({ couponCode: couponCode }).then(async (couponExist) => {
                    console.log(couponExist[0].validity, 'validity');

                    if (couponExist) {

                        if (new Date(couponExist[0].validity) - new Date() > 0) {

                            let usersCoupon = await userModel.user.findOne(
                                { _id: userId, "coupons": { $in: [couponCode] } })

                            if (usersCoupon) {
                                resolve({ status: false, message: "Coupon already used by the user" })
                            } else {
                                resolve({ status: true, message: "Coupon added successfuly" })
                            }
                        } else {
                            resolve({ status: false, message: "Coupon have expiried" })
                        }
                    } else {
                        resolve({ status: false, message: "Coupon doesnt exist" })
                    }
                })
            })
        } catch (error) {
            console.log(error.message);
        }
    },


      // to apply coupon and minus the total amount from it 
      applyCoupon: (couponCode, total) => {
       
       
        try {
            return new Promise((resolve, reject) => {
                couponModel.Coupon.findOne({ couponCode: couponCode }).then((couponExist) => {
                    
                    if (couponExist) {
                        
                        if (new Date(couponExist.validity) - new Date() > 0) {
                            
                            if (total >= couponExist.minAmount) {
                                
                                let discountAmount = (total * couponExist.minDiscountPercentage) / 100
                                if (discountAmount > couponExist.maxDiscountValue) {
                                   
                                    discountAmount = couponExist.maxDiscountValue
                                    resolve({
                                        status: true,
                                        discountAmount: discountAmount,
                                        discount: couponExist.minDiscountPercentage,
                                        couponCode: couponCode
                                    })
                                } else {
                                   
                                    resolve({
                                        status: true,
                                        discountAmount: discountAmount,
                                        discount: couponExist.minDiscountPercentage,
                                        couponCode: couponCode
                                    })
                                }
                            } else {
                               
                                resolve({
                                    status: false,
                                    message: `Minimum purchase amount is ${couponExist.minAmount}`
                                })
                            }
                        } else {
                          
                            resolve({
                                status: false,
                                message: "Counpon expired"
                            })
                        }
                    } else {
                       
                        resolve({
                            status: fasle,
                            message: "Counpon doesnt Exist"
                        })
                    }
                })

            })
        } catch (error) {
            console.log(error.message);
        }
    },

    
    //to save coupon code on user collection
    addCouponToUser: (couponCode, userId) => {
        try {
            return new Promise((resolve, reject) => {
                
                userModel.user.updateOne(
                    { _id: userId },
                    {
                        $push: {
                            coupons: couponCode
                        }
                    }).then((couponAdded) => {
                        resolve(couponAdded)
                    })
            })
        } catch (error) {
            console.log(error.message);
        }
    },

    getCouponList:()=>
    {
        try {
            return new Promise((resolve, reject) => {
                couponModel.Coupon.find().then((coupon)=>
              {
                resolve(coupon)
              })  
            })
        } catch (error) {
          console.log(error.mesage);  
        }
    },


};



