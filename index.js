
const io = require('socket.io')(8800, {
    cors: {
        origin: "http://localhost:3000"
    }
})

let activeUsers = []

io.on("connection", (socket) => {
    //add new user
    socket.on('new-user-add', (newUserId) => {
        if(newUserId){
            if (!activeUsers.some((user) => user.userId === newUserId)) {
                activeUsers.push({
                    userId: newUserId,
                    socketId: socket.id
                })
                console.log("New User Connected", activeUsers);
            }
            io.emit('get-users', activeUsers)
        }
    })

    socket.on("disconnect", () => {
        activeUsers = activeUsers.filter((user) => user.socketId !== socket.id)

        io.emit('get-users', activeUsers)
    })

    socket.on("join_room", (data) => {
        socket.join(data)
        console.log(`Joined room: ${data}`)
    })

    socket.on("send_message", (data) => {
        socket.to(data.chatId).emit("receive_message", data);
        console.log(data)
    })

    socket.on("send-message", (data) => {
        const { receiverId } = data;
        const user = activeUsers.find((user) => user.userId === receiverId);
        console.log("Sending from socket to :", receiverId)
        console.log("user: ", user, "user receiver: ",user.socketId)
        console.log("data:", data)
        if (user) {
            io.to(user.socketId).emit("receive-message", data);
            console.log("receive: ", data)
        }
    });

})



