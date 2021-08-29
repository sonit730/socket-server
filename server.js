const app = require("express")();
const httpServer = require("http").createServer(app);

const io = require("socket.io")(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;
const users = {}; //Một user : socketId

app.get('/', (req, res) => {
    res.status(200).json({ name: 'Server' })
})

io.on("connection", socket => {
    console.log('✅ Đang kết nối với ID: ' + socket.id);

    /* 🔔 Lắng nghe các sự kiện từ CLIENT gửi tới  ⏬*/

    //✅'new_user' rồi push users={}
    socket.on('new_user', //new_user: eventName identified by the string name frome client
        (username) => {  //args[1]: using callback nhận username từ client
            console.log('Server : ' + username)

            //Tạo id cho user name
            users[username] = socket.id

            //We can tell every other users someone connected
            //🚀 event có name '👩‍👩‍👦‍👦 all_users' lại client
            io.emit("all_users", users)
        })

    //✅ 'Nhận data từ client
    socket.on('send_message', (data) => {
        // console.log(data);

        //1. Thông qua data lấy ra user -> id
        const socketId = users[data.receiver]
        // console.log('users: ', users)
        // console.log('socketId: ', socketId)

        //2. gửi 🚀 tin nhắn riêng(private message) đến rừng user thông qua socketID
        io.to(socketId).emit("new_message", data)

    })

    socket.on('disconnect', () => {
        console.log(`❌Id ${socket.id} đã ngắt kết nối `)

        //Xóa user khỏi list
        for (let user in users) {
            if (users[user] === socket.id) {
                delete users[user]
            }
        }

        //Gửi lại users xau khi xóa
        io.emit("all_users", users)
    })
});

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});