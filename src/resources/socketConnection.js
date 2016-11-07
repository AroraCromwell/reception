module.exports= function (io, statusRoutes) {
    //let io = require('socket.io')(server);
    /* Start up the server */
    var status = 1;

    io.on("connection", function(socket){
        console.log(" new device connected");
        var alive;
        var down;
        socket.emit("connectMessage", { msg : "Connected" });
        socket.on('event', function(data){});

        socket.once('up', function(data){
            console.log("Serivce connected");
            socket.room = 'appStatus';
            socket.join('appStatus');
            socket.username = 'brc';
            status = 1;

            //clearInterval(down);

        });

        socket.once('disconnect', function(){
            console.log("Service goes down");
            socket.leave('appStatus');
            status = 0;
            //  clearInterval(alive);
        });
    });

    if(status != 'undefined') {
        console.log("inside status interval");
        setInterval(function () {
            console.log("Status Is" + status);
            statusRoutes.deviceStatus(status);
        }, 300000);
    }

};
