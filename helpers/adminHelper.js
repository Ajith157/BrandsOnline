const bcrypt = require('bcrypt')
const db = require('../model/schema')
const adminModel = require('../model/schema')
const productModel = require('../model/schema');
const categoryModel = require('../model/schema')
const bannerModel = require('../model/schema')
const orderModel = require('../model/schema')
const { response } = require('../app');


let admins;
module.exports = {

  // POST LOGIN PAGE
  doLogin: (data) => {
    return new Promise((resolve, reject) => {
      try {
        let email = data.email;
        db.admin.findOne({ email: email }).then(async (admin) => {
          if (admin) {
            await bcrypt.compare(data.password, admin.password).then((loginTrue) => {
              if (loginTrue) {
                resolve(admin);
              } else {
                resolve(false);
              }
            });
          } else {
            resolve(false);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  //  GET USER
  getUser: () => {
    try {
      return new Promise(async (resolve, reject) => {
        let userData = []
        await db.user.find().exec().then((result) => {
          userData = result
        })
        resolve(userData)
      })
    } catch (error) {
      console.log(err.message);
    }
  },
  // BLOCK USER
  blockUser: (userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.user.updateOne({ _id: userId },
          { $set: { blocked: true } }).then((data) => {
            resolve(data);

          })
      })
    }
    catch (error) {
      console.log(error.message);
    }
  },
  // UNBLOCK USER
  Unblockuser: (userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        await db.user.updateOne({ _id: userId },
          { $set: { blocked: false } }).then((data) => {
            resolve(data)
          })
      })
    }
    catch (error) {
      console.log(error.message);
    }
  },
  // POST ADD PRODUCT
  postAddproduct: (data) => {
     console.log(data,'333333333333');
    try {
      return new Promise((resolve, reject) => {
        let product = new db.product(data);
        console.log(product,'444444444');
        product.save().then(() => {
          resolve()
        })
      })
    }
    catch (error) {
      console.log("errrrrrrrrrrrrrr");
      console.log(error.message);
    }
  },
  // GET EDIT PRODUCT
  geteditproduct: (proId) => {

    return new Promise((resolve, reject) => {
      try {
        db.product.findById(proId).then((product) => {
          if (product) {
            resolve(product)
          }
          else {
            console.log('product not found');
          }
        })
      }
      catch (error) {
        throw error;
      }
    })
  },

  // POST EDIT PRODUCT
  postEditproduct: (proId, product, image) => {


    return new Promise(async (resolve, reject) => {
      await db.product.updateOne({ _id: proId },
        {
          $set: {
            name: product.name,
            brand: product.brand,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
            category: product.category,
            img: image

          }

        }).then((response) => {
          resolve(response)
        })

    })
  },

  // TO GET IMAGES FOR EDIT
  getPreviousImage(proId) {
    try {
      return new Promise(async (resolve, reject) => {
        await db.product.findOne({ _id: proId }).then((response) => {
          resolve(response.img)
        })
      })
    }
    catch (error) {
      console.log(error.message);
    }
  },

  deleteproduct: (proId) => {
    return new Promise((resolve, reject) => {
      try {
        db.product.findByIdAndDelete({ _id: proId }).then((response) => {
          if (response) {
            resolve({ status: true })
          } else {
            resolve({ status: false })
          }
        })
      }
      catch (error) {
        throw error
      }
    })
  },
  // POST ADD CATEGORY
  addCategory: (data) => {

    try {
      return new Promise((resolve, reject) => {
        db.Category.findOne({ category: data.category }).then(
          async (category) => {
            if (!category) {
              let category = db.Category(data);
              await category.save().then(() => {
                resolve({ status: true });
              });
            } else {
              if (!category.sub_category.includes(data.sub_category)) {
                db.Category.updateOne(
                  { category: data.category },
                  { $push: { sub_category: data.sub_category } }
                ).then(() => {
                  resolve({ status: true });
                });
              } else {
                resolve({ status: false })
              }
            }
          }
        )
      })
    }
    catch (error) {
      console.log(error.message);
    }
  },

  getEditcategory: async (categoryId) => {

    try {
      return await categoryModel.Category.findById(categoryId)
    } catch (error) {
      console.log(error.message);
    }
  },
  postEditcategory: (data) => {
    try {
      return new Promise((resolve, reject) => {
        productModel.Category.findByIdAndUpdate(data._id, {
          category: data.category
        }, {
          new: true
        }).then((category) => {

        })
      })
    }
    catch (error) {
      console.log(error.message);
    }
  },
  deleteCategory: (catId) => {
    try {
      return new Promise((resolve, reject) => {
        db.Category.findByIdAndDelete(catId).then((res) => {
          if (res) {
            resolve({ status: true })
          } else {
            resolve({ status: false })

          }
        })
      })
    } catch (error) {
      console.log(error.message);
    }
  },

  addBanner: (texts, Image) => {

    return new Promise(async (resolve, reject) => {

      let banner = bannerModel.Banner({
        title: texts.title,
        description: texts.description,
        image: Image
      })
      await banner.save().then((response) => {
        resolve(response)
      })
    })

  },

  getBannerList: () => {
    return new Promise((resolve, reject) => {
      bannerModel.Banner.find().then((banner) => {
        resolve(banner)
      })
    })
  },

  getEditBanner: (bannerId) => {

    return new Promise((resolve, reject) => {
      bannerModel.Banner.findOne({ _id: bannerId }).then((bannerFound) => {
        resolve(bannerFound)
      })
    })
  },

  postEditBanner: (bannerId, text, image) => {
    console.log(bannerId);

    return new Promise((resolve, reject) => {
      try {
        bannerModel.Banner.updateOne(
          { _id: bannerId },
          {
            $set: {
              title: text.title,
              description: text.description,
              image: image
            }
          }).then((bannerUpdated) => {
            resolve(bannerUpdated)
          })
      } catch (err) {
        console.error(err);
      }


    })
  },

  deleteBanner: (bannerId) => {
    return new Promise((resolve, reject) => {
      bannerModel.Banner.deleteOne({ _id: bannerId }).then(() => {
        resolve()
      })
    })
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      await productModel.product.find().then((response) => {
        resolve(response);
      });
    });
  },

  getCodCount: () => {
    return new Promise(async (resolve, reject) => {
      let response = await orderModel.Order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders.paymentMethod": "COD",
          },
        },
      ])

      resolve(response);

    });
  },

  getOnlineCount: () => {
    return new Promise(async (resolve, reject) => {
      let response = await orderModel.Order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders.paymentMethod": "razorpay",
          },
        },
      ]);
      resolve(response);
     
    });
  },


  getWalletCount: () => {
    return new Promise(async (resolve, reject) => {
      let response = await orderModel.Order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders.paymentMethod": "wallet",
          },
        },
      ]);
      resolve(response);
    });
  },


  // // get sales report

  getSalesReport: () => {
    try {
      return new Promise((resolve, reject) => {
        orderModel.Order.aggregate([
          {
            $unwind: '$orders'
          },
          {
            $match: {
              "orders.orderConfirm": "delivered"
            }
          }
        ]).then((response) => {
          resolve(response)
        })
      })
    } catch (error) {
      console.log(error.message);
    }
  },


  postReport: (date) => {

    try {
      let start = new Date(date.startdate);
      let end = new Date(date.enddate);
      return new Promise((resolve, reject) => {
        orderModel.Order.aggregate([
          {
            $unwind: "$orders"
          },
          {
            $match: {
              $and: [
                { "orders.orderConfirm": "delivered" },
                { "orders.createdAt": { $gte: start, $lte: new Date(end.getTime() + 86400000) } }
              ]
            }
          }
        ])
          .exec()
          .then((response) => {

            resolve(response)
          })
      })
    } catch (error) {
      console.log(error.message);
    }
  },













}



