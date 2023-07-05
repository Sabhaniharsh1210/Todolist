var express = require('express');
var bodyparser = require('body-parser');
const storage = require('node-persist');

// my mysql connection
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'todolist'
});

// connection with database
 
connection.connect();
var app = express();
app.set('view engine','ejs')
app.use(bodyparser.urlencoded({extended:false}))

// open index page

// app.get('/', function(req,res){
//     res.render('index')
// })

app.get('/', async function(req,res){
    await storage.init();
    var user_login = await storage.getItem('user_login')

    if(user_login != 0)
    {
        res.redirect('/dashboard')
    }
    else
    {
        res.render('index')
    }
    
})

//  check valid user name & password

app.post('/',async function (req,res){
    var name= req.body.username;
    var pass = req.body.password;
    var query = "select * from user where name = '"+name+"' and password = '"+pass+"' ";

    connection.query(query,async function (error, results, fields) {
        if (error) throw error;
        if(results.length == 1)
        {
            await storage.init();
            await storage.setItem('user_login',results[0].id)
            res.redirect('dashboard')
        }
        else
        {
            res.redirect('/')
        }
      });
})

// open user dashboard

app.get('/dashboard',async function (req,res){
    await storage.init();
    var user_login = await storage.getItem('user_login')

    if(user_login != 0)
    {
        var user = "select * from task where status = 0 and user_id = "+user_login
        

        connection.query(user, function (error, results, fields) {
            if (error) throw error;
            res.render('dashboard',{results})
          });
        
    }
    else
    {
        res.render('index')
    }
    
})

// logout

    app.get('/logout',async function(req,res){
        await storage.init();
        await storage.setItem('user_login',0)
        res.redirect('/')
    })

    // complete task

    app.get('/done/:id', function(req,res){
        var  id = req.params.id;
        var query = "update task set status = 1 where id = "+id
        connection.query(query, function (error, results, fields) {
            if (error) throw error;
            res.redirect('/dashboard')
          });
    })

    // declain task

    app.get('/delete/:id', function(req,res){
        var  id = req.params.id;
        var query = "update task set status = 2 where id = "+id
        connection.query(query, function (error, results, fields) {
            if (error) throw error;
            res.redirect('/dashboard')
          });
    })

    
    app.get('/complete_task',async function(req,res){
        await storage.init();
        var user_login = await storage.getItem('user_login')
        var query = "select * from task where status = 1 and user_id = "+user_login;
        connection.query(query, function (error, results, fields) {
            if (error) throw error;
            res.render('complete',{results})
          });
    })
    
    app.get('/decline_task',async function(req,res){
        await storage.init();
        var user_login = await storage.getItem('user_login')
        var query = "select * from task where status = 2 and user_id = "+user_login;
        connection.query(query, function (error, results, fields) {
            if (error) throw error;
            res.render('decline',{results})
          });
    })


app.listen(4000);