const express = require('express')
const cartModel = require('../model/schema')
const cartHelper = require('../helpers/cartHelper')
const orderHelper = require('../helpers/orderHelper')

const { response } = require('../app')



module.exports = {
  // ADD TO CART
  addToCart: (req, res) => {


    try {
      let userId = req.session.user[0]._id

      cartHelper.addTocart(req.params.id, userId).then((response) => {


        res.send(response)
      })

    } catch (error) {
      res.render("users/catchError", { message: error.message })


    }
  },
  // get cart page
  getCart: async (req, res) => {


    try {

      let userId = req.session.user[0]._id
      let user = req.session.user
      let count = await cartHelper.getCartCount(userId)
      let total = await orderHelper.totalCheckOutAmount(userId)
      req.session.Total = total
      let subTotal = await orderHelper.getSubTotal(userId)
      cartHelper.getCartItems(userId).then((cartItems) => {
        console.log(cartItems);


        res.render('users/cart', { user, cartItems, count, total, subTotal })
      })
    } catch (error) {
      res.render("users/catchError", { message: error.message })
    }


  },
  // UPDATE QUANTITY
  updateQuantity: (req, res) => {

    let userId = req.session.user[0]._id;
    cartHelper.updateQuantity(req.body).then(async (response) => {
      response.total = await orderHelper.totalCheckOutAmount(userId)
      response.subTotal = await orderHelper.getSubTotal(userId)
      res.json(response)
    })
  },
  /* Delete product from cart*/
  deleteProduct: (req, res) => {

    cartHelper.deleteProduct(req.body).then((response) => {
      res.send(response)
    })
  }




}











