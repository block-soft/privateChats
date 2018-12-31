async function initChatRoomMessages() {
    if (!currentRoom.addr) {
        document.getElementById('chatRoomMessagesLoading').style.display = 'none';
        document.getElementById('chatRoomMessagesLoaded').innerHTML = '';
        return false;
    }
    document.getElementById('chatRoomMessagesLoading').style.display = 'block';
    document.getElementById('chatRoomMessagesLoaded').innerHTML = 'Loading';

    const chatRoom = await import('../abi/chatroom.js');
    chatRoom.init(currentRoom.addr);
    const list = await chatRoom.messagesList();
    document.getElementById('chatRoomMessagesLoading').style.display = 'none';
    if (!list) {
        document.getElementById('chatRoomMessagesLoaded').style.display = 'none';
        return '';
    }
    let html = '<ul class="collection left-align">';
    for (let i = list.length - 1; i >= 0; i--) {
        let css = 'collection-item';
        let added = '';
        if (list[i].member == currentUser.account) {
            added = '<span class="orange white-text badge">thats you</span>';
        }
        html += `<li class="${css}">
                <p>
                <a href="https://ropsten.etherscan.io/address/${list[i].member}" target="_blank">
                    <i class="material-icons tiny account_circle orange-text">account_circle</i>
                    <label class="orange-text">${currentRoom.loadedMembers[list[i].member]} ${added}</label>
                </a>
                <a href="https://ropsten.etherscan.io/block/${list[i].block}" target="_blank">
                    <i class="material-icons tiny access_time orange-text">access_time</i>
                    <label class="orange-text">${list[i].block}</label>
                </a>
                <a href="https://ropsten.etherscan.io/address/${currentRoom.addr}" target="_blank" class="right">
                    <i id="ipfs_check_${list[i].ipfs}_tick" class="material-icons tiny lock red-text">lock</i>
                    <label id="ipfs_check_${list[i].ipfs}" class="red-text">${list[i].check.substr(0,10)}...</label>
                </a>  
                 
                </p>
                
                <div id="ipfs_${list[i].ipfs}">
                File <a href="https://ipfs.io/ipfs/${list[i].ipfs}" target="_blank">${list[i].ipfs}</a> is loading
                </div> 
                <div id="ipfs_link_${list[i].ipfs}" style="display: none">
                File <a href="https://ipfs.io/ipfs/${list[i].ipfs}" target="_blank">${list[i].ipfs}</a>
                </div>             
            </li>`;
    }
    html += '</div>';
    document.getElementById('chatRoomMessagesLoaded').innerHTML = html;

    let encrypt = new JSEncrypt();
    encrypt.setPrivateKey(currentUser.privateKey);
    for (let i = list.length - 1; i >= 0; i--) {
        _innerIPFS(encrypt, list[i].ipfs, list[i].check);
    }
}

async function _innerIPFS(encrypt, ipfs, check) {
    console.log('start loading', ipfs);
    try {
        let fileBuffer = await currentIPFS.node.cat(ipfs);
        let tmps = JSON.parse(fileBuffer.toString());
        let result = 'error loading https://ipfs.io/ipfs/' + ipfs;
        if (!tmps[currentUser.account]) {
            result = 'no message for current user in https://ipfs.io/ipfs/' + ipfs;
        } else {
            let tmp = tmps[currentUser.account];
            result = encrypt.decrypt(tmp);
            if (web3.sha3(ipfs + result) == check) {
                document.getElementById('ipfs_check_' + ipfs + '_tick').className = 'material-icons tiny lock green-text';
                document.getElementById('ipfs_check_' + ipfs).className = 'green-text';
            }
            document.getElementById('ipfs_link_' + ipfs).style.display = 'block';
        }
        console.log('done loading', ipfs);
        document.getElementById('ipfs_' + ipfs).innerText = result;
    } catch (e) {
        console.log('error loading', ipfs);
        console.log(e);
    }
}

