
const adminHelper = require('../helpers/adminHelper')
const express = require('express')
const categoryModel = require('../model/schema')
const { response } = require('../app')
const productModel = require('../model/schema')
const couponHelper = require('../helpers/couponHelper')
const bannerModel = require('../model/schema')
const orderHelper = require('../helpers/orderHelper')
const userController = require('./userController')
const cartHelper = require('../helpers/cartHelper')
// const { resetState } = require('sweetalert/typings/modules/state')

let admin
module.exports = {

  getDashboard: async (req, res) => {
    let admin = req.session.admin;
    let totalProducts,
      days = [];
    let ordersPerDay = {};
    let paymentCount = [];

    let Products = await adminHelper.getAllProducts();
    totalProducts = Products.length;

    await orderHelper.getOrderByDate().then((response) => {
      let result = response;

      for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].orders.length; j++) {
          let ans = {};
          ans["createdAt"] = result[i].orders[j].createdAt;
          days.push(ans);
        }
      }

      days.forEach((order) => {
        let day = order.createdAt.toLocaleDateString("en-US", {
          weekday: "long",
        });
        ordersPerDay[day] = (ordersPerDay[day] || 0) + 1;
      });
    });

    let getCodCount = await adminHelper.getCodCount();

    let codCount = getCodCount.length;

    let getOnlineCount = await adminHelper.getOnlineCount();
    let onlineCount = getOnlineCount.length;

    let getWalletCount = await adminHelper.getWalletCount();
    let WalletCount = getWalletCount.length;

    paymentCount.push(onlineCount);
    paymentCount.push(codCount);
    paymentCount.push(WalletCount);



    let orderByCategory = await orderHelper.getOrderByCategory();


    let Men = 0
    let Women = 0

    orderByCategory.forEach((product) => {


      if (product[0].category == 'MEN') Men++;

      if (product[0].category == 'WOMEN') Women++;

    });

    let category = [];
    category.push(Men);
    category.push(Women);


    await orderHelper.getAllOrder().then((response) => {
      var totalOrders = response.length;

      let total = 0;

      for (let i = 0; i < totalOrders; i++) {
        total += response[i].orders.totalPrice;
      }

      res.render("admin/dashboard", {
        layout: "adminLayout",
        admin,
        total,
        totalProducts,
        totalOrders,
        ordersPerDay,
        paymentCount,
        category,
      });
    });


  },

  // GET LOGIN PAGE

  getLogin: (req, res) => {
    res.render('admin/login', { layout: 'adminLayout' })
  },

  //  POST LOGIN PAGE
  postLogin: (req, res) => {

    let data = req.body;
    adminHelper.doLogin(data).then((response) => {
      if (response) {
        req.session.admin = response;
        res.redirect('/admin/dashboard');
      } else {
        res.redirect('/admin');
      }
    });
  },


  // GET LOG OUT
  getLogout: (req, res) => {
    req.session.admin = null
    res.redirect('/admin')

  },
  // GET USERLIST
  getUserlist: async (req, res) => {
    let admin = req.session.admin
    await adminHelper.getUser().then((user) => {
      res.render('admin/userlist', { user, layout: 'adminLayout', admin })
    })
  },
  // GET BLOCK USER
  getBlockuser: async (req, res) => {
    try {
      let userId = req.params.id

      const response = await adminHelper.blockUser(userId)
      res.send(response)


    } catch (err) {
      console.error(err);
    }

  },
  // GET UNBLOCK USER
  getUnblockuser: async (req, res) => {
    try {
      let userId = req.params.id
      const response = await adminHelper.Unblockuser(userId)
      res.send(response)
    }
    catch (err) {
      console.error(err);

    }
  },
  // GET ADD PRODUCT
  getAddproduct: (req, res) => {
    let admin = req.session.admin
    res.render('admin/addProducts', { layout: 'adminLayout', admin })
  },
  //  POST ADD PRODUCT
  postAddproduct: (req, res) => {

    let file = req.files;
    const fileName = file.map((file) => {
      return file.filename;
    })

    const product = req.body;
    product.img = fileName;

    adminHelper.postAddproduct(product).then(() => {
      res.redirect('/admin/dashboard')
    })
  },
  // GET EDIT PRODUCT
  getEditproduct: (req, res) => {
    let admin = req.session.admin
    let proId = req.params.id;


    adminHelper.geteditproduct(proId).then((product) => {

      res.render('admin/editproduct', { layout: "adminLayout", product, admin })
    })
  },
  // POST EDIT PRODUCT
  postEditproduct: async (req, res) => {
    let proId = req.params.id;
    let file = req.files;
    let image = []

    let previousImages = await adminHelper.getPreviousImage(proId)



    if (req.files.image1) {
      image.push(req.files.image1[0].filename)
    } else {
      image.push(previousImages[0])
    }
    if (req.files.image2) {
      image.push(req.files.image2[0].filename)
    } else {
      image.push(previousImages[1])
    }
    if (req.files.image3) {
      image.push(req.files.image3[0].filename)
    } else {
      image.push(previousImages[2])
    }
    if (req.files.image4) {
      image.push(req.files.image4[0].filename)
    } else {
      image.push(previousImages[3])
    }
    adminHelper.postEditproduct(proId, req.body, image).then(() => {
      res.redirect('/admin/productlist')
    })


  },
  //  DELETE PRODUCT
  deleteProduct: (req, res) => {
    let proId = req.params.id
    adminHelper.deleteproduct(proId).then((response) => {
      res.send(response)
    })
  },
  // GET PRODUCT LIST
  getProductlist: async (req, res) => {
    let admin = req.session.admin
    let product = await productModel.product.find()
    res.render('admin/productlist', { layout: 'adminLayout', product, admin })
  },
  // GET ADD CATEGORY
  getAddcategory: async (req, res) => {
    let admin = req.session.admin
    let categories = await categoryModel.Category.find()
    res.render('admin/addCategory', { layout: "adminLayout", categories, admin })
  },
  // POST ADD CATEGORY
  postAddcategory: (req, res) => {
    adminHelper.addCategory(req.body).then((response) => {
      res.redirect('/admin/addCategory')
    })
  },
  // GET EDIT CATEGORY
  getEditcategory: async (req, res) => {
    let categoryId = req.params.id

    const response = await adminHelper.getEditcategory(categoryId)
    console.log(response);
    res.send(response)
  },
  // POST EDIT CATEGORY
  postEditcategory: async (req, res) => {


    const response = adminHelper.postEditcategory(data).then((response) => { })
    res.send(response)
  },
  // DELETE CATEGORY
  deleteCategory: (req, res) => {
    let catId = req.params.id;
    adminHelper.deleteCategory(catId).then((response) => {
      res.send(response)
    })
  },

  getAddCoupon: (req, res) => {
    let admin = req.session.admin
    res.render('admin/addcoupon', { layout: "adminLayout", admin })
  },

  generatorCouponCode: (req, res) => {
    couponHelper.generatorCouponCode().then((couponCode) => {
      res.send(couponCode)
    })
  },
  /* Post Add Coupone Page. */
  postaddCoupon: (req, res) => {
    let data = {
      couponCode: req.body.coupon,
      validity: req.body.validity,
      minAmount: req.body.minAmount,
      minDiscountPercentage: req.body.minDiscountPercentage,
      maxDiscountValue: req.body.maxDiscount,
      description: req.body.description
    }
    couponHelper.postaddCoupon(data).then((response) => {

      res.send(response)
    })
  },
  /* GET Coupon List Page. */
  getCouponList: (req, res) => {
    let admin = req.session.admin
    couponHelper.getCouponList().then((couponList) => {
      res.render('admin/couponList', { layout: "adminLayout", admin, couponList })
    })
  },
  // GET ADD BANNER
  getAddBanner: (req, res) => {
    let admin = req.session.admin
    res.render('admin/add-banner', { layout: "adminLayout", admin })
  },

  // POST ADDBANNER
  postAddBanner: (req, res) => {
    adminHelper.addBanner(req.body, req.file.filename).then((response) => {
      if (response) {

        res.redirect("/admin/add-banner");
      } else {
        res.status(505);
      }
    });
  },

  // GET BANNER LIST

  getBannerList: (req, res) => {
    let admin = req.session.admin
    adminHelper.getBannerList().then((banner) => {


      res.render('admin/banner-list', { layout: 'adminLayout', admin, banner })
    })
  },
  // GET EDIT BANNER
  getEditBanner: (req, res) => {
    let admin = req.session.admin
    adminHelper.getEditBanner(req.query.banner).then((banner) => {
      res.render('admin/edit-banner', { layout: "adminLayout", admin, banner })
    })
  },
  // POST EDIT BANNER
  postEditBanner: (req, res) => {
    console.log(req.query);
    adminHelper.postEditBanner(req.query.editbanner, req.body, req?.file?.filename).then((response) => {

      res.redirect("/admin/banner-list")
    })
  },
  // DELETE BANNER
  deleteBanner: (req, res) => {
    adminHelper.deleteBanner(req.params.id).then((response) => {
      res.send(response)
    })
  },
  // REMOVE COUPON
  removeCoupon: (req, res) => {
    let couponId = req.body.couponId
    couponHelper.removeCoupon(couponId).then((successResponse) => {
      res.send(successResponse)
    })
  },
  // GET ORDER LIST
  getOrderList: (req, res) => {


    let userId = req.params.id


    let admin = req.session.admin
    adminHelper.getUser(userId).then((user) => {

      orderHelper.getOrders(userId).then((order) => {
        res.render('admin/order-List', { layout: "adminLayout", user, userId, admin, order })
      })
    })
  },
  // GET ORDER DETAILS
  getOrderDetails: async (req, res) => {

    let admin = req.session.admin;

    let orderId = req.query.orderId;
    let userId = req.query.userId

    let userDetails = await userController.getDetails(userId)
    orderHelper.getOrderAddress(userId, orderId).then((address) => {
      orderHelper.getSubOrders(orderId, userId).then((orderDetails) => {
        orderHelper.getOrderedProducts(orderId, userId).then((product) => {
          orderHelper.getTotal(orderId, userId).then((productTotalPrice) => {
            orderHelper.getOrderTotal(orderId, userId).then((orderTotalPrice) => {

              res.render('admin/order-details', {
                layout: "adminLayout", admin, userDetails, address, product, orderId,
                orderDetails, productTotalPrice, orderTotalPrice
              })

            })
          })
        })
      })
    })
  },


  // get sales report page
  getSalesReport: async (req, res) => {
    let admin = req.session.admin
    let report = await adminHelper.getSalesReport()

    let details = []
    const getDate = (date) => {
      let orderDate = new Date(date)
      let day = orderDate.getDate()
      let month = orderDate.getMonth() + 1
      let year = orderDate.getFullYear()
      return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${isNaN(year) ? "0000" : year}`
    }

    report.forEach((orders) => {
      details.push(orders.orders)

    })

    res.render("admin/salesReport", { layout: 'adminLayout', admin, details, getDate })
  },


  postSalesReport: (req, res) => {
    let admin = req.session.admin


    let details = []
    const getDate = (date) => {
      let orderDate = new Date(date)
      let day = orderDate.getDate()
      let month = orderDate.getMonth() + 1
      let year = orderDate.getFullYear()
      return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${isNaN(year) ? "0000" : year}`
    }

    adminHelper.postReport(req.body).then((orderData) => {

      orderData.forEach((orders) => {
        details.push(orders.orders)
      })

      res.render("admin/salesReport", { layout: 'adminLayout', admin, details, getDate })
    })

  },




}









