const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// Create Redis client
let client = redis.createClient();
client.on('connect', function(){
    console.log('Connected to Redis...')
});

// Set port
const port = 4000;

// Init app
const app = express();

// MIDDLEWARE
// View engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Method Override
app.use(methodOverride('_method'));

// STATIC FILES
app.use(express.static('public'))

// ROUTE
// Search page
app.get('/', function(request, response, next){
    response.render('searchusers');
});
// Search processing
app.post('/user/search', function(request, response, next){
    let id = request.body.id;

    client.hgetall(id, function(error, obj){
        if(!obj){
            response.render('searchusers', {
                error: 'User does not exist'
            });
        } else {
            obj.id = id;
            response.render('details',{user: obj});
        };
    });
});
// Add user page
app.get('/user/add', function(reqeust, response, next){
    response.render('adduser')
});
// Add user processing
app.post('/user/add', function(request, response, next){
    let id = request.body.id;
    let first_name = request.body.first_name;
    let last_name = request.body.last_name;
    let email = request.body.email;
    let phone = request.body.phone;

    client.hmset(id,[
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone
    ], function(error, reply){
        if(error){
            console.log(error)
        } ;
        console.log(reply);
        response.redirect('/');
    })
});
// Delete user
app.delete('/user/delete/:id', function(request, response, next){
    client.del(request.params.id);
    response.redirect('/');
});

// SERVER
app.listen(port, function(){
    console.log('Listening on port ' + port)
});