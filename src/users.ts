const users: { id: string; username: string; room: string; }[] = [];

function join(id: string, username: string, room: string) {

    const user = { id, username, room };

    users.push(user);

    return user;
}

function current(id: string) {
    return users.find(user => user.id === id);
}


function userLeave(id: any) {
    const index = users.findIndex(user => user.id === id);

    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
}

function getRoomUsers(room: string) {
    return users.filter(user => user.room === room);
}

export {
    join,
    current,
    userLeave,
    getRoomUsers
}