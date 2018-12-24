const chatRoomsAbi = [
    {
        "constant": true,
        "inputs": [],
        "name": "chatRoomsTotal",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "chatRooms",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_name",
                "type": "bytes32"
            }
        ],
        "name": "createChatRoom",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "name": "chatRoomsNames",
        "outputs": [
            {
                "name": "",
                "type": "bytes32"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    }
];


const chatRoomsAddress = '0x38ead9d6b5ce82839cba03503b42b2f5e062f1ac';

const chatRooms = web3.eth.contract(chatRoomsAbi).at(chatRoomsAddress);

export const createChatRoom = async function (title) {
    return new Promise((resolve, reject) => {
        chatRooms.createChatRoom(title, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

export const chatRoomsTotal = async function () {
    return new Promise((resolve, reject) => {
        chatRooms.chatRoomsTotal.call((err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.toString());
            }
        });
    });
};

export const chatRoomByIndex = async function (index) {
    return new Promise((resolve, reject) => {
        chatRooms.chatRooms(index, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.toString());
            }
        });
    });
};

export const chatRoomName = async function (addr) {
    return new Promise((resolve, reject) => {
        chatRooms.chatRoomsNames(addr, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(web3.toAscii(data));
            }
        });
    });
};

export const chatRoomsList = async function () {
    let list = [];
    const total = await chatRoomsTotal();
    if (total < 1) return false;

    let saved = JSON.parse(localStorage.getItem('currentRooms_' + chatRoomsAddress));
    let start = 0;
    if (saved && saved.list) {
        start = saved.index + 1;
        list = saved.list;
    }
    for (let i = start; i < total; i++) {
        let current = await chatRoomByIndex(i);
        let name = await chatRoomName(current);
        let object ={'addr' : current, 'name' : name};
        list.push(object);
        localStorage.setItem('currentRooms_' + chatRoomsAddress, JSON.stringify({'list' : list, 'index' : i}));
    }
    return list;
};
