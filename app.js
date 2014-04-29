
/**
 * Module dependencies.
 */

var express = require('express');

var expressValidator = require('express-validator');

var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
//
//var partials = require('express-partials');
//var flash = require('connect-flash');
/*** monogo start ***/
var mongoose = require('mongoose');

//mongoose.connect('mongodb://user:pass@localhost:port/database');
mongoose.connect('mongodb://localhost/testdb',function(err){
    if(!err){
        console.log('connect to MongoDB');
    }else{
        throw err;
    }
})
function validatePresenceOf(value) {
  return value;
}
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var TaskSchema = new Schema(
	{
	    name:{type:String,validate: [validatePresenceOf, 'a task is required']},
	    content:{type:String,required:true}
	},
	{ 
		versionKey: false 
	}
);
var TaskModel = mongoose.model('task',TaskSchema);

/*** end ***/
var app = express();

// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());


//app.use(express.bodyParser());
app.use(expressValidator());

/*** app configure添加 start ***/
app.use(express.cookieParser('fanfan'));
app.use(express.session({secret:'fanfan'}));
//app.use(function(req, res, next){
//	  res.locals.message = req.session.message;
//	  delete req.session.message;
//	  if(res.locals.message=='undefined' || res.locals.message=='' || res.locals.message==null || typeof(res.locals.message)=='undefined'){
//		  res.locals.message='';
//	  }else{
//		  res.locals.message = '<div class="alert">'+ res.locals.message+ '</div>';
//	  }
//	  var err = req.session.error;
//	  delete req.session.error;
//	  if (err) res.locals.message = '<div class="alert alert-error">' + err + '</div>';
//	  next();
//	});

app.use(function(req, res, next){
	  res.locals.message = req.session.message;
	  delete req.session.message;
	  next();
	});

/*** end ***/


app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

/*** start 路由声明***/
app.get('/about',function(req,res){
    res.send('hello from the about rounte!');
})
app.post('/',function(req,res){
    res.send(req.body)
})
app.get('/user/:id',function(req,res){
    res.send('show content for user id '+req.params.id);
})


//task路由
app.get('/tasks',function(req,res){
    TaskModel.find({},function(err,docs){
    	console.log(req.session.message);
        res.render('tasks/index',{
            'title':'todos index view',
            'docs':docs
            });
    })
})
app.get('/tasks/new',function(req,res){
    res.render('tasks/new',{'title':'new task'})
})
app.post('/tasks',function(req,res){
//	req.assert('postparam', 'Invalid postparam').notEmpty().isInt();
	req.assert('task.name','invalid task.name').notEmpty().isInt();
	var errors=req.validationErrors();
	var err={
		mes:''
	};
	if(errors){
		err.mes=errors;
//		res.send(errors);
//		console.log(errors[0]['msg']);
		console.log(err.mes[0]['msg']);
		res.redirect('/tasks/new');
		req.session.err = err;
	}
	
    var task=new TaskModel(req.body.task);
    task.save(function(err){
    	var message={
    		info:'',
    		warning:''
    	};
        if(!err){
        	message.info = 'task created';
            res.redirect('/tasks');
        }else{
        	message.warning= err ;
            res.redirect('/tasks/new');
        }
    	req.session.message = message ;
    })
})
app.get('/tasks/:id/edit',function(req,res){
	TaskModel.findById(req.params.id,function(err,docs){
		res.render('tasks/edit',{
			title:'edit task view',
			docs:docs
		})
	})
})
app.put('/tasks/:id',function(req,res){
	TaskModel.findById(req.params.id,function(err,docs){
		docs.name=req.body.task.name;
		docs.content=req.body.task.content;
		docs.save(function(err){
			var message={
				info:'',
				warning:''
			};
			if(!err){
				message.info = 'edit success';
				res.redirect('/tasks');
			}else{
				message.warning =err;
			}
			req.session.message=message;
		})
	})
})
app.del('/tasks/:id',function(req,res){
	TaskModel.findById(req.params.id,function(err,docs){
		if(!docs){
			return next(new NotFound('doucment not found'));
		}
		docs.remove(function(err){
	    	var message={
	        		info:'',
	        		warning:''
	        	};
			if(!err){
				message.info = 'delete success';
				res.redirect('/tasks');
			}else{
				message.warning= err ;
				res.redirect('/tasks');
			}
	        req.session.message = message ;
			
		})
	})
})

/*** end ***/

/*** start 数据写入文件***/

//var fs=require('fs');
//var data='some data write to a file';
//fs.writeFile('../testappfile/file.txt',data,function(err){
//    if(!err){
//        console.log('write to file success');
//    }else{
//        throw err;
//    }
//})
//
//fs.readFile('../testappfile/file.txt','utf8',function(err,data){
//    if(!err){
//        console.log(data);
//    }else{
//        throw err;
//    }
//})

/*** end ***/

/*** start 环境变量 ***/
console.log(process.env.username);
/*** end ***/

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
