const express=require("express");
const app=express();

const bodyParser=require("body-parser");
const mongoose=require("mongoose");
mongoose.set('strictQuery', false);
const ejs=require("ejs");
const bcrypt=require("bcrypt");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const randToken=require("rand-token");
const nodemailer=require("nodemailer");
const Transporter = require("nodemailer-smtp-transport");
const dotenv=require('dotenv').config();

        

// MODELs
const User=require("./models/user");
const Reset=require("./models/reset");
const Favourite=require("./models/favourite");
const Ingredient=require("./models/ingredient");
const Receipe=require("./models/receipe");
const Schedule=require("./models/schedule");

require("dotenv").config();
//SESSION
app.use(session({
	secret:"keyboard cat",
	resave:false,
	saveUninitialized:false,
	cookie: { secure: false } //prend en charge non HTTPS si HTTPS seulement true

}));

app.use(passport.initialize());
app.use(passport.session());

//mongoose.connect("mongodb+srv://kombate:1999@cluster0.ammj4a6.mongodb.net/cooking?retryWrites=true&w=majority");
mongoose.connect("mongodb://localhost:27017/");

//PASSPORT LOCAL MONGOOSE
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//EJS Instance
app.set("view engine","ejs");

//PUBLIC
app.use(express.static("public"));



// instancier body parser
app.use(bodyParser.urlencoded({ extended: false }));

const methodOverride=require("method-override");
const flash=require("connect-flash");
const receipe = require("./models/receipe");
const ingredient = require("./models/ingredient");
const schedule = require("./models/schedule");
app.use(flash());
app.use(methodOverride('_method'));//initilaisation de la methode override
app.use(function (req, res, next) {
	res.locals.currentUser=req.user;
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	

	next();
});

app.get("/",function (req,res) {
	res.render("index");
});

app.get("/signup",function(req,res) {
	res.render("signup");
});

app.post("/signup",function(req,res) {
	/*const saltRounds=10;
	bcrypt.hash(req.body.password,saltRounds,function (err,hash) {
		const user={
		username:req.body.username,
		password:hash
	}

	User.create(user)
		
		.then((User) => {
  		res.render("index");
		})
		.catch((err) => {
  		console.log(err);
		})
	})
	*/
	const newUser= new User({
		username:req.body.username
	});
	User.register(newUser,req.body.password,function (err,user) {
		if (err) {
			console.log(err);
			res.render("signup");
		}else{
			passport.authenticate("local")(req,res,function () {
				res.redirect("signup");
			})
		}
	});
	
});

	
app.get("/login",function (req,res) {
	res.render("login");
});

/*app.post("/login",function (req,res) {
	User.findOne({username:req.body.username},function (err,findUser) {
		if (err) {
			console.log(err);
		}else{
			if (findUser) {
				if (findUser.password==req.body.password) {
					res.render("index");
				}
			}
		}
	})
})*/

app.post("/login", function (req, res) {
  /*User.findOne({ username: req.body.username })
    .then(findUser => {
      if (findUser) {
      	bcrypt.compare( req.body.password,findUser.password,function (err,result) {
      		if (result==true) {
      			console.log("Bien conecté");
      			res.render("index");
      		}else{
      			res.send("Incorrect password");
      		}
      	})
        
      } else {
        res.send("User not found");
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send("Internal Server Error");
    });*/
    const user= new User({
		username:req.body.username,
		password:req.body.password
	});
	req.login(user,function (err) {
		if (err) {
			console.log(err);
			res.redirect("/login");
		}else{
			passport.authenticate("local")(req,res,function (){
			req.flash("success", "Félicitation tu es connecté");
			res.redirect("/dasboard1");
			})
		}
	})
});
app.get("/dasboard1", isLoggedIn, function (req,res) {
	console.log(req.user);
	res.render("dasboard1");
});

app.get("/logout",function (req,res){
	req.flash("success", "Aurevoir, Tu es déconnecté");
	
	res.redirect("/login");
		
});

app.get("/forgot", function(req, res){
	res.render("forgot");

});

