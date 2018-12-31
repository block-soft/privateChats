async function initChatRoom(_callback) {
    if (!currentRoom.addr) {
        document.getElementById('chatRoomMembersLoading').style.display = 'none';
        document.getElementById('chatRoomMembersLoaded').innerHTML = '';
        return false;
    }
    document.getElementById('chatRoomMembersLoading').style.display = 'block';
    document.getElementById('chatRoomMembersLoaded').innerHTML = 'Loading';

    const chatRoom = await import('../abi/chatroom.js');
    chatRoom.init(currentRoom.addr);
    const list = await chatRoom.membersList();
    document.getElementById('chatRoomMembersLoading').style.display = 'none';
    if (!list) {
        document.getElementById('chatRoomMembersLoaded').style.display = 'none';
        return '';
    }
    let html = '<div class="collection left-align">';
    currentRoom.loadedMembers = {};
    for (let i = 0, ic = list.length; i < ic; i++) {
        let css = 'collection-item';
        let added = '';
        if (list[i].addr == currentUser.account) {
            added = '<span class="orange white-text badge">thats you</span>';
        }
        html += `<a class="${css}" href="https://ropsten.etherscan.io/address/${list[i].addr}" target="_blank">
                <i class="material-icons tiny account_circle orange-text">account_circle</i>
                <label class="orange-text">${list[i].name} ${added}</label>
            </a>`;
        currentRoom.loadedMembers[list[i].addr] = list[i].name.length > 0 ? list[i].name : (list[i].addr.substr(0, 12) + '...');
    }
    html += '</div>';
    document.getElementById('chatRoomMembersLoaded').innerHTML = html;
    if (_callback) {
        _callback();
    }
}


async function createNewChatRoomMemberModal() {
    const members = await import('../abi/members.js');
    const list = await members.membersList();

    let html = '<div class="collection left-align">';
    for (let i =  list.length-1; i >= 0; i--) {
        let css = 'collection-item';
        if (currentRoom.loadedMembers[list[i].addr]) {
            css += ' active';
        }
        html += `<a class="${css}" href="https://ropsten.etherscan.io/address/${list[i].addr}" onclick="selectMember('${list[i].addr}'); return false;">
                <i class="material-icons tiny chat_bubble_outline orange-text">account_circle</i>
                <label class="orange-text">${list[i].addr}</label>
            </a>`;
    }
    html += '</div>';
    document.getElementById('listNewChatRoomMemberModal').innerHTML = html;
    const chatRoomModal = M.Modal.getInstance(document.getElementById('newChatRoomMemberModal'));
    chatRoomModal.open();
    setTimeout(() => {
        document.getElementById('newChatRoomMemberName').focus();
    }, 100);
}

function selectMember(addr) {
    document.getElementById('newChatRoomMemberAddr').value = addr;
    document.getElementById('newChatRoomMemberAddr').focus();
}
async function saveNewChatRoomMemberModal() {
    const name = document.getElementById('newChatRoomMemberName').value;
    const addr = document.getElementById('newChatRoomMemberAddr').value;
    const chatRoom = await import('../abi/chatroom.js');
    const tx = await chatRoom.addMember(name, addr);
    document.getElementById('chatRoomMembersTxWaiting').style.display = 'block';
    document.getElementById('chatRoomMembersTxWaitingLink').innerHTML = `<a href="https://ropsten.etherscan.io/tx/${tx}" target="_blank">${tx}</a>`;
    const latestFilter = web3.eth.filter('latest');
    latestFilter.watch(function (error, result) {
        if (error) {
            console.error(error);
        } else {
            web3.eth.getBlock(result, true, function (error, data) {
                for (let i = 0, ic = data.transactions.length; i < ic; i++) {
                    if (tx == data.transactions[i].hash) {
                        document.getElementById('chatRoomMembersTxWaiting').style.display = 'none';
                        initChatRoom();
                        latestFilter.stopWatching();
                        break;
                    }
                }
            });
        }
    });
    const chatRoomModal = M.Modal.getInstance(document.getElementById('newChatRoomMemberModal'));
    chatRoomModal.close();
}
