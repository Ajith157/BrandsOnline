const express = require('express')
const { ObjectId } = require('mongodb');
const cartModel = require('../model/schema')
const orderModel = require('../model/schema')
const addressModel = require('../model/schema')
const productModel = require('../model/schema')
const userModel = require('../model/schema')
const Razorpay = require('razorpay')

const keyId = process.env.key_id
const keySecret = process.env.key_secret

var instance = new Razorpay({
    key_id: "rzp_test_xztmEHhw6nGCRI",
    key_secret: "aYOXpKbOXtjO5Yo2ggpZDwsw",
});


module.exports = {

    //  TO GET THE TOTAL AMOUNT IN THE CART
    totalCheckOutAmount: (userId) => {


        try {
            return new Promise((resolve, reject) => {
                cartModel.Cart.aggregate([
                    {
                        $match: {
                            user: new ObjectId(userId)

                        }
                    },
                    {
                        $unwind: "$cartItems"
                    },
                    {
                        $project: {
                            item: "$cartItems.productId",
                            quantity: "$cartItems.quantity"
                        }
                    },
                    {
                        $lookup: {
                            from: "products",
                            localField: "item",
                            foreignField: "_id",
                            as: "carted"
                        }
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: { $arrayElemAt: ["$carted", 0] }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ["$quantity", "$product.price"] } }
                        }
                    }
                ])
                    .then((total) => {


                        resolve(total[0]?.total)
                    })
            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },

    // TO GET THE SUBTOTAL 
    getSubTotal: (userId) => {
        try {
            return new Promise((resolve, reject) => {
                cartModel.Cart.aggregate([
                    {
                        $match: {
                            user: new ObjectId(userId)
                        }
                    },
                    {
                        $unwind: "$cartItems"
                    },
                    {
                        $project: {
                            item: "$cartItems.productId",
                            quantity: "$cartItems.quantity"
                        }
                    },
                    {
                        $lookup: {
                            from: "products",
                            localField: "item",
                            foreignField: "_id",
                            as: "carted"
                        }
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,

                            price: {
                                $arrayElemAt: ["$carted.price", 0]
                            }
                        }
                    },
                    {
                        $project: {
                            total: { $multiply: ["$quantity", "$price"] }
                        }
                    }
                ])
                    .then((total) => {

                        const totals = total.map(obj => obj.total)

                        resolve({ total, totals })
                    })
            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },

    // get address page
    getAddress: (userId) => {

        return new Promise((resolve, reject) => {
            addressModel.Address.findOne({ user: userId }).then((response) => {

                resolve(response)
            })
        })
    },

    //    POST ADD ADDRESS
    postAddress: (data, userId) => {

        try {
            return new Promise((resolve, reject) => {
                let addressInfo = {
                    fname: data.fname,
                    lname: data.lname,
                    street: data.street,
                    appartment: data.appartment,
                    city: data.city,
                    state: data.state,
                    zipcode: data.zipcode,
                    phone: data.phone,
                    email: data.email
                }
                addressModel.Address.findOne({ user: userId }).then(async (ifAddress) => {
                    if (ifAddress) {
                        addressModel.Address.updateOne(
                            { user: userId },
                            {
                                $push: { Address: addressInfo }
                            }
                        ).then((response) => {
                            resolve(response)
                        })
                    }
                    else {
                        let newAddress = addressModel.Address({ user: userId, Address: addressInfo })
                        await newAddress.save().then((response) => {
                            resolve(response)
                        })
                    }
                })
            })
        } catch (error) {

            res.render("users/catchError", { message: error.message })

        }
    },
    // GET ORDER
    getOrders: (userId) => {


        try {
            return new Promise((resolve, reject) => {
                orderModel.Order.findOne({ user: new ObjectId(userId) }).then((user) => {

                    resolve(user)
                })
            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },


    // PLACE ORDER
    placeOrder: (data) => {


        try {
            let flag = 0
            return new Promise(async (resolve, reject) => {
                let productDetails = await cartModel.Cart.aggregate([
                    {
                        $match: {
                            user: new ObjectId(data.user)
                        }
                    },
                    {
                        $unwind: '$cartItems'
                    },
                    {
                        $project: {
                            item: "$cartItems.productId",
                            quantity: "$cartItems.quantity"
                        }
                    },
                    {
                        $lookup: {
                            from: "products",
                            localField: "item",
                            foreignField: "_id",
                            as: "productDetails"
                        }
                    },
                    {
                        $unwind: "$productDetails"

                    },
                    {
                        $project: {

                            productId: "$productDetails._id",
                            productName: "$productDetails.name",
                            productPrice: "$productDetails.price",
                            brand: "$productDetails.brand",
                            quantity: "$quantity",
                            category: "$productDetails.category",
                            image: "$productDetails.img"
                        }
                    }
                ])

                let Address = await addressModel.Address.aggregate([
                    {
                        $match: { user: new ObjectId(data.user) }
                    },
                    {
                        $unwind: "$Address"
                    },
                    {
                        $match: { "Address._id": new ObjectId(data.address) }
                    },
                    {
                        $project: { item: "$Address" }
                    }
                ])

                let status, orderStatus;
                if (data.payment_option === "COD") {
                    status = "Placed",
                        orderStatus = "Success"

                } else if (data.payment_option === 'wallet') {


                    let userData = await userModel.user.findById({ _id: data.user })
                    if (userData.wallet < data.discountedAmount) {

                        flag = 1
                        reject(new Error("Insufficient wallet balance!"))

                    } else {
                        userData.wallet -= data.discountedAmount

                        await userData.save()
                        status = 'Placed',
                            orderStatus = 'Success'
                    }

                } else {
                    status = "Pending",
                        orderStatus = "Pending"
                }

                let orderData = {
                    name: Address[0].item.fname,
                    paymentStatus: status,
                    paymentMethod: data.payment_option,
                    productDetails: productDetails,
                    shippingAddress: Address,
                    orderStatus: orderStatus,
                    totalPrice: data.discountedAmount
                }
                let order = await orderModel.Order.findOne({ user: data.user })


                if (flag == 0) {
                    if (order) {
                        await orderModel.Order.updateOne(
                            { user: data.user },
                            {
                                $push: { orders: orderData }
                            }
                        ).then((response) => {
                            resolve(response)
                        })
                    } else {
                        let newOrder = orderModel.Order({
                            user: data.user,
                            orders: orderData
                        })
                        await newOrder.save().then((response) => {
                            resolve(response)
                        })
                    }

                    //inventory management 
                    // update product quantity in the database
                    for (let i = 0; i < productDetails.length; i++) {
                        let purchasedProduct = productDetails[i];
                        let originalProduct = await productModel.product.findById(purchasedProduct.productId);
                        let purchasedQuantity = purchasedProduct.quantity;
                        originalProduct.quantity -= purchasedQuantity;
                        await originalProduct.save();
                        await cartModel.Cart.deleteMany({ user: data.user }).then(() => {
                            resolve()
                        })

                    }

                }

            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },


    // RAZORPAY GENERATION
    generateRazorpay(userId, total) {
        try {
            return new Promise(async (resolve, reject) => {

                let orders = await orderModel.Order.find({ user: userId })

                let order = orders[0].orders.slice().reverse();
                let orderId = order[0]._id;

                var options = {
                    amount: total * 100,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: "" + orderId
                };
                instance.orders.create(options, function (err, order) {
                    if (err) {
                        console.log(err);
                    } else {
                        resolve(order)
                    }
                });

            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },

    // VERIFY PAYMENT


    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require("crypto");
            let hmac = crypto.createHmac("sha256", "aYOXpKbOXtjO5Yo2ggpZDwsw");

            hmac.update(
                details["payment[razorpay_order_id]"] +
                "|" +
                details["payment[razorpay_payment_id]"]
            );
            hmac = hmac.digest("hex");

            if (hmac == details["payment[razorpay_signature]"]) {
                resolve();
            } else {
                reject();
            }
        });
    },




    //   find order

    findOrder: (orderId, userId) => {

        try {
            return new Promise((resolve, reject) => {
                orderModel.Order.aggregate([
                    {
                        $match: {
                            "orders._id": new ObjectId(orderId),
                            user: new ObjectId(userId)
                        }
                    },
                    {
                        $unwind: "$orders"
                    },
                ]).then((response) => {
                    let orders = response.filter((element) => {
                        if (element.orders._id == orderId) {

                            return true;
                        }
                        return false;
                    }).map((element) => element.orders);
                    resolve(orders)
                })
            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },


    findProduct: (orderId, userId) => {
        try {
            return new Promise((resolve, reject) => {
                orderModel.Order.aggregate([
                    {
                        $match: {
                            "orders._id": new ObjectId(orderId),
                            user: new ObjectId(userId)
                        }
                    },
                    {
                        $unwind: "$orders"
                    },



                ]).then((response) => {
                    let product = response.filter((element) => {
                        if (element.orders._id == orderId) {

                            return true;
                        }
                        return false;
                    }).map((element) => element.orders.productDetails);
                    resolve(product)
                })
            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },


    findAddress: (orderId, userId) => {
        try {
            return new Promise((resolve, reject) => {
                orderModel.Order.aggregate([
                    {
                        $match: {
                            "orders._id": new ObjectId(orderId),
                            user: new ObjectId(userId)
                        }
                    },
                    {
                        $unwind: "$orders"
                    },
                    {
                        $unwind: "$orders.shippingAddress"
                    },
                    {
                        $replaceRoot: { newRoot: "$orders.shippingAddress.item" }
                    },
                    {
                        $project: {
                            _id: 1,
                            fname: 1,
                            lname: 1,
                            street: 1,
                            appartment: 1,
                            city: 1,
                            state: 1,
                            zipcode: 1,
                            phone: 1,
                            email: 1
                        }
                    }
                ]).then((response) => {


                    resolve(response)
                })
            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },

    //cancel order
    cancelOrder: (orderId) => {
        try {
            return new Promise((resolve, reject) => {
                orderModel.Order.find({ 'orders._id': orderId.toString() }).then((orders) => {

                    let orderIndex = orders[0].orders.findIndex(
                        (orders) => orders._id.toString() == orderId.toString()
                    );

                    let order = orders[0].orders.find((order) => order._id.toString() == orderId.toString());

                    if (order.paymentMethod === 'razorpay' && order.paymentStatus === 'paid') {

                        orderModel.Order.updateOne(
                            { 'orders._id': orderId },
                            {

                                $set: {
                                    ['orders.' + orderIndex + '.orderConfirm']: 'Canceled',
                                    ['orders.' + orderIndex + '.paymentStatus']: 'Refunded'
                                }
                            }
                        ).then((orders) => {

                            resolve(orders)
                        })
                    } else if (order.paymentMethod === 'COD' && order.orderConfirm === 'Delivered' && order.paymentStatus === 'paid') {
                        orderModel.Order.updateOne(
                            { 'orders._id': orderId },
                            {
                                $set: {
                                    ['orders.' + orderIndex + '.orderConfirm']: 'Canceled',
                                    ['orders.' + orderIndex + '.paymentStatus']: 'Refunded'
                                }
                            }
                        ).then((orders) => {

                            resolve(orders)
                        })
                    } else {
                        orderModel.Order.updateOne(
                            { 'orders._id': orderId },
                            {
                                $set: {
                                    ['orders.' + orderIndex + '.orderConfirm']: 'Canceled'

                                }
                            }
                        ).then((orders) => {

                            resolve(orders)
                        })
                    }

                })

            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },

    // return order
    // return order
    returnOrder: (orderId) => {
        try {
            return new Promise((resolve, reject) => {
                orderModel.Order.find({ 'orders._id': orderId }).then((orders) => {

                    let orderIndex = orders[0].orders.findIndex(
                        (orders) => orders._id == orderId
                    );
                    let order = orders[0].orders.find((order) => order._id == orderId);

                    // if (order.paymentMethod === 'razorpay' && order.paymentStatus === 'Paid') {
                    // Fetch payment details from Razorpay API
                    if (order.paymentMethod === 'COD' || order.paymentMethod === 'razorpay') {
                        // Update order status in the database
                        orderModel.Order.updateOne(
                            { 'orders._id': orderId },
                            {
                                $set: {
                                    ['orders.' + orderIndex + '.orderConfirm']: 'Returned',
                                    ['orders.' + orderIndex + '.paymentStatus']: 'Refunded'
                                }
                            }
                        ).then((orders) => {
                            resolve(orders);
                        });
                    } else {
                        console.log('Invalid payment method');
                        reject('Invalid payment method');
                    }
                });
            });
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },




    // change payment status
    changePaymentStatus: (userId, orderId) => {
        try {

            return new Promise(async (resolve, reject) => {
                await orderModel.Order.updateOne(
                    { "orders._id": orderId },
                    {
                        $set: {
                            "orders.$.orderConfirm": "Success",
                            "orders.$.paymentStatus": "Paid"

                        }
                    }
                ),
                    cartModel.Cart.deleteMany({ user: userId }).then(() => {
                        resolve()
                    })
            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },



    //to get the order address of the user
    getOrderAddress: (userId, orderId) => {
        return new Promise((resolve, reject) => {
            orderModel.Order.aggregate([
                {
                    $match: {
                        "user": new ObjectId(userId)
                    }
                },
                {
                    $unwind: "$orders"
                },
                {
                    $match: {
                        "orders._id": new ObjectId(orderId)
                    }
                },
                {
                    $unwind: "$orders.shippingAddress"
                },
                {
                    $project: {
                        "shippingAddress": "$orders.shippingAddress"
                    }
                }
            ]).then((address) => {
                resolve(address)
            })

        })
    },


    /* GET Edit Address Page */
    getEditAddress: (addressId, userId) => {

        return new Promise((resolve, reject) => {
            addressModel.Address.aggregate([
                {
                    $match: {
                        user: new ObjectId(userId)
                    }
                },
                {
                    $project: {
                        address: {
                            $filter: {
                                input: "$Address",
                                as: "item",
                                cond: { $eq: ["$$item._id", new ObjectId(addressId)] }
                            }
                        }
                    }
                }
            ])
                .then(result => {
                    if (result.length === 0) {
                        resolve(null); // Address not found
                    } else {
                        resolve(result[0].address[0]); // Return the matched address
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    },

    //    PATCH EDIT ADDRESS
    patchEditAddress: (userId, addressId, UserData) => {
        return new Promise(async (resolve, reject) => {
            try {
                await addressModel.Address
                    .updateOne(
                        {
                            user: new ObjectId(userId),
                            "Address._id": new ObjectId(addressId),
                        },
                        {
                            $set: {
                                "Address.$": UserData,
                            },
                        }
                    )
                    .then((response) => {
                        resolve(response);
                    });
            } catch (error) {
                res.render("users/catchError", { message: error.message })
            }
        });
    },

    deleteAddress: (userId, addressId) => {
        return new Promise((resolve, reject) => {
            addressModel.Address.updateOne(
                { user: new ObjectId(userId) },
                { $pull: { Address: { _id: new ObjectId(addressId) } } }
            ).then((response) => {
                resolve(response)
            })
        })

    },

    //to get the current order
    getSubOrders: (orderId, userId) => {
        try {
            return new Promise((resolve, reject) => {
                orderModel.Order.aggregate([
                    {
                        $match: {
                            'user': new ObjectId(userId)
                        }
                    },
                    {
                        $unwind: '$orders'

                    },
                    {
                        $match: {
                            'orders._id': new ObjectId(orderId)
                        }
                    }

                ]).then((order) => {
                    resolve(order)
                })
            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },


    //to get the ordered products of the user
    getOrderedProducts: (orderId, userId) => {
        try {
            return new Promise((resolve, reject) => {
                orderModel.Order.aggregate([
                    {
                        $match: {
                            "user": new ObjectId(userId)
                        }
                    },
                    {
                        $unwind: "$orders"
                    },
                    {
                        $match: {
                            "orders._id": new ObjectId(orderId)
                        }
                    },
                    {
                        $unwind: "$orders.productDetails"
                    },
                    {
                        $project: {
                            "productDetails": "$orders.productDetails"
                        }
                    }
                ]).then((response) => {
                    resolve(response)
                })
            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },


    // to get the total of a certain product by multiplying with the quantity
    getTotal: (orderId, userId) => {
        try {
            return new Promise((resolve, reject) => {
                orderModel.Order.aggregate([
                    {
                        $match: {
                            "user": new ObjectId(userId)
                        }
                    },
                    {
                        $unwind: "$orders"
                    },
                    {
                        $match: {
                            "orders._id": new ObjectId(orderId)
                        }
                    },
                    {
                        $unwind: "$orders.productDetails"
                    },
                    {
                        $project: {
                            "productDetails": "$orders.productDetails",

                            "totalPrice": { $multiply: ["$orders.productDetails.productPrice", "$orders.productDetails.quantity"] }
                        }
                    }
                ]).then((response) => {
                    resolve(response)
                })
            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },

    //to find the total of the order
    getOrderTotal: (orderId, userId) => {
        try {
            return new Promise((resolve, reject) => {
                orderModel.Order.aggregate([
                    {
                        $match: {
                            "user": new ObjectId(userId)
                        }
                    },
                    {
                        $unwind: "$orders"
                    },
                    {
                        $match: {
                            "orders._id": new ObjectId(orderId)
                        }
                    },
                    {
                        $unwind: "$orders.productDetails"
                    },
                    {
                        $group: {
                            _id: "$orders._id",
                            totalPrice: { $sum: "$orders.productDetails.productPrice" }
                        }
                    }

                ]).then((response) => {
                    if (response && response.length > 0) {
                        const orderTotal = response[0].totalPrice
                        resolve(orderTotal)
                    }
                })
            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },

    // get order by date

    getOrderByDate: () => {
        return new Promise(async (resolve, reject) => {
            const startDate = new Date();
            startDate.setHours(0, 0, 0, 0); // Set time to the beginning of the current day
            console.log(startDate, 'Start date');
            await orderModel.Order
                .find({ createdAt: { $gte: startDate } })
                .then((response) => {

                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },


    getOrderByCategory: () => {
        return new Promise(async (resolve, reject) => {
            await orderModel.Order.aggregate([
                { $unwind: "$orders" },
            ]).then((response) => {
                const productDetails = response.map(order => order.orders.productDetails);
                resolve(productDetails)

            })
        })
    },


    //to change the order status by admin
    changeOrderStatus: (orderId, status) => {
        try {
            return new Promise((resolve, reject) => {
                orderModel.Order.updateOne(
                    { 'orders._id': orderId },
                    {
                        $set: { 'orders.$.orderConfirm': status }
                    }).then((response) => {

                        resolve(response)
                    })
            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },


    updatePaymentStatus: (orderId, userId) => {
        try {
            return new Promise((resolve, reject) => {
                cartModel.Order.aggregate([
                    {
                        $match: {
                            'user': new ObjectId(userId)
                        }
                    },
                    {
                        $unwind: '$orders'
                    },
                    {
                        $match: {
                            'orders._id': new ObjectId(orderId)
                        }
                    },
                    {
                        $set: {
                            'orders.paymentStatus': 'refunded'
                        }
                    }
                ]).then((response) => {

                    resolve(response)
                })
            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },
    getAllOrder: () => {
        try {
            return new Promise(async (resolve, reject) => {
                let Order = await orderModel.Order.aggregate([{ $unwind: "$orders" }, { $sort: { _id: -1 } }]).then((response) => {
                    resolve(response)
                })
            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },


    // wallet
    addWallet: (userId, total) => {

        try {
            return new Promise((resolve, reject) => {

                cartModel.user.updateOne({ _id: userId },
                    {
                        $inc: { wallet: total }
                    }).then((response) => {
                        resolve(response)
                    })
            })
        } catch (error) {
            res.render("users/catchError", { message: error.message })
        }
    },

    createData: (orders, product, address) => {


        // let address = details.shippingAddress;
        // let product = details.productsDetails;
        console.log(product);
        var data = {
            // Customize enables you to provide your own templates
            // Please review the documentation for instructions and examples
            customize: {
                //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
            },
            images: {
                // The logo on top of your invoice
                logo: "",
                // The invoice background
                background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
            },
            // Your own data
            sender: {
                company: "BrandsOnline",
                address: "UB city",
                zip: "996585",
                city: "Bangalore",
                country: "India",
            },
            // Your recipient
            client: {
                // company: address[0].item.fname,
                // address: address[0].item.street,
                // zip: address[0].item.pincode,
                // city: address[0].item.city,
                country: "India",

            },

            information: {
                // number: address[0].item.mobile,
                date: "12-12-2021",
                "due-date": "31-12-2021",
            },

            products: [
                {
                    quantity: product[0][0].quantity,
                    description: product[0][0].productName,
                    "tax-rate": 6,
                    price: product[0][0].productPrice,
                },
            ],
            // The message you would like to display on the bottom of your invoice
            "bottom-notice": "Thank you for your order ",
            // Settings to customize your invoice
            settings: {
                currency: "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
            },
            // Translate your invoice to your preferred language
            translate: {},
        };

        return data;
    },



}