app.post("/forgot", function (req, res){
	 
	User.findOne({ username: req.body.username })
    .then(findUser => {
      if (findUser) {
      	const token=randToken.generate(16);
		Reset.create({
			username: findUser.username,
			resetPasswordToken:token,
			resetPasswordExpires: Date.now() + 3600000 // 1 heure


		});

		

const transporter = nodemailer.createTransport({
 host: 'smtp.example.com',
  port: 587, // ou 465 pour SSL
  secure: false, // true pour SSL
  requireTLS:true,
  service: 'gmail',
  auth: {
    user: "youmanle1999@gmail.com" ,
    pass: "zruy xlpl mdpj odwx"
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
  logger: true, // Activer le débogage pour obtenir des informations détaillées
  debug: true
});

const mailOptions = {
  from: "youmanle1999@gmail.com",
  to: req.body.username,
  subject: 'Initialisation de mot de passe',
  //text: 'Appuyer sur ce lien pour changer votre mot de passe : http://localhost:3000/reset'+token,
  html: '<p>Lien pour modifier votre mot de passe <a href="http://localhost:3000/reset/' + token + '">cliquez ici</a>.</p>'
}
console.log("Le mail est pret a etre envoyé");

transporter.sendMail(mailOptions, function(err, res) {
  if(err){
     console.log(err);
  }else{
	res.redirect("/login");
}
  
});


	/*	const transporter=nodemailer.createTransport({
			service:'gmail',
			auth:{
				user:'inscriptionbourse2023@gmail.com',
				pass:'1234'

			}

		});
		
		const mailOptions={
			from:'inscriptionbourse2023@gmail.com',
			to:req.body.username,
			subject:'Lien pour reset votre mot de passe ',
			text:'Appuyer sur ce lien pour changer votre mot de passe : http://localhost:3000/reset'+token
		}
		console.log('Le mail est pret à etre envoyé');
		transporter.sendMail(mailOptions,function (err,response) {
			if (err) {
				console.log(err);
			}else{
				res.redirect("/login");
			}
			
		});*/

        
      } else {
        res.send("User not found");
      }
    })
    .catch(err => {
      console.log(err);
      res.redirect("/login");
    });

});

app.get('/reset/:token' , function (req, res){

	Reset.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires:{$gt:Date.now()}
	}).then(obj=>{
		if(obj){
			res.render("reset", {token:req.params.token});
			
		}

	})
	.catch(err => {
		console.log("Token expiré");
		res.redirect("/login");
	  });

});

app.post('/reset/:token' , function (req, res){

	Reset.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires:{$gt:Date.now()}
	}).then(obj=>{
		if(obj){

			if(req.body.password === req.body.password2){
				User.findOne({username:obj.username})
				.then(user=>{
					if(user){
						
						user.setPassword(req.body.password, function(err) {
							if(err){
								console.log(err);
							}else{
								user.save();
								const updateReset = {
									resetPasswordToken: null,
									resetPasswordExpires: null
								}
								Reset.findOneAndUpdate({resetPasswordToken:req.params.token}, updateReset)
								 .then(()=> {
									res.redirect('/login');
									})
									.catch(err => {
										console.log(err);
									  });
										
									}
								});
							}
						})
						.catch(err => {
							console.log(err);
							
						  });
					}
				}
					
				})
				.catch(err => {
					console.log("Token expiré");
					res.redirect("/login");
				  });
			});

//routes receipe 
app.get("/dashboard1/myreceipes", isLoggedIn,function (req,res) {
	
	Receipe.find({
		user:req.user.id
	}).then(receipe=>{
			if (receipe) {
				res.render("receipe",{receipe:receipe});
			}
			
	}).catch(err=>{
		console.log(err);
	});	
	
});
app.get("/dashboard1/newreceipe",isLoggedIn,function (req, res) {
	res.render("newreceipe");
});
app.post("/dashboard1/newreceipe",function (req, res) {
	const newReceipe = {
		name:req.body.receipe,
		image:req.body.logo,
		user:req.user.id
	};
	Receipe.create(newReceipe).
	then(newReceipe=>{
		req.flash("success", "Receitte ajouté");
		res.redirect("/dashboard1/myreceipes");

	}).catch(err=>{
		console.log(err);
	});
	
});



app.get("/dashboard1/myreceipes/:id", function (req,res) {
	Receipe.findOne({user:req.user.id, _id:req.params.id}).then(receipeFound=>{
			Ingredient.find({
				user:req.user.id,
				receipe:req.params.id
			}).then(ingredientFound=>{
				res.render("ingredients",{
					ingredient:ingredientFound,
					receipe:receipeFound
				});

			}).catch(err=>{
				console.log(err);

			});
	}).catch(err=>{
		console.log(err);
	});
});

app.delete("/dashboard1/myreceipes/:id", isLoggedIn, function (req, res) {
	Receipe.deleteOne({_id:req.params.id}).then(()=>{
		req.flash("success", "Recette bien supprimé");
		res.redirect("/dashboard1/myreceipes");

	}).catch(err=>{
		console.log(err);
	});
});

// ROutes ingredients

app.get("/dashboard1/myreceipes/:id/newingredient", function (req,res) {
	Receipe.findById({_id:req.params.id}).then(found=>{
		res.render("newingredient", {receipe:found});

	}).catch(err=>{
		console.log(err);
	});
});