async function createNewChatRoomMessageModal() {
    document.getElementById('newChatRoomMessageModalLoading').style.display = 'none';
    const chatRoomModal = M.Modal.getInstance(document.getElementById('newChatRoomMessageModal'));
    const chatRoom = await import('../abi/chatroom.js');
    chatRoom.init(currentRoom.addr);
    const list = await chatRoom.membersList();
    let html = '<ul class="collection left-align">';
    for (let i = 0, ic = list.length; i < ic; i++) {
        let css = 'collection-item';
        let added = `<span class="blue white-text badge" id="loadingPublic_${list[i].addr}">key is loading</span>`;
        if (list[i].addr == currentUser.account) {
            added = '<span class="orange white-text badge">thats you</span>';
        }
        html += `<li class="${css}">
                <i class="material-icons tiny account_circle orange-text">account_circle</i>
                <label class="orange-text">${list[i].name} ${added}</label>
            </li>`;
    }
    html += '</div>';
    document.getElementById('listNewChatRoomMessageModal').innerHTML = html;

    chatRoomModal.open();
    setTimeout(() => {
        document.getElementById('newChatRoomMessageModalText').focus();
    }, 100);

    const members = await import('../abi/members.js');
    currentRoom.loadedKeys = [];
    for (let i = 0, ic = list.length; i < ic; i++) {
        let savedKey = '';
        if (list[i].addr == currentUser.account) {
            savedKey = currentUser.publicKey;
        } else {
            savedKey = await members.getKey(list[i].addr);
            document.getElementById('loadingPublic_' + list[i].addr).innerText = savedKey ? 'key is loaded' : 'no key!!!';
            document.getElementById('loadingPublic_' + list[i].addr).className = 'teal white-text badge';
        }
        currentRoom.loadedKeys.push({addr: list[i].addr, key: savedKey});
    }
}

async function saveNewChatRoomMessageModal() {
    const text = document.getElementById('newChatRoomMessageModalText').value;
    if (!text) {
        alert('plz enter some text');
        return false;
    }
    document.getElementById('newChatRoomMessageModalLoading').style.display = 'block';
    let resultJson = {};
    let encrypt = new JSEncrypt();
    for (let i = 0, ic = currentRoom.loadedKeys.length; i < ic; i++) {
        let current = currentRoom.loadedKeys[i];
        encrypt.setPublicKey(current.key);
        resultJson[current.addr] = encrypt.encrypt(text);
    }
    let content = currentIPFS.node.types.Buffer.from(JSON.stringify(resultJson));
    let results = await currentIPFS.node.add({
        content: content
    });
    console.log(results);
    const fileHash = results[0].hash;
    //const fileBuffer = await currentIPFS.node.cat(fileHash);
    //console.log('ipfs checked', fileBuffer.toString());

    const chatRoom = await import('../abi/chatroom.js');
    const tx = await chatRoom.createMessage(fileHash, web3.sha3(fileHash + text));
    document.getElementById('chatRoomMessagesTxWaiting').style.display = 'block';
    document.getElementById('chatRoomMessagesTxWaitingLink').innerHTML = `<a href="https://ropsten.etherscan.io/tx/${tx}" target="_blank">${tx}</a>`;
    const latestFilter = web3.eth.filter('latest');
    latestFilter.watch(function (error, result) {
        if (error) {
            console.error(error);
        } else {
            web3.eth.getBlock(result, true, function (error, data) {
                for (let i = 0, ic = data.transactions.length; i < ic; i++) {
                    if (tx == data.transactions[i].hash) {
                        document.getElementById('chatRoomMessagesTxWaiting').style.display = 'none';
                        initChatRoomMessages();
                        latestFilter.stopWatching();
                        break;
                    }
                }
            });
        }
    });
    const chatRoomModal = M.Modal.getInstance(document.getElementById('newChatRoomMessageModal'));
    chatRoomModal.close();
}
