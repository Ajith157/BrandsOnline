const userHelper = require('../helpers/usersHelper')
const session = require('express-session')
const wishListHelper = require('../helpers/wishlistHelper')
const { response } = require('../app')
const cartHelper = require('../helpers/cartHelper')
const couponHelper = require('../helpers/couponHelper')
const orderHelper = require('../helpers/orderHelper')
const userModel = require('../model/schema')
const productModel = require('../model/schema')




module.exports = {



    // GET LOGIN PAGE
    getLoginpage: (req, res) => {


        try {
            res.render("users/userlogin")

        } catch (error) {
            res.render("users/catchError", { message: error.message })

        }
    },
    // GET SIGN UP PAGE

    getSignuppage: (req, res) => {

        try {
            res.render('users/signup')

        } catch (error) {
            res.render("users/catchError", { message: error.message })

        }
    },
    //  POST SIGN UP 
    dopostSignup: (req, res) => {



        try {
            userHelper.doSignup(req.body).then((response) => {
                let emailStatus = response.status;
                if (emailStatus) {
                    res.redirect("/login");
                } else {
                    res.render("users/signup", { emailStatus });
                }
            })

        } catch (error) {
            res.render("users/catchError", { message: error.message })

        }
    },
    // POST LOGIN
    dopostLogin: (req, res) => {


        try {
            userHelper.dologin(req.body).then((response) => {

                req.session.user = response.users
                let activeUser = req.session.user

                if (response.status) {
                    if (activeUser[0].blocked) {

                        res.send(response.status = false)
                    } else {

                        res.send(response)
                    }
                } else {


                    res.send(response)
                }

            })

        } catch (error) {
            res.render("users/catchError", { message: error.message })


        }

    },
    //  GET LOG OUT

    getLogout: (req, res) => {
        req.session.user = null;
        res.redirect('/')
    },

    // getHome
    getHome: async (req, res) => {
        let bannerData = await userHelper.getBannerData()
        let newlyAdded = await productModel.product.find().sort({ CreatedAt: -1 });
        if (req.session) {
            user = req.session.user;

            res.render("users/home", { user, bannerData, newlyAdded });

        } else {

            res.render("users/home", { bannerData, newlyAdded });
        }
    },

    /* GET Shop Page. */
    getShop: async (req, res) => {

        let user = req.session.user

        if (req.query?.search || req.query?.sort || req.query?.filter) {

            
            const { product, currentPage, totalPages, noProductFound } = await userHelper.getQueriesOnShop(req.query)
            noProductFound ?
                req.session.noProductFound = noProductFound
                : req.session.selectedProducts = product
            res.render('users/shop', { product, user, productResult: req.session.noProductFound })
        } else {

            product = await userHelper.getShop()
            if (product.length != 0)
                req.session.noProductFound = false
            res.render('users/shop', { product, user, productResult: req.session.noProduct })
            req.session.noProductFound = false

        }
    },
    //  GET OTP
    getOtppage: (req, res) => {

        res.render('users/otppage')
    },
    //  SEND OTP
    sendOtp: (req, res) => {

        var phone = Number(req.body.phonenumber)
        userHelper.findUser(req.body.phone).then(async (response) => {
            let user = []
            user.push(response)
            if (response) {
                req.session.user = user
                res.json(true);

            } else {
                req.session.user = null
                req.session.otpLoginError = 'Phone Number doest exist'
                res.json(false)
            }


        })

    },


    /* GET Product Detail Page. */
    getProductdetails: (req, res) => {


        try {
            let proId = req.params.id
            let user = req.session.user

            userHelper.getProductDetail(proId).then((product) => {

                res.render('users/productDetails', { product, user })
            })

        } catch (error) {
            res.render("users/catchError", { message: error.message })


        }


    },


    getDetails: (userId) => {
        try {
            return new Promise((resolve, reject) => {
                userModel.user.find({ _id: userId }).then((user) => {
                    resolve(user)
                })
            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })

        }
    },
    getWishlist: async (req, res) => {


        try {
            let user = req.session.user

            let count = await cartHelper.getCartCount(user[0]._id)
            const wishlistCount = await wishListHelper.getWishlistcount(user[0]._id)
            wishListHelper.getwishlistProducts(user[0]._id).then((wishlistProducts) => {

                res.render('users/wishlist', { user, count, wishlistProducts, wishlistCount })
            })

        } catch (error) {
            res.render("users/catchError", { message: error.message })

        }
    },
    addWishList: (req, res) => {

        let proId = req.params.id

        let userId = req.session.user[0]._id
        wishListHelper.addWishList(userId, proId).then((response) => {

            res.send(response)
        })
    },
    removeProductWishlist: (req, res) => {
        let proId = req.body.proId
        let wishListId = req.body.wishListId
        wishListHelper.removeProductWishlist(proId, wishListId).then((response) => {
            res.send(response)
        })
    },

    verifyCoupon: (req, res) => {
        let couponCode = req.params.id;
        let userId = req.session.user._id
        couponHelper.verifyCoupon(userId, couponCode).then((response) => {
            res.send(response)
        })
    },
    applyCoupon: async (req, res) => {


        let couponCode = req.params.id;

        let userId = req.session.user[0]._id
        let total = await orderHelper.totalCheckOutAmount(userId)

        couponHelper.applyCoupon(couponCode, total).then((response) => {

            res.send(response)
        })
    },
    getSuccesspage: (req, res) => {


        try {
            res.render('users/order-successpage')

        } catch (error) {
            res.render("users/catchError", { message: error.message })


        }
    },


    //  change user data
    changeUserData: (req, res) => {

        let userId = req.params.id
        let data = req.body
        userHelper.changeUserData(userId, data).then((updatedUserData) => {
            res.send(updatedUserData)
        })
    },

    sort: async (req, res) => {


        const { id } = req.params;

        userHelper.sorting(id).then((products) => {
            res.send(products);
        });
    },

    sortCategory: async (req, res) => {

        userHelper.sortCategory(req.params.id).then((category) => {

            res.send(category);
        });
    },

    search: async (req, res) => {

        userHelper.search(req.body.query).then((searchResult) => {

            res.send(searchResult);
        });
    },





}








