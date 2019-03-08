var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

//dirname+frontend test
app.use(express.static(__dirname+'frontend/build'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))



//MLAB CONNECTION
var dbUrl = 'mongodb://user1:password1@ds151614.mlab.com:51614/chatdb'

mongoose.connect(dbUrl ,(err) => {
  console.log('mongodb connected',err);
})

//MONGOOSE MODEL
var Message = mongoose.model('Message',{
  name : String,
  message : String
})


//GET MESSAGES COLLECTION
app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})

//GET MESSAGES USERS
app.get('/messages/:user', (req, res) => {
  var user = req.params.user
  Message.find({name: user},(err, messages)=> {
    res.send(messages);
  })
})

//POST MESSAGES TO DB
app.post('/messages', async (req, res) => {
  try{
    var message = new Message(req.body);

    var savedMessage = await message.save()
      console.log('saved');

      io.emit('message', req.body);
      res.sendStatus(200);
  }
  catch (error){
    res.sendStatus(500);
    return console.log('error',error);
  }
  finally{
    console.log('Message Posted')
  }

})


//SOCKET CONNECTION
io.on('connection', (socket) =>{
  console.log('a user is connected')
  socket.on('disconnect', () => {
    console.log('a user has disconnected')
  })
})


//test
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/frontend/build/index.html')
})

//SERVER CONNECTION
var server = http.listen(3000, () => {
  console.log('server is running on port', server.address().port);
});
