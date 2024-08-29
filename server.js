const express = require('express');
const path = require('path');
const passport = require('passport');
const session = require('express-session')
const SteamStrategy = require('passport-steam').Strategy;
const fileupload = require('express-fileupload');
const exp = require('constants');
const { initializeApp } = require("firebase/app")
const { getFirestore, addDoc, collection, getDocs, setDoc, doc } = require('firebase/firestore');
const { kMaxLength } = require('buffer');
const steaminventory = require('get-steam-inventory');

let initial_path = path.join(__dirname, "views");

// Firebase Setup

const firebaseConfig = {

    apiKey: "AIzaSyBRasi1BGcph-u8n2XjiK7ruUKlTYriVdI",
  
    authDomain: "basicwebtest-28c21.firebaseapp.com",
  
    databaseURL: "https://basicwebtest-28c21-default-rtdb.firebaseio.com",
  
    projectId: "basicwebtest-28c21",
  
    storageBucket: "basicwebtest-28c21.appspot.com",
  
    messagingSenderId: "626495824572",
  
    appId: "1:626495824572:web:5845c1f9e980c80b0226b9",
  
    measurementId: "G-2NV8GLRX7G"
  
};
  
const fApp = initializeApp(firebaseConfig);
let db = getFirestore(fApp);

// Passport Setup

passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new SteamStrategy({
    returnURL: 'https://skindb.onrender.com/auth/steam/return',
    realm: 'https://skindb.onrender.com/',
    apiKey: '36FB4EB1091C2553C1E9C8DB5135ED5C'
  },
  function(identifier, profile, done) {
    process.nextTick(function () {
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));


// App Setup

const app = express();
app.set('views', __dirname + '/views');
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(session({
    secret: 'testSecret',
    name: 'testName',
    resave: true,
    saveUninitialized: true}));
app.use(express.static(initial_path));
app.use(express.json())
app.use(express.urlencoded());
app.use(fileupload());
app.use(passport.initialize());
app.use(passport.session());


// Routing

app.get('/', (req, res) => {
    res.render("main", {user:req.user});
    
})

app.get('/main', (req, res) => {
    res.render("main", {user:req.user});
    
})

app.get('/dashboard', async function(req, res){
    if(req.user){
        let data = await steaminventory.getinventory(730, req.user.id, '2');
        setDoc(doc(db, "test-collection", req.user.id), {invData :data.raw.descriptions, profilePicture : req.user.photos[2].value, displayName : req.user.displayName});
        res.render("dashboard", {user :req.user, invData : data.raw.descriptions});
    }
    else{
        res.render("dashboard", {user :null, invData : null});
    }
    
    
    
    //res.sendFile(path.join(initial_path, "dashboard.html"));
})

app.get("/test", (req, res) => {
    res.sendFile(path.join(initial_path, "tester.html"))
})

app.get('/index', (req, res) => {
    res.sendFile(path.join(initial_path, "index.html"));
});


app.get('/auth/steam',
    passport.authenticate('steam', { failureRedirect: '/' }),
    function(req, res) {
      res.redirect('/dashboard');
});

app.get('/auth/steam/return',
    passport.authenticate('steam', { failureRedirect: '/' }),
    function(req, res) {
        res.redirect('/dashboard');
});

app.get('/logout', function(req, res){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/main');
      });
  });

app.get('/faq', (req, res) => {
    res.sendFile(path.join(initial_path, "faq.html"));
})

app.listen("3000", () => {
    console.log('listening......');
})