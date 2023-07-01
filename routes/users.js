const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const cartController = require('../controller/cartController')
const orderController = require('../controller/orderController')
const auth = require('../middleware/auth')





/* GET home page. */
router.get('/', userController.getHome)

// GET SHOP
router.get('/shop', userController.getShop)
// GET LOGIN PAGE
router.get('/login', userController.getLoginpage)
// GET LOGOUT
router.get('/logout', userController.getLogout)
// GET SIGNUP
router.get('/signup', userController.getSignuppage)
// POST SIGNUP
router.post('/signup', userController.dopostSignup)
// POST LOGIN
router.post('/login', userController.dopostLogin)
// GET SHOP
router.get('/shop', auth.userAuth, userController.getShop)
// GET OTP PAGE
router.get('/otppage', userController.getOtppage)
// POST OTP 
router.post('/send-otp', userController.sendOtp)
// GET PRODUCT DETAILS
router.get('/product-details/:id', userController.getProductdetails)
// GET ADD TO CART
router.get('/add-to-cart/:id', auth.userAuth, cartController.addToCart)
// CART LIST
router.get('/cart-list', cartController.getCart)

// UPDATE QUANTITY
router.patch('/change-product-quantity', cartController.updateQuantity)
// DELETE PRODUCT
router.delete('/delete-product-cart', cartController.deleteProduct)
// GET ADDRESS
router.get('/get-profile', auth.userAuth, orderController.getAddress)
// POST ADDRESS
router.route('/add-address').post(auth.userAuth, orderController.postAddress)
// EDIT ADDRESS
router.route('/edit-address/:id').get(auth.userAuth, orderController.getEditAddress).patch(orderController.patchEditAddress)

router.route('/delete-address/:id').delete(auth.userAuth, orderController.deleteAddress)
// GET CHECKOUT
router.get('/check-out', auth.userAuth, orderController.getcheckOut)
// POST CHECKOUT
router.post('/check-out', auth.userAuth, orderController.postCheckout)
// VERIFY PAYMENT
router.route('/verify_payment').post(auth.userAuth, orderController.verifyPayment)
// GET WISHLIST
router.route('/wishlist').get(auth.userAuth, userController.getWishlist)
// ADD WISHLIST
router.route('/add-to-wishlist/:id').post(auth.userAuth, userController.addWishList)
// REMOVE WISHLIST
router.route('/remove-product-wishlist').delete(auth.userAuth, userController.removeProductWishlist)
// ORDER DETAILS
router.route('/order-details/:id').get(auth.userAuth, orderController.orderDetails)

router.route('/change-user-data/:id').post(auth.userAuth, userController.changeUserData)
// CANCEL ORDER
router.route('/cancel-order/').post(auth.userAuth, orderController.cancelOrder)
// RETUERN ORDER
router.route('/return-order/').post(auth.userAuth, orderController.returnOrder)
// VERIFY COUPON
router.route('/coupon-verify/:id').get(auth.userAuth, userController.verifyCoupon)
// APPLY COUPON
router.route('/apply-coupon/:id').get(auth.userAuth, userController.applyCoupon)
// GET SUCCESS PAGE
router.get('/success-page', auth.userAuth, userController.getSuccesspage)
// GET LAST ORDER
router.get('/get-last-order', auth.userAuth, orderController.getLastOrder)
// GET SORT
router.get("/sort/:id", auth.userAuth, userController.sort)
// GE SORT CATEGORY
router.get("/sortCategory/:id", auth.userAuth, userController.sortCategory)
// GET SEARCH
router.post("/search", auth.userAuth, userController.search)

router.get('/get-wallet-payments',auth.userAuth,orderController.getwalletPayment)

























module.exports = router;
