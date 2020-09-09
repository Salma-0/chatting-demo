const express = require('express');
const app = express();
const db = require('./config/db');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const connectedUsers = new Map();



function removeId(id){
    for(const [key, value] of connectedUsers){
        if(value === id)
           connectedUsers.delete(key);
    }
}


//current room should be global for all sockets
//when created upon connection it works only to socket that emitted the event while the current room is undefined for others
let currentRoom = ''
let rooms = [];

io.on('connection', socket => {
    socket.on('setEmail', data => {
        connectedUsers.set(data.email, socket.id);
        rooms.forEach(r => socket.join(r));
    })
    
    
    socket.on('disconnect', ()=> {
        removeId(socket.id);
    });

    socket.on('start-chat', email => {
        const roomName = new Date().getTime().toString()
        let id1 = connectedUsers.get(email)
     
   
      socket.join(roomName)
      io.to(id1).emit('invite', roomName);
      currentRoom = roomName;
      rooms.push(currentRoom);
    })

    
    socket.on('accept', function(roomName){
        socket.join(roomName);
        currentRoom = roomName;
        rooms.push(roomName);
    });


    socket.on('message', data => {
        io.to(currentRoom).emit('message', data)
    });
})



db();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (req, res)=> res.send('WELCOME'));

app.use('/users', require('./routes/users'));
app.use('/requests', require('./routes/requests'));
app.use('/chats', require('./routes/chats'));


// const PORT = 5000;

// app.listen(PORT, ()=> {
//     console.log(`app is running on port ${PORT}`);
// })


http.listen(8080, ()=> console.log(`HTTP server is listening on port 8080`));

