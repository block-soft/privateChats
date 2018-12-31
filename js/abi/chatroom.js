const chatRoomAbi = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
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
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "messages",
        "outputs": [
            {
                "name": "blocknumber",
                "type": "uint256"
            },
            {
                "name": "member",
                "type": "address"
            },
            {
                "name": "encrypted_texts_ipfs",
                "type": "string"
            },
            {
                "name": "decrypted_text_hash",
                "type": "bytes32"
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
            },
            {
                "name": "_addr",
                "type": "address"
            }
        ],
        "name": "addMember",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "membersTotal",
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
        "name": "members",
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
                "name": "_encrypted_texts_ipfs",
                "type": "string"
            },
            {
                "name": "_decrypted_text_hash",
                "type": "bytes32"
            }
        ],
        "name": "createMessage",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "owner",
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
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "name": "settings",
        "outputs": [
            {
                "name": "blocknumber",
                "type": "uint256"
            },
            {
                "name": "name",
                "type": "bytes32"
            },
            {
                "name": "suggested",
                "type": "bytes32"
            },
            {
                "name": "isValid",
                "type": "bool"
            },
            {
                "name": "isApproved",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "messagesTotal",
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
        "inputs": [
            {
                "name": "_name",
                "type": "bytes32"
            },
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    }
];

const obj = {
    chatRoom : false
};

export const init = async function (address) {
    obj.chatRoom = web3.eth.contract(chatRoomAbi).at(address);
};

export const membersTotal = async function () {
    return new Promise((resolve, reject) => {
        obj.chatRoom.membersTotal.call((err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.toString());
            }
        });
    });
};

export const memberByIndex = async function (index) {
    return new Promise((resolve, reject) => {
        obj.chatRoom.members(index, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.toString());
            }
        });
    });
};

export const memberSettings  = async function (addr) {
    return new Promise((resolve, reject) => {
        obj.chatRoom.settings(addr, (err, data) => {
            if (err) {
                reject(err);
            } else {
                let tmp = data.toString().split(',');
                resolve({block : tmp[0], name : web3.toAscii(tmp[1]).trim(), suggested: web3.toAscii(tmp[2]).trim(), isValid : tmp[3], isApproved : tmp[4]});
            }
        });
    });
};

export const membersList = async function () {
    const list = [];
    const total = await membersTotal();
    if (total < 1) return false;
    for(let i = 0; i < total; i++) {
        let current = await memberByIndex(i);
        let data = await memberSettings(current);
        list.push({addr : current, name : data.name});
    }
    return list;
};

export const messagesTotal = async function () {
    return new Promise((resolve, reject) => {
        obj.chatRoom.messagesTotal.call((err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.toString());
            }
        });
    });
};

export const messageByIndex = async function (index) {
    return new Promise((resolve, reject) => {
        obj.chatRoom.messages(index, (err, data) => {
            if (err) {
                reject(err);
            } else {
                let tmp = data.toString().split(',');
                resolve({block: tmp[0], member: tmp[1], ipfs: tmp[2], check: tmp[3]});
            }
        });
    });
};

export const messagesList = async function () {
    const list = [];
    const total = await messagesTotal();
    if (total < 1) return false;
    for(let i = 0; i < total; i++) {
        let current = await messageByIndex(i);

        list.push(current);
    }
    return list;
};

export const addMember = async function (name, addr) {
    return new Promise((resolve, reject) => {
        obj.chatRoom.addMember(name, addr, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};


export const createMessage = async function (ipfsHash, decryptedTextHash) {
    return new Promise((resolve, reject) => {
        obj.chatRoom.createMessage(ipfsHash, decryptedTextHash, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};
