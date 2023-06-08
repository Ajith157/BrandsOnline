var express = require('express');
var router = express.Router();
const adminController = require('../controller/adminController');
const userController = require('../controller/userController');
const orderController = require('../controller/orderController')
const multer = require('../multer/multer');
const auth = require('../middleware/auth')
const { admin } = require('../model/schema');





//  GET LOGIN 
router.get('/', auth.adminAuth, adminController.getLogin)

// POST LOGIN
router.post('/login', adminController.postLogin);

// GET LOGOUT
router.get('/logout', adminController.getLogout)
// GET DASHBOARD
router.get('/dashboard', auth.adminAuth, adminController.getDashboard)
// GET USERLIST
router.get('/userlist', auth.adminAuth, adminController.getUserlist)
// BLOCK USER
router.patch('/user-status-block/:id', auth.adminAuth, adminController.getBlockuser)
// UN BLOCK USER
router.patch('/user-status-unblock/:id', auth.adminAuth, adminController.getUnblockuser)

// ADD PRODUCT
router.get('/addproducts', auth.adminAuth, adminController.getAddproduct)
// POST ADD PRODUCT
router.post('/addproducts', auth.adminAuth, multer.uploads, adminController.postAddproduct)

// GET EDIT PRODUCT
router.get('/editproduct/:id', auth.adminAuth, adminController.getEditproduct)

// POST EDIT PRODUCT
router.post('/editproduct/:id', auth.adminAuth, multer.editeduploads, adminController.postEditproduct)
// DELETE EDIT PRODUCT
router.delete('/deleteproduct/:id', auth.adminAuth, adminController.deleteProduct)
// GET PRODUCT LIST
router.get('/productlist', auth.adminAuth, adminController.getProductlist)
// GET ADD CATEGORY
router.get('/addCategory', auth.adminAuth, adminController.getAddcategory)
// POST ADD CATEGORY
router.post('/addCategory', auth.adminAuth, adminController.postAddcategory)
// GET EDIT CATEGORY
router.get('/edit-category/:id', auth.adminAuth, adminController.getEditcategory)

//  POSTEDIT CATEGORY
router.patch('/edit-category/:id', auth.adminAuth, adminController.postEditcategory)

// DELETE CATEGORY
router.delete('/api/delete-category/:id', auth.adminAuth, adminController.deleteCategory)

router.route('/add-coupon').get(auth.adminAuth, adminController.getAddCoupon)

router.route('/generate-coupon-code').get(auth.adminAuth, adminController.generatorCouponCode)



/* GET Add Coupon Page. */
router.route('/add-coupon').get(auth.adminAuth, adminController.getAddCoupon).post(adminController.postaddCoupon)


/* GET Coupon List Page. */
router.route('/coupon-list').get(auth.adminAuth, adminController.getCouponList)
// REMOVE COUPON
router.route('/remove-coupon').delete(auth.adminAuth, adminController.removeCoupon)
// ADD BANNER
router.route('/add-banner').get(auth.adminAuth, adminController.getAddBanner).post(multer.addBannerupload, adminController.postAddBanner)
// GET BANNER LIST
router.route('/banner-list').get(auth.adminAuth, adminController.getBannerList)
// GET EDIT BANNER
router.route('/edit-banner').get(auth.adminAuth, adminController.getEditBanner)
// POST EDIT BANNAR
router.route('/edit-banner').post(auth.adminAuth, multer.editBannerupload, adminController.postEditBanner)
// DELETE BANNER
router.route('/delete-banner/:id').delete(auth.adminAuth, adminController.deleteBanner)
// GET ORDER LIST
router.route('/order-list/:id').get(auth.adminAuth, adminController.getOrderList)
// GET ORDER DETAILS
router.route('/order-details').get(auth.adminAuth, adminController.getOrderDetails)
// GET SALES REPORT
router.get('/sales-report', auth.adminAuth, adminController.getSalesReport)
// POST SALES REPORT
router.post('/sales-report', auth.adminAuth, adminController.postSalesReport)
// CHANGE OEDER STATUS
router.route('/change-order-status').post(auth.adminAuth, orderController.changeOrderStatus)














module.exports = router;







