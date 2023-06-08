const wishListModel = require('../model/schema')
const { ObjectId } = require('mongodb');

module.exports = {

    //to get the total count of wishlist
    getWishlistcount: (userId) => {

        try {
            return new Promise((resolve, reject) => {
                let count = 0;
                wishListModel.Wishlist.findOne({ user: userId }).then((userWishlist) => {
                    if (userWishlist) {
                        count = userWishlist.wishList.length
                    }
                    resolve(count)
                })
            })
        }
        catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },


    //to get wishlist
    getwishlistProducts: (userId) => {
        try {
            return new Promise((resolve, reject) => {
                wishListModel.Wishlist.aggregate([
                    {
                        $match: {
                            "user": new ObjectId(userId)
                        }
                    },
                    {
                        $unwind: "$wishList"
                    },
                    {
                        $project: {
                            productId: "$wishList.productId",
                            createdAt: "$wishList.createdAt"
                        }
                    },
                    {
                        $lookup: {
                            from: "products",
                            localField: "productId",
                            foreignField: "_id",
                            as: "wishListed"
                        }
                    },
                    {
                        $project: {
                            productId: 1,
                            createdAt: 1,
                            wishListed: { $arrayElemAt: ["$wishListed", 0] }
                        }
                    }
                ]).then((wishListed) => {

                    resolve(wishListed)
                })
            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }

    },
    //add to wishList
    addWishList: (userId, proId) => {

        try {
            return new Promise((resolve, reject) => {
                wishListModel.Wishlist.findOne({ user: new ObjectId(userId) }).then((userWishList) => {
                    if (userWishList) {
                        let productExist = userWishList.wishList.findIndex((wishList) => wishList.productId == proId);
                        if (productExist != -1) {
                            resolve({ status: false });
                        } else {
                            wishListModel.Wishlist.updateOne(
                                { user: new ObjectId(userId) },
                                {
                                    $push: {
                                        wishList: { productId: new ObjectId(proId) }
                                    }
                                }
                            ).then(() => {
                                resolve({ status: true });
                            })
                        }
                    } else {
                        let wishListData = {
                            user: new ObjectId(userId),
                            wishList: [{ productId: new ObjectId(proId) }]
                        };
                        let newWishList = new wishListModel.Wishlist(wishListData);
                        newWishList.save().then(() => {
                            resolve({ status: true });
                        }).catch((err) => {
                            reject(err);
                        });
                    }
                });
            });
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },
    //remove product from wishList
    removeProductWishlist: (proId, wishListId) => {
        try {
            return new Promise((resolve, reject) => {
                wishListModel.Wishlist.updateOne(
                    { _id: wishListId },
                    {
                        $pull: { wishList: { productId: proId } }
                    }
                ).then((response) => {
                    resolve(response)
                })
            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    }

}