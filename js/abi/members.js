const membersAbi = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "pub",
                "type": "string"
            }
        ],
        "name": "setKey",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "addr",
                "type": "address"
            }
        ],
        "name": "getKey",
        "outputs": [
            {
                "name": "",
                "type": "string"
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
        "name": "keys",
        "outputs": [
            {
                "name": "blocknumber",
                "type": "uint256"
            },
            {
                "name": "publicKey",
                "type": "string"
            },
            {
                "name": "isValid",
                "type": "bool"
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
    }
];

const membersAddress = '0x26f7faf720ef7d9fd2e6fee1ef1df3a7a44ef9f3';

const members = web3.eth.contract(membersAbi).at(membersAddress);

export const getKey = async function (account) {
    return new Promise((resolve, reject) => {
        members.getKey(account, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

export const setKey = async function (publicKey) {
    return new Promise((resolve, reject) => {
        members.setKey(publicKey, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

export const membersTotal = async function () {
    return new Promise((resolve, reject) => {
        members.membersTotal.call((err, data) => {
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
        members.members(index, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.toString());
            }
        });
    });
};

export const membersList = async function () {
    let list = [];
    const total = await membersTotal();
    if (total < 1) return false;

    let saved = JSON.parse(localStorage.getItem('currentMembers'));
    let start = 0;
    if (saved && saved.list) {
        start = saved.index + 1;
        list = saved.list;
    }
    for (let i = start; i < total; i++) {
        let current = await memberByIndex(i);
        let object ={'addr' : current};
        list.push(object);
        localStorage.setItem('currentMembers', JSON.stringify({'list' : list, 'index' : i}));
    }
    return list;
};
