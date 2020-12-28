const users = [];

// addUser, removeUser. getUser, getUsersInRoom
const addUser = (({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: "Username and room are required!"
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: "Username in use!"
        }
    }

    // Store user
    const user = { id, username, room };
    users.push(user);
    return { user };
})

const removeUser = (id) => {
    // returns -1 if record not found
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const user = users.find((user) => user.id === id);
    return user;
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    const usersInRoom = users.filter((user) => user.room === room );
    if (!usersInRoom) {
        return [];
    }
    return usersInRoom;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

// addUser({
//     "id": 123,
//     "username": "Ruth",
//     "room": "test1"
// });

// const res = addUser({
//     id: "456",
//     username: "ruth",
//     room: "test1"
// })
// const removedUser = removeUser("123");

// const userList = getUsersInRoom("test2");
// console.log(userList)

// const user = getUser(789)
// console.log(user);
