const bcrypt = require('bcrypt')
const db = require('../model/schema');

const productShema = require('../model/schema')
const bannerModel = require('../model/schema')
// const db =require('../model/schema')



module.exports = {
  // signup

  doSignup: (userData) => {

    return new Promise(async (resolve, reject) => {
      try {
        let email = userData.email;
        let existingUser = await db.user.findOne({ email });
        if (existingUser) {
          resolve({ status: false });
        } else {
          let hashedPassword = await bcrypt.hash(userData.password, 10);
          let data = new db.user({
            username: userData.username,
            password: hashedPassword,
            email: userData.email,
            phonenumber: userData.mobile,
          });

          await data.save().then((data) => {
            resolve({ status: true });
          });

        }
      }
      catch (err) {
        res.render("users/catchError", { message: error.message })
      }
    })
  },
  // login

  dologin: (userData) => {


    return new Promise(async (resolve, reject) => {

      let users = await db.user.find({ email: userData.email });
      if (users.length === 0) {

        resolve({ emailStatus: false });
      }
      if (users.length > 0) {
        // check if any users were found
        bcrypt.compare(userData.password, users[0].password).then((status) => {
          if (status) {

            let response = { users: users, status: true }; // create the response object
            resolve(response);
          } else {

            resolve({ status: false });
            // }
          }
        });
      } else {

        resolve({ emailStatus: false });
      }
    })
  },
  // GET SHOP
  /* GET Shop Page. */
  getShop: () => {
    try {
      return new Promise((resolve, reject) => {
        productShema.product.find().then((product) => {
          if (product) {
            resolve(product)
          } else {
            console.log('product not found');
          }
        })
      })
    } catch (error) {
      res.render("users/catchError", { message: error.message })
    }
  },
  findUser: async (mobNo) => {

    try {
      const users = await db.user.findOne({ phonenumber: mobNo });

      if (users) {
        return users;

      } else {
        return false;
      }
    } catch (err) {
      res.render("users/catchError", { message: error.message })
    }
  },


  getProductDetail: (proId) => {

    try {
      return new Promise((resolve, reject) => {
        productShema.product.findOne({ _id: proId }).then((productFound) => {

          resolve(productFound)
        })
      })
    } catch (error) {
      res.render("users/catchError", { message: error.message })
    }
  },

  // banner 
  getBannerData: () => {
    return new Promise(async (resolve, reject) => {
      await bannerModel.Banner.find().then((response) => {

        resolve(response);
      });
    });
  },
  // getUser

  getUser: (userId) => {

    try {
      return new Promise((resolve, reject) => {
        db.user.findById({ _id: userId }).then((response) => {

          resolve(response)
        })
      })
    } catch (error) {
      res.render("users/catchError", { message: error.message })
    }
  },


  // change user data
  changeUserData: (userId, data) => {
    try {
      return new Promise((resolve, reject) => {
        db.user.updateOne(
          { _id: userId },
          {
            $set: {
              name: data.username,
              email: data.email,
              mobile: data.mobile
            }
          }
        ).then((response) => {

          resolve(response)
        })
      })
    } catch (error) {
      res.render("users/catchError", { message: error.message })
    }
  },

  // sorting
  sorting: (sortOption) => {

    return new Promise(async (resolve, reject) => {
      let products;
      if (sortOption === "low-to-high") {

        products = await productShema.product.find().sort({ price: 1 }).exec();
      } else if (sortOption === "high-to-low") {

        products = await productShema.product.find().sort({ price: -1 }).exec();
      } else {

        products = await productShema.product.find().exec();
      }


      resolve(products);
    });
  },
  // sort category
  sortCategory: (category) => {

    return new Promise(async (resolve, reject) => {
      let categ
      if (category === "MEN") {

        categ = await productShema.product.find({ category: "MEN" }).exec()
      }
      else if (category === "WOMEN") {

        categ = await productShema.product.find({ category: "WOMEN" }).exec()
      }
      else {

        categ = await productShema.product.find().exec()
      }

      resolve(categ)
    })
  },
  // search

  search: (searchingWord) => {
    return new Promise(async (resolve, reject) => {
      try {
        const searchResult = await productShema.product.find({

          brand: { $regex: searchingWord, $options: "i" },
        }).exec();


        resolve(searchResult);
      } catch (error) {
        reject(error);
      }
    });
  },
  // document count
  documentCount: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await productShema.product.countDocuments();

        resolve(result);
      } catch (error) {
        res.render("users/catchError", { message: error.message })
      }
    });
  },
  // page view
  pageView: (perpage, i) => {
    return new Promise(async (resolve, reject) => {
      try {


        let pagination = await productShema.product.find().limit(perpage).skip((i - 1) * perpage)
        resolve(pagination)

      } catch (error) {
        res.render("users/catchError", { message: error.message })
      }
    })
  },

  getQueriesOnShop: (query) => {
    const search = query?.search
    const sort = query?.sort
    const filter = query?.filter
    const page = parseInt(query?.page) || 1
    const perPage = 10



    return new Promise(async (resolve, reject) => {

      let filterObj = {}

      if (filter === 'category=MEN') {
        filterObj = { category: 'MEN' }
      } else if (filter === 'category=WOMEN') {
        filterObj = { category: 'WOMEN' }
      } else if (filter === 'category=KIDS') {
        filterObj = { category: 'KIDS' }
      }


      //Building search query

      let searchQuery = {}

      if (search) {
        searchQuery = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      }

      //Building object based on query parameter

      let sortObj = {}

      if (sort === '-price') {
        sortObj = { price: -1 };
      } else if (sort === 'price') {
        sortObj = { price: 1 };
      }

      const skip = (page - 1) * perPage;
      const product = await productShema.product.find({
        ...searchQuery,
        ...filterObj,
      })
        .sort(sortObj)
        .skip(skip)
        .limit(perPage);


      const totalProducts = await productShema.product.countDocuments({
        ...searchQuery,
        ...filterObj,
      });



      const totalPages = Math.ceil(totalProducts / perPage);
      if (product.length == 0) {
        resolve({
          noProductFound: true,
          Message: "No results found.."
        })
      }
      resolve({
        product,
        noProductFound: false,
        currentPage: page,
        totalPages,
      });

    })

  },
  getProductDetail: (proId) => {
    try {
      return new Promise((resolve, reject) => {
        productShema.product.findById({ _id: proId }).then((response) => {
          resolve(response)
        })
      })
    } catch (error) {
      res.render("users/catchError", { message: error.message })
    }
  },




}






