const bcrypt = require('bcrypt')
const db = require('../model/schema');

const productShema = require('../model/schema')
const bannerModel=require('../model/schema')
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
        throw err;
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
  getShop: () => {
    try {
      return new Promise((resolve, reject) => {
        productShema.product.find().then((response) => {
          console.log(response);
          resolve(response)
        })

      })

    } catch (error) {
      console.log(error.message);

    }
  },
  findUser: async (mobNo) => {
    console.log(mobNo);
    try {
      const users = await db.user.findOne({ phonenumber: mobNo });
      console.log(users);
      if (users) {
        return users;

      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
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
      console.log(error.message);
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
              console.log(response);
              resolve(response)
          })
      })
  } catch (error) {
      console.log(error.message);
  }
},
  

sorting: (sortOption) => {

  return new Promise(async (resolve, reject) => {
    let products;
    if (sortOption === "low-to-high") {
     
      products = await productShema.product.find().sort({ price: 1 }).exec();
    } else if (sortOption === "high-to-low") {
     
      products = await productShema.product.find().sort({ price: -1 }).exec();
    } else 
    {
     
      products = await productShema.product.find().exec();
    }
    console.log(products,2);

    resolve(products);
  });
},

sortCategory:(category)=>{
  
  return new Promise(async(resolve,reject)=>{
    let categ
    if(category ==="MEN"){

    categ=await productShema.product.find({category:"MEN"}).exec()
    }
    else if (category ==="WOMEN")
    {
      
      categ= await productShema.product.find({category:"WOMEN"}).exec()
    }
    else{
      
      categ= await productShema.product.find().exec()
    }
    
    resolve (categ)
  })
},

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

documentCount: () => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await productShema.product.countDocuments();
    
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
},
pageView:(perpage,i)=>{
  return new Promise(async (resolve,reject)=>{
    try{
    
      
      let pagination=  await productShema.product.find().limit(perpage).skip((i-1)*perpage)
      resolve(pagination)
    
    } catch(error){
      console.log(error);
    }
  })
}




}






