$(document).ready(function(){
    $.ajaxSetup({
        headers: { 'x-auth-token': localStorage.getItem('token') }
    });


    $('.close-btn').click(function(e){
        $('.msg > span').remove()
        $('.msg').hide();
    })

    const socket = io('http://localhost:8080')
    var user;
    
    function redirectToLogin(){
        $(location).attr('href', 'http://localhost:8080/users/login')
    }

    $.ajax({
           method: 'GET',
           url: 'http://localhost:8080/users',
       })
       .done(function(res){
           user = res;
           socket.emit('setEmail', {id: socket.id, email: user.email});

           //show friends
           res.friends.forEach(f =>{
                $('#friends').append(`<li class='list-group-item'><a id='${f._id}' href="#" >${f.nickname}</a></li>`)
                $('#'+f._id).click(e =>{ 
                    e.preventDefault()
                    $(location).attr('href', '/chats')
                    socket.emit('start-chat', f.email)
                })
            })
           
       }).fail(function(err){
           redirectToLogin()
       });

    $('.logout').click(function(ev){
        ev.preventDefault();
        localStorage.removeItem('token');
        user = {};
        socket.emit('disconnect')
        redirectToLogin();
    })


    $('#sendBtn').click(function(ev){
        let m = $("#messageInput").val();
        if(m === "") return;
        socket.emit('message', {msg: m, sender: user.email, nickname: user.nickname, date: new Date()});
        $('#messageInput').val("")
    });
 

    socket.on('setEmail', function(data){
        $('#online').append(`<span>${data.email}</span>`)
    })

    socket.on('invite', function(room){
        localStorage.setItem('room', room);
        let newLink = $('<a href="#">accept</a>')
        newLink.click(ev => {
            $(location).attr('href', 'http://localhost:8080/chats')
            socket.emit('accept', localStorage.getItem('room'));
        })
        let alert = $('<div/>')
        alert.addClass('alert')
        alert.addClass('alert-info')
        alert.html('New chat invitation')
        alert.append(newLink);
        $('.container').append(alert);
    })

    socket.on('message', function(data){
        let now = new Date()
        let dateStr = now.getHours()+':'+now.getMinutes()
        let m = $(`
        <div class='d-flex flex-column'><strong class='mr-2'>${data.nickname}:</strong>${data.msg}
        <small>${dateStr}</small>
        </div>`)
        m.addClass('message')
        if(data.sender === user.email){
            m.addClass('message-sender');
        }else{
            m.addClass('message-reciever')
        }
        $('#messages').append(m);

    })

    

    

})