app.post("/dashboard1/myreceipes/:id", function (req, res) {
	const newIngredient={
		name:req.body.name, // c'est body parser c'est un input et parms c'est les parametre
		bestDish:req.body.dish,
		user:req.user.id,
		quantity:req.body.quantity,
		receipe:req.params.id

	};
	Ingredient.create(newIngredient).then(newIngredient=>{
		req.flash("success","Ingredient ajouté avec succès");
		res.redirect("/dashboard1/myreceipes/"+req.params.id);

	}).catch(err=>{
		console.log(err);

	});
});

app.delete("/dashboard1/myreceipes/:id/:ingredientid", isLoggedIn, function (req, res) {
	Ingredient.deleteOne({_id:req.params.ingredientid}).then(()=>{
		req.flash("success","suppression ingredient réussi");
		res.redirect("/dashboard1/myreceipes/"+req.params.id);

	}).catch(err=>{
		console.log(err);
	});
	
});

app.post("/dashboard1/myreceipes/:id/:ingredientid/edit", isLoggedIn, function (req, res) {
	Receipe.findOne({user:req.user.id,_id:req.params.id}).then(receipeFound=>{
		Ingredient.findOne({_id:req.params.ingredientid,
			receipe:req.params.id

		}).then(ingredientFound=>{
			res.render("edit", {
				ingredient:ingredientFound,
				receipe:receipeFound
			});

		}).catch(err=>{
			console.log(err);
		});

	}).catch(err=>{
		console.log(err);

	});
});

app.put("/dashboard1/myreceipes/:id/:ingredientid/", isLoggedIn, function (req, res) {
	const ingredient_updated={
		name:req.body.name,
    	bestDish:req.body.dish,
		user:req.user.id,
    	quantity:req.body.quantity,
    	receipe:req.params.id

	};
	Ingredient.findByIdAndUpdate({_id:req.params.ingredientid}, ingredient_updated)
	.then(updatedIngredient=>{
		req.flash("success","Ingredient bien mis à jour");
		res.redirect("/dashboard1/myreceipes/"+req.params.id);

	}).catch(err=>{
		console.log(err);
	});
});


//FAVOURITES RECEIPES

app.get("/dashboard1/favourites",isLoggedIn, function (req, res) {
	Favourite.find({user:req.user.id}).then(favourite=>{
		res.render("favourites", {favourite:favourite});

	}).catch(err=>{
		console.log(err);
	});
	
});

app.get("/dashboard1/favourites/newfavourite", isLoggedIn, function (req, res) {
	res.render("newfavourite");
});

app.post("/dashboard1/favourites", isLoggedIn,function (req, res) {
	const newFavourite={
		title:req.body.title,
		image:req.body.image,
		description:req.body.description,
    	user:req.user.id,
	};
	Favourite.create(newFavourite).then(newFavourite=>{
		req.flash("success", "Une Favories ajoutée merci!");
		res.redirect("/dashboard1/favourites");

	}).catch(err=>{
		console.log(err);
	});
	
});

app.delete("/dashboard1/favourites/:id", isLoggedIn, function (req, res) {
	Favourite.deleteOne({_id:req.params.id}).then(()=>{
		req.flash("success", "Votre favorie est supprimée");
		res.redirect("/dashboard1/favourites");
	}).catch(err=>{
		console.log(err);
	});
});

// SCHEDULE ROUTES
app.get("/dashboard1/schedule",isLoggedIn, function (req,res) {
	Schedule.find({user:req.user.id}).then(schedule=>{
		res.render("schedule",{schedule:schedule});
	}).catch(err=>{
		console.log(err);
	});
	
});
app.get("/dashboard1/schedule/newschedule",isLoggedIn,function (req, res) {
	res.render("newSchedule");
});
app.post("/dashboard1/schedule",isLoggedIn, function (req,res) {
	const newSchedule={
		ReceipeName:req.body.receipename,
		scheduleDate:req.body.scheduleDate,
    	user:req.user.id,
    	time:req.body.time
	};
	Schedule.create(newSchedule).then(newSchedule=>{
		req.flash("success","Une nouvelle programmation ajoutée");
		res.redirect("/dashboard1/schedule");
	}).catch(err=>{
		console.log(err);
	});
});
app.delete("/dashboard1/schedule/:id", isLoggedIn, function (req,res) {
	Schedule.deleteOne({_id:req.params.id}).then(()=>{
		req.flash("success","Programmation bien supprimée");
		res.redirect("/dashboard1/schedule");
	}).catch(err=>{
		console.log(err);
	});
});
//Fonction de connection			

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();

		
	}else{
		req.flash("error", "Connectes-toi d'abord");
		res.redirect("/login");
	}		

}
		
app.listen(3000,function (req,res) {
	console.log("Tout marche très bien!");
});
