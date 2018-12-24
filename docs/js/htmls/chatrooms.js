async function initChatRooms() {
    const chatRooms = await import('../abi/chatrooms.js');
    const list = await chatRooms.chatRoomsList();
    document.getElementById('chatRoomsLoading').style.display = 'none';
    if (!list) {
        document.getElementById('chatRoomsLoaded').style.display = 'none';
        return '';
    }
    let html = '<div class="collection left-align">';
    for (let i =  list.length-1; i >= 0; i--) {
        let css = 'collection-item';
        if (currentRoom.addr == list[i].addr) {
            css += ' active';
        }
        html += `<a id="listChatRoom_${list[i].addr}" class="${css}" href="https://ropsten.etherscan.io/address/${list[i].addr}" onclick="selectChatRoom('${list[i].addr}'); return false;">
                <i class="material-icons tiny chat_bubble_outline orange-text">chat_bubble_outline</i>
                <label class="orange-text">${list[i].name}</label>
            </a>`;
    }
    html += '</div>';
    document.getElementById('chatRoomsLoaded').innerHTML = html;
}

async function createNewChatRoomModal() {
    const chatRoomModal = M.Modal.getInstance(document.getElementById('newChatRoomModal'));
    chatRoomModal.open();
    document.getElementById('newChatRoomName').focus();
}

async function saveNewChatRoomModal() {
    const title = document.getElementById('newChatRoomName').value;
    const chatRooms = await import('../abi/chatrooms.js');
    const tx = await chatRooms.createChatRoom(title);
    document.getElementById('chatRoomsTxWaiting').style.display = 'block';
    document.getElementById('chatRoomsTxWaitingLink').innerHTML = `<a href="https://ropsten.etherscan.io/tx/${tx}" target="_blank">${tx}</a>`;
    const latestFilter = web3.eth.filter('latest');
    latestFilter.watch(function (error, result) {
        if (error) {
            console.error(error);
        } else {
            web3.eth.getBlock(result, true, function (error, data) {
                for (let i = 0, ic = data.transactions.length; i < ic; i++) {
                    if (tx == data.transactions[i].hash) {
                        document.getElementById('chatRoomsTxWaiting').style.display = 'none';
                        initChatRooms();
                        latestFilter.stopWatching();
                        break;
                    }
                }
            });
        }
    });
    const chatRoomModal = M.Modal.getInstance(document.getElementById('newChatRoomModal'));
    chatRoomModal.close();
}

async function selectChatRoom(addr) {
    if (currentRoom.addr == addr) return false;
    if (currentRoom.addr && document.getElementById('listChatRoom_' + currentRoom.addr)) {
        document.getElementById('listChatRoom_' + currentRoom.addr).className = 'collection-item';
    }
    if (document.getElementById('listChatRoom_' + addr)) {
        document.getElementById('listChatRoom_' + addr).className = 'collection-item active';
    }
    currentRoom.addr = addr;
    localStorage.setItem('currentRoom', JSON.stringify(currentRoom));
    initChatRoom();
    initChatRoomMessages();
}
