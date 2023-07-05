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
app.get('/',async function(req,res){
    await storage.init();
    var user_login = await storage.getItem('admin_login')

    if(user_login == 1)
    {
        res.redirect('/dashboard')
    }
    else
    {
        res.render('index')
    }

})

// login in dashboard

app.get('/dashboard',async function(req,res){
    await storage.init();
    var user_login = await storage.getItem('admin_login')

    var query = "select task.id, task.task, user.name, task.status from task inner join user on task.user_id = user.id order by id asc";
    // var query = "select * from task inner join user on task.user_id = user.id order by id asc"
    connection.query(query, function(error,results,fields){

        if(user_login == 1)
        {
    
            res.render('dashboard',{results});
        }
        else
        {
            res.redirect('/')
        }
    })


})

// admin login

app.post('/',async function(req,res){
    var name = req.body.username;
    var pass = req.body.password;

    var query = "select * from admin where username = '"+name+"' and password = '"+pass+"' ";

    connection.query(query,async function (error, results, fields) {
        if (error) throw error;
        
        if(results.length == 1)
        {
            await storage.init();
            await storage.setItem('admin_login',1)
            res.redirect('/dashboard')
        }
        else{
            res.redirect('/')
        }
      });
})




app.get('/logout',async function(req,res){
    await storage.init();
    await storage.setItem('admin_login',0)
    res.redirect('/')
})


app.get('/add_user', function(req,res){
    res.render('add_user')
})

app.post('/add_user',function(req,res){
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var contact = req.body.contact;

    var query =  " insert into user (name,email,password,contact) values ('"+name+"','"+email+"','"+password+"','"+contact+"') "
    
    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        res.redirect('/add_user')
      });

})

app.get('/add_task',function(req,res){

    var select_user = "select * from user"
    connection.query(select_user, function (error, results, fields) {
        if (error) throw error;
        res.render('add_task',{results})
      });


})

app.post('/add_task',function(req,res){
    var user_id = req.body.user_id;
    var task = req.body.task;

    var query =  " insert into task (task,user_id) values ('"+task+"','"+user_id+"') "
    
    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        res.redirect('/add_task')
      });

})

app.get('/pandding_task',function(req,res){
    var query = "select task.id, task.task, user.name, task.status from task inner join user on task.user_id = user.id where status = 0 order by id asc";
    // var query = "select * from task inner join user on task.user_id = user.id where status = 0 order by id asc"
    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        res.render('pandding',{results})
      });
})

app.get('/complete_task',function(req,res){
    var query = "select task.id, task.task, user.name, task.status from task inner join user on task.user_id = user.id where status = 1 order by id asc";
    // var query = "select * from task inner join user on task.user_id = user.id where status = 1 order by id asc"
    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        res.render('complete',{results})
      });
})

app.get('/decline_task',function(req,res){
    var query = "select task.id, task.task, user.name, task.status from task inner join user on task.user_id = user.id where status = 2 order by id asc";
    // var query = "select * from task inner join user on task.user_id = user.id where status = 2 order by id asc"
    connection.query(query, function (error, results, fields) {
        if (error) throw error;
        res.render('decline',{results})
      });
})


app.listen(3000);