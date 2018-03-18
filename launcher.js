// release branch
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var crypto = require('crypto');
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var jwt = require('jwt-simple');
var moment = require('moment');
var async = require('async');
var request = require('request');
var xml2js = require('xml2js');
var agenda = require('agenda')({ db: { address: 'localhost:27017/agenda', collection: 'onitAgenda' } , processEvery: '10 seconds'});
var sugar = require('sugar');
var nodemailer = require('nodemailer');
var _ = require('lodash');
var fs = require('fs');
var formidable = require('formidable');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var Q = require('q');


var tokenSecret = 'your unique secret';
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
var youtubeFolder = path.join(__dirname, 'public/youtube/videos');

let Promise = require('bluebird');
const TelegramBot = require('node-telegram-bot-api');
const token = '430103329:AAFeFKj6WaqRpyh9CyX4ZSMtOiTEaN6UOAM';
// const PAYMENT_API = 'a539036b4734cddd43aa8dd61e593e7c';
const PAYMENT_API = 'test';
const PAYMENT_URL = 'https://pay.ir/payment/verify';
const bot = new TelegramBot(token, {polling: true});


bot.on('message', (msg) => { //dev
  if (msg.from.id == 34106450) {
    if (msg.reply_to_message && msg.reply_to_message.forward_from) {
      bot.sendMessage(msg.reply_to_message.forward_from.id, msg.text);
    }
  } 
  else {
      bot.forwardMessage(34106450, msg.chat.id, msg.message_id);
    }
  
  console.log(msg)
})

// agenda.define('send project auto', function(){
//   telegrammer('project', {mobile: '09355520208'});
// })

// agenda.on('ready', function(){
//   // agenda.every('20 seconds', 'send project auto');

//   // agenda.start();

//   var repeater = agenda.create('send project auto');
//   repeater.repeatEvery('20 seconds').save();
//   agenda.start();

// })



