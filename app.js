const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const path = require("path")
const fileUpload = require("express-fileupload")



const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const { count } = require("console")


const app = express()

app.use(session({
    secret: "My secret 123",
    resave: false,
    saveUninitialized: false,
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());


//connection to mongoose
mongoose.Promise = global.Promise;
const mongoURL = "mongodb://localhost:27017/CustomerGo"

const connectDB = () => {
    try {
        mongoose.connect(mongoURL, { useNewUrlParser: true, autoIndex: false }, () => {
            console.log("Connected to the Mongo Database");
        })
    } catch (err) {
        console.log(err);
    }
}

connectDB();

//schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "",
    },
    total_orders:{
        type: String,
        default: "",
    },
    password: {
        type: String,
    },
    cpassword: {
        type: String,
    },
    email: {
        type: String,
        // unique: true,
    },
    phone:
    {
        type: String,
        default: "",
    },
    gender:
    {
        type: String,
        default: "",
    },
    image:
    {
        type: String,
        default: "",
    },
})

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function (req, res) {
    res.render("home.ejs")
})


app.get("/register", function (req, res) {
    res.render("register_user.ejs")
})

app.get("/login", function (req, res) {
    res.render("login_user.ejs")
})

app.get("/s", function (req, res) {
    res.render("sample.ejs")
})

app.post("/save_user", function (req, res) {

    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            res.redirect("/login")
        }
    });

});


global.my_name = '';
global.my_id = '';



app.post("/user_login", function (req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    my_name = user.username;

    User.find({ username: my_name }, function (err, got) {
        if (err) {
            console.log(err)
        }
        console.log(got);
        my_id = got[0]._id.toString();
        console.log(my_id)
    })

    req.login(user, function (err) {

        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    });

});





app.get("/secrets", function (req, res) {
    User.find({ "secret": { $ne: null } }, function (err, foundUsers) {
        if (err) {
            console.log(err);
        } else {
            if (foundUsers) {
                res.render("user_page", { usersWithSecrets: foundUsers });
            }
        }
    });
});

//displaying the orders
const orderSchema = new mongoose.Schema({
    id: {
        type: String
    },
    name: {
        type: String
    },
    quantity: {
        type: Number
    },
    product_id: {
        type: String
    },
    orderId: {
        type: Number
    },
    orderDate: {
        type: Date
    },
    orderStatus:{
        type: String
    },

})

const Order = mongoose.model('Order', orderSchema)

global.total_order = 0;

app.get("/get_product", function (req, res) {
    const id = my_id;
    console.log(id)
    Order.find({ id: id }, function (err, orders) {
        res.render("all_orders", {
            productList: orders
        })
    })

    Order.find({ id: id }, function (err, orders) {
        let len = orders.length;

        total_order = len.toString();
    })

})

global.m_id = '';

//profile part
app.get("/edit_profiles/:id", function (req, res) {
    const id = req.params.id;
    m_id = id.toString();
    try {
        User.findOne({ _id: id }, (err, user) => {
            if (!user) {
                console.log("ID not Found")
            }
            else {
                console.log(user)
                if (user) {
                    res.render("user-edit", { user: user })
                }
            }
        })
    } catch (err) {
        console.log(err);
    }
})

app.post("/student_profile_edit", function (req, res) {
    if (!req.files) {
        return res.status(400).send('No files were uploaded.');
    }

    var file = req.files.uploaded_image;
    var img_name = file.name;



    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif") {
        file.mv('public/upload_images/' + file.name, function (err) {
            if (err) {
                return res.status(500).send(err);
            }
            else {
                const phone = req.body.pmobile;
                const name = req.body.pname;
                const gender = req.body.pgender;
                const total_orders = total_order;

                try {

                    User.findOneAndUpdate({
                        _id: m_id,
                    },
                        {
                            image: img_name,
                            phone: phone,
                            name: name,
                            gender: gender,
                            total_orders: total_orders,
                        },
                        function (err, results) {
                            if (err) {
                                console.log(err)
                            }
                            else {

                                res.redirect("/user_profile")
                            }
                        }
                    )

                } catch (err) {
                    console.log(err);
                }
            }
        })
    }


})

app.get("/user_profile", function (req, res) {
    try {
        User.findOne({ _id: my_id }, (err, user) => {
            if (!user) {
                console.log("ID not Found")
            }
            else {
                if (user) {
                    res.render("user-profile", { users: user })
                }
            }
        })
    } catch (err) {
        console.log(err);
    }
})


app.post("/save", function (req, res) {

    let productid = Math.floor((Math.random() * 10000000000000) + 1);
    console.log(productid);

    let order_id = Math.floor((Math.random() * 100) + 1);
    console.log(order_id)


    const neworder = new Order({
        id: my_id,
        name: req.body.name,
        quantity: req.body.quantity,
        product_id: productid,
        orderId: order_id,
        orderDate: Date.now(),
        orderStatus: "Processing",
    });

    neworder.save(function (err, or) {
        if (err) return console.error(err);
        else {
            res.redirect("/get_product")
        }
    });


})

global.my_id2 = '';

app.get("/edit/:id", function (req, res) {
    const id = req.params.id;
    my_id2 = id.toString();

    try {
        Order.findOne({ _id: id }, (err, user) => {
            if (!user) {
                console.log("ID not Found")
            }
            else {
                if (user) {
                    res.render("edit_quantity", { user: user })
                }
            }
        })
    } catch (err) {
        console.log(err);
    }
})


app.post("/update_product", function (req, res) {
    const quantity = req.body.quantity;
    const status = req.body.status;
    try {
        Order.findOneAndUpdate({
            _id: my_id2,
        },
            {
                quantity: quantity,
                orderStatus: status,

            },
            function (err, results) {
                if (err) {
                    console.log(err)
                }
                else {

                    res.redirect("/get_product")
                }
            }
        )

    } catch (err) {
        console.log(err);
    }

})

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/")
})


app.get("/place_order", function (req, res) {

    res.render("place_order.ejs")
})

app.get("/get_customers", function (req, res) {
    User.find({}, function (err, users) {
        res.render("get_customers", {
            users: users
        })
    })
})

app.listen(3000, function () {
    console.log("successfully started at 3000")
})