async function initMembers() {
    const members = await import('../abi/members.js');
    let data = await members.getKey(currentUser.account);
    let saved = JSON.parse(localStorage.getItem('privateForPublics'));
    if (data) {
        currentUser.publicKey = data;
        if (saved && saved[data]) {
            currentUser.privateKey = saved[data];
            document.getElementById('loadedCheck1').className = "material-icons tiny check green-text";
            document.getElementById('loadedText1').className = "green-text";
            document.getElementById('loadedText1').innerHTML = 'Public Key is stored and Private Key is imported';
        } else {
            document.getElementById('loadedText1').innerHTML = 'Public Key is stored, but Private Key is not imported <a href="#" onclick="return false;">Import (todo)</a> or <a href="#" onclick="generatePublicPrivateModal(); return false;">Regenerate</a>';
        }
    } else {
        document.getElementById('loadedText1').innerHTML += ' <a href="#" onclick="generatePublicPrivateModal(); return false;">Generate Public and Private Key</a>';
    }
    members.membersList();
}

async function generatePublicPrivateModal() {
    const rsaModal = M.Modal.getInstance(document.getElementById('rsaModal'));
    document.getElementById('rsaModalLoading').style.display = 'block';
    document.getElementById('rsaModalLoaded').style.display = 'none';
    rsaModal.open();

    let encrypt = new JSEncrypt({log : true});
    setTimeout(() => {
        const pair = encrypt.getKey();
        currentUser.publicKey = pair.getPublicKey();
        currentUser.privateKey = pair.getPrivateKey();


        let saved = JSON.parse(localStorage.getItem('privateForPublics'));
        if (!saved) saved = {};
        saved[currentUser.publicKey] = currentUser.privateKey;
        localStorage.setItem('privateForPublics', JSON.stringify(saved))
        document.getElementById('rsaModalLoading').style.display = 'none';
        document.getElementById('rsaModalLoaded').style.display = 'block';
        document.getElementById('rsaModalLoaded').innerHTML = '<h5>Public</h5>' +
            '<textarea class="materialize-textarea">' + currentUser.publicKey + '</textarea><br/>' +
            '<h5>Private [PLZ COPY!]</h5>' +
            '<textarea class="materialize-textarea">' + currentUser.privateKey + '</textarea>';
    }, 200);
}

async function savePublicPrivate() {
    const members = await import('../abi/members.js');
    const tx = await members.setKey(currentUser.publicKey);
    document.getElementById('rsaModalTxWaiting').style.display = 'block';
    document.getElementById('rsaModalTxWaitingLink').innerHTML = `<a href="https://ropsten.etherscan.io/tx/${tx}" target="_blank">${tx}</a>`;
    const latestFilter = web3.eth.filter('latest');
    latestFilter.watch(function (error, result) {
        if (error) {
            console.error(error);
        } else {
            web3.eth.getBlock(result, true, function (error, data) {
                for (let i = 0, ic = data.transactions.length; i < ic; i++) {
                    if (tx == data.transactions[i].hash) {
                        document.getElementById('rsaModalTxWaiting').style.display = 'none';
                        document.getElementById('loadedCheck1').className = "material-icons tiny check green-text";
                        document.getElementById('loadedText1').className = "green-text";
                        document.getElementById('loadedText1').innerHTML = 'Public Key is stored and Private Key is imported';
                        latestFilter.stopWatching();
                        break;
                    }
                }
            });
        }
    });
    const rsaModal = M.Modal.getInstance(document.getElementById('rsaModal'));
    rsaModal.close();
}