var userSchema = new Schema({

  // _creator: {type: Number, ref: 'Course'},
  // name: { type: String, trim: true, required: true },
  mobile : {type: Number, default: ''},
  email: { type: String, unique: true, lowercase: true, trim: true , required: true},
  image: {type: String},
  password: { type: String },
  facebook: {
    id: String,
    email: String
  },
  google: {
    id: String,
    email: String
  }, 
  bids: [{type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'}], 
  tags: [{type: String, default: ''}], 
  summary: {type: String, default: ''},
  resumes: [{ 
    title: {type: String, default: ''},
    category: {type: String, default: ''},
    start: {type: String, default: ''},
    finish: {type: String, default: ''},
    desc: {type: String, default: ''}
  }], 
  educations: [{
    name: {type: String, default: ''},
    start: {type: String, default: ''},
    finish: {type: String, default: ''},
    field: {type: String, default: ''},
    grade: {type: String, default: ''}
  }], 
  projects: [{type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', default: null}], 
  messages: [{
    receiver: {type: mongoose.Schema.Types.ObjectId, default: null}, 
    box: [{
      text: {type: String, default: ''},
      time_sent: {type: Date, default: new Date}, 
      seen: {type: Boolean}
    }]
  }],
  articles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Article', default: null}], 
  sign_up_date: {type: String, default:new Date()}, 
  last_sign_in: {type: String, default:new Date()}
});

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

var customerSchema = new mongoose.Schema({
  mobile : {type: String, default: '09121488948'},
  email: { type: String, unique: true, lowercase: true, trim: true , required: true},
  password: { type: String }, 
  deposits: {type: mongoose.Schema.Types.ObjectId, ref: 'Wallet'},
  balance : {type: Number, default: 0}, 
  projects : [{type: mongoose.Schema.Types.ObjectId, ref: 'Project'}]
});

customerSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

customerSchema.methods.comparePassword = function(cP, cb) {
  bcrypt.compare(cP, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

var walletSchema = new mongoose.Schema({
  id: ObjectId,
  transId: Number,
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'Customer'},
  amount:  Number,
  message:  String,
  date:  String,
  mobile:  Number, 
  cardNumber: String, 
  factorNumber: Number
});

var jobSchema = new Schema({
  
    id: ObjectId,
    user: {type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', default: null}, 
    category: {type: Number, required: true},
    title: {type: String, required: true},
    tags: [{type: String, default: ''}],
    longDesc: {type: String, default: ''},
    budgetNumber: {type: String, default: ''},
    budgetRate: {type: String, default: ''},
    startedDate: {type: Date, default: ''},
    deadlineDate: {type: Date, default: ''},
    featured:  {type :Boolean, default: ''},
    views: {type: Number, default: ''},
    report: [{
      user: {type: mongoose.Schema.Types.ObjectId, 
             ref: 'User'},
      claim: {type: String, default: ''},
      report_date: {type: Date, default: new Date()},
      response_to_claim: {type: String, default: ''}, 
      status: {type:Number}
    }],
    reportCounter: {type: Number, default : ''},
    status: {type: Number, default: ''},
    poster: {type: String, default: ''},
    lastModifiedDate: {type: Date, default : ''},
    verified: {type: Boolean, default: ''},
    bids: [{type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid', default: null}], 
    updatedAt: {type: Date, default: new Date()}, 
    experts: [{type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', default: null}]
});


var bidSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    amount: String,
    days: String,
    post_date: Date,
    sponsored: Boolean,
    desc: String, 
    updatedAt: {type: Date, default: new Date()}
});

var projectSchema = new mongoose.Schema({
    id: ObjectId,
    projectCat: String,
    projectName: String,
    projectDesc: String,
    // username: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    username: String,
    fileName: [String],
    reCaptcha: String, 
    addedDate: String,
    lastUpdate: String
})

var expSchema = new mongoose.Schema({
    id: ObjectId,
    expName: String,
    expEmail: {type: String, required: true },
    expTel: {type: String, required: true},
    expResume: {type: String, required: true },
    expTelegram: {type: String},
    expVoiceCall: {type: Boolean},
    expApproved: {type: Boolean},
    expRejected: {type: Boolean},
    expRemoved: {type: Boolean},
    expAdded: {type: Date},
    expUpdated: {type: Date}
})



var articleSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  title: {type: String, required: true},
  keywords: [{type:String, default: 'giga'}],
  body: {type: String, required: true},
  desc: {type: String, required: true},
  image: {type: String, required: true},
  verified: {type: Boolean, default: 1},
  postedDate : {type: Date, default: Date.now},
  updatedAt : {type: Date},
  relateArticles : [{type: mongoose.Schema.Types.ObjectId, ref: 'Article'}]
});

articleSchema.pre('save', function(next) {
  var date = moment().format();
  console.log(date);
  this.update({},{ $set: { updatedAt: date } });
  next();
});

articleSchema.plugin(deepPopulate, {
  populate: {
    'user': {
      select: 'firstName lastName articles image'
    }
  }
});

var postSchema = new mongoose.Schema({
  owner: {type: String, required: true},
  img_code: {type: String, required: true, unique: true},
  date: {type: String, required: true},
  likes: {type: Number},
  thumbnail_src: {type: String, required: true}, 
  added_date: {type:String, default: new Date()}, 
  updatedAt: String
});

var Expert = mongoose.model('Expert', expSchema);

var Project = mongoose.model('Project', projectSchema);

var Customer = mongoose.model('Customer', customerSchema);

var Wallet = mongoose.model('Wallett', walletSchema);

var Job = mongoose.model('Job', jobSchema);

var Bid = mongoose.model('Bid', bidSchema);

var Article = mongoose.model('Article', articleSchema);

var Post = mongoose.model('Post', postSchema);

mongoose.connect('mongodb://localhost/onit', {useMongoClient: true});

// mongoose.connection.on('open', function () {
//   mongoose.connection.db.listCollections().toArray(function (err, names) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(names);
//     }

//     mongoose.connection.close();
//   });
// });

var app = express();

app.set('port', process.env.PORT || 1212);
// app.use(logger('dev'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
// app.set('views', path.join(__dirname, 'view/partials'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, '/')));
app.use(bodyParser({defer: true}));
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// var wall = new Wallet({
//   transId: 234234
// })
// wall.save(function(err, wall){
//   if (wall) {console.log(wall)}
// })

function ensureAuthenticated(req, res, next) {
  if (req.headers.authorization) {
    var token = req.headers.authorization.split(' ')[1];
    try {
      var decoded = jwt.decode(token, tokenSecret);
      if (decoded.exp <= Date.now()) {
        res.send(400, 'Access token has expired');
      } else {
        req.user = decoded.user;
        return next();
      }
    } catch (err) {
      return res.send(500, 'Error parsing token');
    }
  } else {
    return res.send(401);
  }
}

function createJwtToken(user) {
  var payload = {
    user: user,
    iat: new Date().getTime(),
    exp: moment().add('days', 7).valueOf()
  };
  return jwt.encode(payload, tokenSecret);
}

function vPayment(wallet) {

  var defer = Q.defer();
  var headers = {
      'User-Agent':       'Super Onita/0.0.1',
      'Content-Type':     'application/x-www-form-urlencoded'
  }
  // Configure the request
  var options = {
      url: PAYMENT_URL,
      method: 'POST',
      headers: headers,
      form: {
          'api': PAYMENT_API,
          'transId': wallet.transId
        }
  }

  // Start the request
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200 && body) {
      var amount = JSON.parse(body).amount;
      Wallet.findOne({ transId: wallet.transId }, function(err, wallet) {
        console.log(wallet)
        if (err) return console.log(err);
        if (wallet) {
          wallet.amount = amount;
          wallet.save(function(err, doc){
            if (err) return console.log(err);
            defer.resolve(doc);
          })
        } else {
            defer.reject();
        };
      });
    }
  })
  return defer.promise;
}


function telegrammer(reason, customer, amount){

  var defaultText
  
  switch (reason) {
    case 'deposit':
      defaultText = depositText;
      break;
    case 'project':
      defaultText = projectText;
      break;
  }

  var depositText = 
              `
              <a href="http://onita.ir/assets/images/200_deposit.png">&#8205</a>
              <strong>افزایش موجودی</strong>
              \n\n
              <code> مشتری ${customer.mobile}  </code>
              مبلغ ${amount} به حساب خود واریز کرد
              \n\n
              آخرین موجودی حساب ${customer.balance}
              \n\n
              🆔 <a href="http://t.me/onitatestchannel">@onitabot</a> 
              `;

  var projectText = 
              `
              <strong>ثبت پروژه جدید</strong>
              \n
              <code> مشتری ${customer.mobile}  </code>
              درخواست پروژه جدید ثبت کرده
              \n
              لطفا رسیدگی گردد !
              \n
              🆔 <a href="http://t.me/tele_job">@tele_job</a> 
              `;


  bot.sendMessage('34106450', projectText , {parse_mode: "html"});

}



app.post('/api/cpayment' ,function(req,res){

  if (req.body.status == 1) {
    Wallet.findOne({ transId: req.body.transId}, function(err, wallet) {
      if (err) return console.log(err);
      wallet = _.extend(wallet, req.body);
      wallet.save(function(err){
        if (err) return console.log(err);
        // vPayment(wallet);
        vPayment(wallet).then(function(doc){
          try {
            Customer.findOne({ _id: wallet.userId }, function(err, customer){
              if (err) return console.log(err)
              customer.balance += doc.amount;
              customer.save(function(err){
                if (err) return console.log(err);
                telegrammer('deposit', customer, doc.amount);
                res.redirect('/deposit/'+doc.transId+'/amount/'+doc.amount);
              })
            })
          } catch(err) {
            res.redirect('/deposit/'+doc.transId+'/amount/000000000');
            console.log(err);
          }
        }, function(err){
          res.status(200).send({err: 10001, msg: 'An error occured during payment amount verifying'});
        })
      })
    })
  } else {
    res.redirect('/deposit/error');
  }
  //   var wallet = new Wallet({
  //     factorNumber:  req.body.transId,
  //     userId: {type: mongoose.Schema.Types.ObjectId},
  //     msg:  req.body.message,
  //     date:  new Date(),
  //     mobile:  req.body.mobile
  //     projectCat: req.body.projectCat,
  //     projectName: req.body.projectName,
  //     projectDesc: req.body.projectDesc,
  //     // username: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  //     username: req.body.username,
  //     fileName: req.body.fileName,
  //     addedDate: new Date(),
  //     lastUpdate: new Date()
  // }
  // });
  // project.save(function(err) {
  //   if (err) return next(err);
  //   res.send(200);
  // });
  // }
  
})


app.post('/api/payment', ensureAuthenticated ,function(req,res){

// Set the headers
var headers = {
    'User-Agent':       'Super Onita/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
}
// Configure the request
var options = {
    url: req.body.url,
    method: 'POST',
    headers: headers,
    form: {
        'api': PAYMENT_API,
        'amount': req.body.amount,
        'redirect': req.body.redirect, 
        'mobile': req.body.mobile,
        'factorNumber': req.body.factorNumber
      }
}
// Start the request
request(options, function (error, response, body) {
    if (!error && response.statusCode == 200 && body) {
        var transId = JSON.parse(body).transId;
        Wallet.findOne({ transId: transId }, function(err, wallet) {
          if (err) return console.log(err);
          if (wallet) {
            res.status(200).send({err: 10001, msg: 'factorNumber duplication error !'});
          } else {
            var wall = new Wallet({
              transId: transId, 
              userId: req.user._id
            });
            wall.save(function(err, wallet){
              if (err) return console.log(err);
              res.status(200).send(body);
            });
          }
        });
       
        
    } else {
      res.status(500).send({err: 50005, msg: 'something is not right here'});
    }
})
})



app.get('/api/experts', function(req,res,next){
  var query = Expert.find({}).exec(function(err, expertsList) {  
    if (err) return next(err);
    res.send(expertsList);
  });
})

app.post('/api/expert', function(req,res,next){
  var expert = new Expert({
    expName: req.body.expName,
    expEmail: req.body.expEmail,
    expTel: req.body.expTel,
    expResume: req.body.expResume,
    expTelegram: req.body.expTelegram,
    expVoiceCall: req.body.expVoiceCall,
    expAdded: new Date(), 
    expApproved: '',
    expRejected: '',
    expRemoved: '',
  });
  expert.save(function(err) {
    if (err) return next(err);
    res.send(200);
  });
})



app.post('/api/orders', function(req,res,next){
  // Project.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
  //   if (!user) return res.status(401).send('User does not exist');
  //   user.comparePassword(req.body.password, function(err, isMatch) {
  //     if (err) return res.status(401).send('something went WRONG, try again ;)')
  //     if (!isMatch) return res.status(401).send('Invalid email and/or password');
  //     var cpUser = {
  //       _id: user._id,
  //       email: user.email,
  //       password: user.password
  //     };
  //     var token = createJwtToken(cpUser);
  //     res.status(200).send({ token: token });
  //   });
  // });
  var project = new Project({
    projectCat: req.body.projectCat,
    projectName: req.body.projectName,
    projectDesc: req.body.projectDesc,
    // username: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    username: req.body.username,
    fileName: req.body.fileName,
    addedDate: new Date(),
    lastUpdate: new Date()
  });
  project.save(function(err) {
    if (err) return next(err);
    res.send(200);
  });
})

app.post('/telegram/send', ensureAuthenticated , function(req,res, next){




  var defaultText = 
              `
              <a href="http://onita.ir/assets/images/showcase/showcase-1.png">&#8205</a>
              سلام دوستان عزیزم
              <em> تازه داره شروع میشه </em>
              🆔 <a href="http://t.me/onitatestchannel">@onitabot</a> 
              <strong>این کلیپ برای شماست</strong>
              `;


  // bot.sendAudio('34106450', 'https://storage.backtory.com/onitacdn/elon.mp3' , {title: "اجرای زیبای حضرت ایلان ماسک", performer: "آقا ایلان ماسک (ع)", duration: 300 ,caption: `👻👻👻 سلام دوستان عزیزم 👻👻👻\n http://onita.ir \n از طریق سایت سفراش بدید و از ۲۰٪ تخفیف بهره مند بشید 👆 \n اینم آدرس تلگراممون @OnitaBot 🤙`}).then(function(r){res.send(r)});

  // res.send(`http://198.143.181.55:1212/download/${req.params.id}`)

  // console.log('got it');
  // var srcPath = path.join(__dirname, 'script.js');
  // fs.readFile(srcPath, 'utf8', function (err, data) {
  //         if (err) throw err;
  //         res.send(data);
  //         }
  //     );
  bot.sendMessage('34106450', defaultText, {parse_mode: "html"}).then(function(r){res.send(r)});
  // bot.sendPhoto('34106450', "http://onita.ir/assets/images/showcase/showcase-1.png" , {caption: `👻👻👻 سلام دوستان عزیزم 👻👻👻\n http://onita.ir \n از طریق سایت سفراش بدید و از ۲۰٪ تخفیف بهره مند بشید 👆 \n اینم آدرس تلگراممون @OnitaBot 🤙`}).then(function(r){res.send(r)});
  // res.send(req.body)
})

app.post('/sendDocument', function(req,res, next){
  if (req.body.chat_id && req.body.document) {
    bot.sendDocument(req.body.chat_id, `http://198.143.181.55:1212/download/${req.body.document}`)
    // res.send(`http://198.143.181.55:1212/download/${req.body.document}`)
  }
})

app.post('/api/youtubeDownloader', function(req, res, next){
  var id = req.body.id;
  var path = require('path');
  var fs   = require('fs');
  var ytdl = require('youtube-dl');
  if (id) {
    var url = 'https://www.youtube.com/watch?v=' + id;
    var videoInfo;
    var video = ytdl(url,
      // Optional arguments passed to youtube-dl.
      ['-f', req.body.format]);

    var size = 0;
    video.on('info', function(info) {
      'use strict';
      videoInfo = info;
      size = info.size;
      var file = path.join(youtubeFolder, info.id) + '.' + info.ext;
      video.pipe(fs.createWriteStream(file));
    });

    video.on('error', function(err){
      res.status(200).send({err: err});
    });

    video.on('end', function end() {
      'use strict';
      res.status(200).send({file : videoInfo});
      
    });
  }
});

app.post('/api/youtube', function(req, res, next){
  var path = require('path');
  var fs   = require('fs');
  var ytdl = require('youtube-dl');
  var url = req.body.youtubeUrl;
  if (url) {
    ytdl.getInfo(url, function(err, info) {
      'use strict';
      if (err) { res.status(503).send({err: err}); }
      res.status(200).send({'id':info.id, 'title':info.title, 'thumbnail': info.thumbnail, 'desc': info.description});
    });
  }
  
});

app.get('/api/posts', function(req,res,next){
  var query = Post.find({}).exec(function(err, posts) {  
    if (err) return next(err);
    res.send(posts);
  });
});

app.get('/auth/balance', ensureAuthenticated , function(req,res,next){
  Customer.findOne({ email: req.user.email.toLowerCase() }, function(err, user) {
    if (user) {
      res.status(200).send({balance: user.balance ? user.balance : 0});
    }
  });
})

app.post('/auth/signup', function(req, res, next) {

  var customer = new Customer({
    mobile: req.body.mobile,
    email: req.body.email.toLowerCase(),
    password: req.body.password
  });
  customer.save(function(err) {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

app.post('/auth/login', function(req, res, next) {
  Customer.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
    // if (!user) return res.send(401, 'User does not exist');
    if (!user) return res.status(401).send('User does not exist');
    user.comparePassword(req.body.password, function(err, isMatch) {
      if (err) return res.status(401).send('something went WRONG, try again ;)')
      if (!isMatch) return res.status(401).send('Invalid email and/or password');
      var cpUser = {
        _id: user._id,
        email: user.email,
        mobile: user.mobile,
        password: user.password, 
        balance: user.balance ? user.balance : 0
      };
      var token = createJwtToken(cpUser);
      res.status(200).send({ token: token });
    });
  });
});


app.get('/api/users', function(req, res, next) {
  if (!req.query.email) {
    return res.send(400, { message: 'Email parameter is required.' });
  }

  User.findOne({ email: req.query.email }, function(err, user) {
    if (err) return next(err);
    res.send({ available: !user });
  });
});



app.get('/api/jobs' ,ensureAuthenticated,  function(req, res, next) {

  if (req.query.tag) {
    // query.where({ $in : { tags : req.query.tag }});
    var query = Job.find({}).where('tags').in([req.query.tag]);
  } else if (req.query.alphabet) {
    query.where({ name: new RegExp('^' + '[' + req.query.alphabet + ']', 'i') });
  } else {
    var query = Job.find({}, 'title startedDate bids tags deadlineDate');
  }
  query.exec(function(err, jobs) {
    if (err) return next(err);
    res.send(jobs);
  });

});

app.get('/api/jobs/:id', function(req, res, next) {
  // ---- 12/6/94 ----
  // Job.findById(req.params.id, function(err, job) {
  //   if (err) return Next(err);
  //   res.send(job);
  // });
  // Job.findById(req.params.id)
  // .populate('bids')
  // .exec(function(err , job){
  //   if (err) console.log(err);
  //   User.findById(job)
  // });

  jobSchema.plugin(deepPopulate);


  Job.findById(req.params.id).deepPopulate('bids.user expert').exec(function (err, job) {
    if (err) console.log(err);
    res.send(job);
  });
});


app.get('/api/article', function(req,res,next){
  if (req.query.tag) {
    // query.where({ $in : { tags : req.query.tag }});
    var query = Article.find({}).where('keywords').in([req.query.tag]);
  } else if (req.query.alphabet) {
    query.where({ name: new RegExp('^' + '[' + req.query.alphabet + ']', 'i') });
  } else {
    var query = Article.find({}).populate('user', 'firstName lastName articles image').sort({_id: -1});
  }
  query.exec(function(err, arts) {
    if (err) return next(err);
    res.send(arts);
  });
});

app.get('/api/article/:id', function(req,res,next){
  Article.findById(req.params.id).deepPopulate('user').exec(function(err, article){
    if (err) return next(err);
    res.send(article);
  });
});

app.delete('/api/article/:id', ensureAuthenticated, function(req,res, next){
  Article.findById(req.params.id).remove().exec(function(err){
    if (err) return next(err);
    res.sendStatus(200);
  });
});

app.post('/api/article', ensureAuthenticated, function(req, res, next){

  var article = new Article({
    user: req.user._id,
    title: req.body.title,
    keywords: req.body.keywords,
    body: req.body.body,
    desc: req.body.desc,
    image: req.body.image,
    verified: 1,
    postedDate : req.body.postedDate || null,
    updatedDate : req.body.updatedDate || null,
    relateArticles : null
  });
  article.save(function(err) {
    if (err) return next(err);
    User.findById(req.user._id, function (err, doc) {
    if (err) return handleError(err);
      doc.articles.push(article._id);
      doc.save(function(err){
        if (err) console.log(err);
      });
    });
    res.send(200);
  });
});


app.put('/api/article', ensureAuthenticated, function(req,res,next){
  Article.findById(req.body._id).exec(function(err,article){
    article = _.extend(article, req.body);
    article.save(function(err){
      if (err) return next(err);
      res.send(article);
    })
  });
});



app.post('/api/jobs', ensureAuthenticated , function (req, res, next) {

  var job = new Job({
    category: req.body.category.value,
    title: req.body.title,
    tags: req.body.skills,
    longDesc: req.body.desc,
    budgetNumber: req.body.budgetNumber,
    budgetRate: req.body.budgetRate || 0,
    startedDate: new Date(),
    deadlineDate: new Date(req.body.deadline),
    featured: req.body.featured,
    views: 0,
    report: false,
    reportCounter: 0,
    status: 1, 
    poster: 0,
    verified: true, 
    user: req.user._id
  });
  job.save(function(err) {
    if (err) return next(err);
    User.findById(req.user._id, function (err, doc) {
    if (err) {return handleError(err)} else {
      doc.projects.push(job._id);
      doc.save(function(err){
        if (err) console.log(err);
      });
    }
    });
    res.send(200);
  });

});

app.post('/api/subscribe', ensureAuthenticated, function(req, res, next) {
    Show.findById(req.body.showId, function(err, show) {
        if (err) return next(err);
        show.subscribers.push(req.user._id);
        show.save(function(err) {
            if (err) return next(err);
            res.send(200);
        });
    });
});

app.post('/api/answer', ensureAuthenticated, function(req, res, next) {
    Course.findById(req.body.questionId, function(err, question) {
        if (err) return next(err);
        question.question[0].questionBody = req.body.answerbody;
        question.save(function(err) {
            if (err) return next(err);
            res.send(200);
            console.log(question.question[0].questionBody + ' Saved Successfully');
        });
    });
});

app.post('/api/v1/bid', ensureAuthenticated, function(req, res, next) {
  var bid = new Bid({
    user: req.user._id,
    amount: req.body.amount,
    days: req.body.days,
    desc: req.body.desc,
    post_date: new Date()
  });

  bid.save(function(err, cb) {
    if (err) return Next(err);
    Job.update({_id: req.body.projectid}, {
      $push: {
        bids: cb._id
      }
    },{ upsert: false}, function(err){
      if (err) return Next(err);
    });
    User.update({_id: req.user._id}, {
      $push: {
        bids: cb._id
      }
    },{upsert: false}, function(err, cb){
      res.status(200).end();
    });

  });
});

app.get('/api/v1/user', function(req, res, next){
  if (req.query.tag) {
    var query = User.find({}).where('tags').in([req.query.tag]);
  } else {
    var query = User.find({});
  };
  query.limit(20).exec(function(err, users){
    if (err) return next(err);
    res.send(users);
  });
});
app.get('/api/v1/user/:id', ensureAuthenticated, function(req, res, next) {
  if (req.user._id == req.params.id) {
    User.findById(req.params.id, function(err, user){
      if (err) return next(err);
      res.send(user);
  });
  } else {
    res.send(400, { message: "You cannot access to this page !" });
  }
});
app.get('/api/v1/inbox/:id', ensureAuthenticated, function(req, res, next){
  User.findById(req.params.id, function(err, user){
    if (err) return next(err);
    res.send(user);
  })
});

app.get('/api/v1/profile/:id', function(req, res, next){
  var resp = {};
  if (req.params.id === '111') {
    resp.status = 404;
    resp.error = 'nothing found here !';
    res.send(resp);
  }
  User.findById(req.params.id)
    .populate('projects')
    .exec(function(err, user){
      if (err) return next(err);  
    resp.data = user;
    resp.status = 200;
    res.send(resp);
  });
});

app.post('/api/v1/skills', ensureAuthenticated, function(req, res, next){
  User.update({_id: req.body.user._id}, {
      // $push: {
      //   tags: {
      //     $each: req.body.tags
      //   }
      tags: req.body.tags
    },{ upsert: true}, function(err){
      if (err) return next(err);
    });
    res.status(200).end();
});

app.post('/api/v1/summary', ensureAuthenticated, function(req, res, next){
  User.update({_id: req.body.user._id}, {
      summary: req.body.summary
    },{ upsert: true}, function(err){
      if (err) console.log(err);
    });
    res.status(200).end();
});

app.post('/api/v1/resume', ensureAuthenticated , function(req, res, next) {
  User.update({_id: req.body.user._id}, {
    $push: {
      resumes: {
        title: req.body.resume.title,
        category: req.body.resume.category,
        start: req.body.resume.start, 
        finish: req.body.resume.finish,
        desc: req.body.resume.desc
      }
    }
  }, {upsert: true}, function(err){
        if (err) console.log(err);
      });
  res.status(200).end();
});

app.delete('/api/v1/resume/user/:id1/resume/:id2', ensureAuthenticated, function(req, res, next){
  if (req.params.id1 && req.params.id2) {
    User.update({_id: req.params.id1}, {
      $pull: {
        resumes: {
          _id: req.params.id2
        }
      }
    }, {upsert: false}, function(err){
      if (err) console.log(err);
    });
    res.sendStatus(200);
  } else {
    console.log('Resume delete parameter error !');
    res.sendStatus(401);
  }
});

app.post('/api/v1/education', ensureAuthenticated , function(req, res, next) {
  User.update({_id: req.body.user._id}, {
    $push: {
      educations: {
        name: req.body.education.name,
        start: req.body.education.start,
        finish: req.body.education.finish, 
        field: req.body.education.field,
        grade: req.body.education.grade
      }
    }
  }, {upsert: true}, function(err){
        if (err) console.log(err);
      });
  res.status(200).end();
});

app.delete('/api/v1/education/user/:id1/edu/:id2', ensureAuthenticated, function(req, res, next){
  if (req.params.id1 && req.params.id2) {
    User.update({_id: req.params.id1}, {
      $pull: {
        educations: {
          _id: req.params.id2
        }
      }
    }, {upsert: false}, function(err){
      if (err) console.log(err);
    });
    res.sendStatus(200);
  } else {
    console.log('Education delete parameter error !');
    res.sendStatus(401);
  }
});


app.post('/upload' ,ensureAuthenticated, function(req, res, next) {
 var form = new formidable.IncomingForm();
 var imageRoot, imageName;
 form.uploadDir = './public/img-upload';
 form.keepExtensions = true;

 form.parse(req, function(err, fields, files){
        // TESTING
        console.log("file size: "+JSON.stringify(files.file.size));
        console.log("file path: "+JSON.stringify(files.file.path));
        console.log("file name: "+JSON.stringify(files.file.name));
        console.log("file type: "+JSON.stringify(files.file.type));
        console.log("astModifiedDate: "+JSON.stringify(files.file.lastModifiedDate));
        // Formidable changes the name of the uploaded file
        // Rename the file to its original name
    imageRoot = './public';
    imageName = '/img-upload/' + Date.now() + files.file.name;
    fs.rename(files.file.path, imageRoot + imageName, function(err) {
    if (err) return 0;
    User.findById(req.user._id, function(err, doc) {
      if (err) return 0;
      doc.image = imageName;
      doc.save(function(err){
        if (err) console.log(err);
        res.status(200).send(doc); 
      });
    });  
    });
 });
});



app.post('/api/unsubscribe', ensureAuthenticated, function(req, res, next) {
  Show.findById(req.body.showId, function(err, show) {
    if (err) return next(err);
    var index = show.subscribers.indexOf(req.user._id);
    show.subscribers.splice(index, 1);
    show.save(function(err) {
      if (err) return next(err);
      res.status(200).end();
    });
  });
});

app.post('/api/v1/expert', ensureAuthenticated, function(req,res, next){
  Job.update({_id: req.body.projectid}, {
      $push: {
        experts: req.body.userid
      }, 
      $set: {
        status: 2
      }
    },{ upsert: false}, function(err,cb){
      if (err) {
        console.log(err);
        res.status(500).end('Cant update Jobs Expert' + err);
      }
    });
  
  res.status(200).end('Jobs Expert updated Successfully.');
});

app.delete('/api/v1/expert/:id', ensureAuthenticated, function(req,res,next){
  Job.update({_id: req.params.id}, {
      $pop: {
        experts: 1
      }, 
      $set: {
        status: 1
      }
    },{ upsert: true}, function(err,cb){
      if (err) {
        console.log(err);
        res.status(500).end('Cant update Jobs Expert' + err);
      }
    });
  
  res.status(200).end('Jobs Expert re-updated Successfully.');
});

app.post('/api/uploadDocs' , function(req, res, next) {
  var form = new formidable.IncomingForm();
  var docAddress, fileName;
  form.uploadDir = './public/users-docs';
  form.keepExtensions = true;

  form.parse(req, function(err, fields, files){ 
    console.log(files.file)
    fileName =  `${Date.now()}.${files.file.path.substr(files.file.path.lastIndexOf('.') + 1)}`;
    docAddress = path.join(form.uploadDir, fileName);
    fs.rename(files.file.path, docAddress, function(err) {
      if (err) res.status(505).send('cant upload files');
      // files.file.name = fileName;
      // console.log(files.file.name.config);
      res.status(200).send({fileName: fileName});
    });
  });
});

app.get('/download/:id', function(req,res){
  console.log(req.params.id)
  res.download(`/tmp/${req.params.id}`, function(err){
    if (err) {
      console.log(err);
    }
  });
});

app.get('*', function(req, res) {
  res.redirect('/#' + req.originalUrl);
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send({message: err.message});
});

app.listen(app.get('port'), function() {
  console.log('Server is up and running on port ' + app.get('port'));
});

// agenda.define('send email alert', function(job, done) {
//   Show.findOne({ name: job.attrs.data }).populate('subscribers').exec(function(err, show) {
//     var emails = show.subscribers.map(function(user) {
//       if (user.facebook) {
//         return user.facebook.email;
//       } elseif (user.google) {
//         return user.google.email
//       } else {
//         return user.email
//       }
//     });

//     var upcomingEpisode = show.episodes.filter(function(episode) {
//       return new Date(episode.firstAired) > new Date();
//     })[0];

//     var smtpTransport = nodemailer.createTransport('SMTP', {
//       service: 'SendGrid',
//       auth: { user: 'hslogin', pass: 'hspassword00' }
//     });

//     var mailOptions = {
//       from: 'Fred Foo ✔ <foo@blurdybloop.com>',
//       to: emails.join(','),
//       subject: show.name + ' is starting soon!',
//       text: show.name + ' starts in less than 2 hours on ' + show.network + '.\n\n' +
//         'Episode ' + upcomingEpisode.episodeNumber + ' Overview\n\n' + upcomingEpisode.overview
//     };

//     smtpTransport.sendMail(mailOptions, function(error, response) {
//       console.log('Message sent: ' + response.message);
//       smtpTransport.close();
//       done();
//     });
//   });
// });

// //agenda.start();

// agenda.on('start', function(job) {
//   console.log("Job %s starting", job.attrs.name);
// });

// agenda.on('complete', function(job) {
//   console.log("Job %s finished", job.attrs.name);
// });


// agenda.define('igGrabber2', function(job){
//  console.log('new agenda started');
//  instaGrabber().then(function(data){
//    if(data.length > 0) instaPusher(data);
//  });
// });
// agenda.on('ready', function(){
//   // var repeater = agenda.create('igGrabber2');
//   // repeater.repeatEvery('10 minutes').save();
//   // agenda.start();
// });

function instaPusher(data){
    data.forEach(function(elem, index, array){
        var post = new Post({
            owner: elem.owner.id,
            img_code: elem.code,
            date: elem.date,
            likes: elem.likes.count,
            thumbnail_src: elem.thumbnail_src, 
            added_date: Date
          })
          post.save(function(err){
            if (err) {
              if (err.code == 11000) {
                var conditions = { img_code: elem.code }
                  , update = { $set: { likes: elem.likes.count }};
                  // , options = { multi: false };

                Post.update(conditions, update, callback);
                function callback (err, numAffected) {
                  if (err) console.log(err);
                  console.log(numAffected);
                };
                // Post.update({img_code: elem.code}).exec(function(err,doc){
                //   if (err) {console.log(err)} else {
                //   console.log(doc);
                //   }
                // });
                // console.log(elem.code);
              } else {
                console.log(err);
              }
            } else {
              return 
            }
          });
      });
  };


function instaGrabber() {
  var request = require('request'),
  cheerio = require('cheerio'),
  qs = require('querystring'),
  rp = require('request-promise'),
  Q = require('q'),
  defer= Q.defer();

// const URL = 'https://www.instagram.com/yasaminyazdani';
const URL = 'https://www.instagram.com/explore/tags/gigatest';
var profilePage = false, tagPage = false;
var instaImages = [];

upRunner();
// function returner() {
//  return defer.promise;
//  delete defer;
// }

function requester(URL, id, cb) {
  if (id) URL = URL + '/?max_id=' + id;
  return rp(URL);
}
function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

 var str;   
 function upRunner(str){
  profilePage = !(tagPage = URL.includes("/tags/") ? true : false);
  if (!str) {
    request(URL,{jar:true}, function(err, resp, body){
    if (err) {
      defer.reject(err);
      return;
    }
    var $ = cheerio.load(body), scripts= [];
    $('script').each(function(i, elem){ 
      scripts[i] = $(this).text();
    }); 
    var str = scripts[6];
    // newData = tagPage ? JSON.parse(str.substring(str.indexOf("{"), str.lastIndexOf(";"))).entry_data.TagPage[0].tag.media.page_info : profilePage ?  JSON.parse(str.substring(str.indexOf("{"), str.lastIndexOf(";"))).entry_data.ProfilePage[0].user.media.page_info;
    upRunner(str);
  });
  } else { 
    var newData = JSON.parse(str.substring(str.indexOf("{"), str.lastIndexOf(";"))).entry_data.TagPage[0].tag.media.page_info;
    if (newData.has_next_page) {
      requester(URL, newData.end_cursor).then(function(body){
        newData = extractor(body);
        upRunner(newData);
      });
    } else {
    console.log('it\'s finished\n');
    grabber(str);
    }
  }

  function grabber(str) {
    var instaImages = [];
    media = JSON.parse(str.substring(str.indexOf("{"), str.lastIndexOf(";"))).entry_data.TagPage[0].tag.media;
    maxNumber = media.count;
    newData = media.nodes; 
    newData.sort(dynamicSort('-date'));
    newData.forEach(function(elem,index,array){
      // if (instaImages.length >= maxNumber) {
      //   defer.resolve(instaImages);
      // } else {      
      //  console.log(instaImages);
      //   instaImages.push(elem);
      // }
      instaImages.push(elem);
    });
 //    console.log(instaImages);
  defer.resolve(instaImages);
  }
  function extractor(body) {
    var $ = cheerio.load(body), scripts= [];
    $('script').each(function(i, elem){ 
      scripts[i] = $(this).text();
    }); 
    var str = scripts[6],
    newData = JSON.parse(str.substring(str.indexOf("{"), str.lastIndexOf(";"))).entry_data.TagPage[0].tag.media.page_info;
    grabber(str);
  }
 };
  return defer.promise;
}
