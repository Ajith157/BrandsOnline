module.exports = {

    adminAuth:(req,res,next)=>{
     
     if(req.session.admin){
     
         next()
     }else{
  
        res.render("admin/login", { layout: "adminLayout" });
     }
    },
 
    userAuth:(req,res,next)=>{

     if(req.session.user){
         next()
     }else{
         res.render('users/userlogin')
     }
    },
 
 }