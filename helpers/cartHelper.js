const { response } = require('../app');
const cartModel = require('../model/schema')
const productModel = require('../model/schema')
const { ObjectId } = require("mongodb")

module.exports = {
  // ADD TO CART 
  addTocart: (proId, userId) => {

    let proObj = {
      productId: proId,
      quantity: 1,
    };
    return new Promise((resolve, reject) => {
      try {
        cartModel.Cart.findOne({ user: userId }).then(async (cart) => {
          if (cart) {
            let productExist = cart.cartItems.findIndex(
              (cartItems) => cartItems.productId == proId);

            if (productExist != -1) {
              cartModel.Cart.updateOne(
                { user: new ObjectId(userId), "cartItems.productId": new ObjectId(proId) },
                { $inc: { "cartItems.$.quantity": 1 } }
              ).then((response) => {
               
                resolve({ response, status: false })
              })
            } else {
              cartModel.Cart.updateOne({ user: userId }, { $push: { cartItems: proObj } }).then((response) => {
                resolve({ status: true })
              })
            }

          } else {
            let newCart = await cartModel.Cart({
              user: userId,
              cartItems: proObj
            });
            await newCart.save().then((response) => {

              resolve({ status: true })
            });
          }
        })
      } catch (error) {
        res.render("users/catchError", { message: error.message })
      }
    })
  },

  // GET CART PAGE
  getCartItems: (userId) => {


    return new Promise((resolve, reject) => {
      try {
        cartModel.Cart.aggregate([
          { $match: { user: new ObjectId(userId) } },
          { $unwind: "$cartItems" },
          {
            $project: {
              item: "$cartItems.productId",
              quantity: "$cartItems.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "carted",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              carted: { $arrayElemAt: ["$carted", 0] },
            },
          },
        ]).then((cartItems) => {
          resolve(cartItems);
        });
      } catch (error) {
        res.render("users/catchError", { message: error.message })
      }
    });
  },
  //  GET CART COUNT
  getCartCount: (userId) => {


    return new Promise((resolve, reject) => {
      let count = 0
      cartModel.Cart.findOne({ user: userId }).then((cart) => {
        if (cart) {
          count = cart.cartItems.length;

        }
        resolve(count)

      })
    })

  },

  // CART QUANTITY UPDATE
  updateQuantity: (data) => {
    let cartId = data.cartId
    let proId = data.proId
    let userId = data.userId
    let count = data.count
    let quantity = data.quantity
    try {
      return new Promise(async (resolve, reject) => {
        if (count == -1 && quantity == 1) {
          cartModel.Cart.updateOne(
            { _id: cartId },
            {
              $pull: { cartItems: { productId: proId } }
            }).then(() => {
              resolve({ status: true })
            })
        } else {
          cartModel.Cart.updateOne(
            { _id: cartId, "cartItems.productId": proId },
            {
              $inc: { "cartItems.$.quantity": count }
            }).then(() => {
              cartModel.Cart.findOne(
                { _id: cartId, "cartItems.productId": proId },
                { "cartItems.$": 1 }
              ).then((cart) => {
                const newQuantity = cart.cartItems[0].quantity;
                resolve({ status: true, newQuantity: newQuantity });
              });
            })
        }
      })
    } catch (error) {
      res.render("users/catchError", { message: error.message })
    }

  },

  //  DELETE PRODUCT FROM CART
  deleteProduct: (data) => {
    let cartId = data.cartId
    let proId = data.proId

    try {
      return new Promise((resolve, reject) => {
        cartModel.Cart.updateOne(
          { _id: cartId },
          {
            $pull: { cartItems: { productId: proId } }
          }).then(() => {
            resolve({ status: true })
          })
      })
    } catch (error) {
      res.render("users/catchError", { message: error.message })
    }
  },
  //dashboard codes

  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      await productModel.product.find().then((response) => {
        resolve(response);
      });
    });
  },



}