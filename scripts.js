let userName = null;
function enterRoom(){
    userName = prompt("Digite o seu nome de usuário")
    let promise = axios.post('https://mock-api.driven.com.br/api/v4/uol/participants',{name:userName});
    promise.then(validUsername);
    promise.catch(invalidUsername);
}

function validUsername(){
    setInterval(onlineStatus,5000);
}

function onlineStatus(){
    let promise = axios.post('https://mock-api.driven.com.br/api/v4/uol/status',{name:userName});
    promise.catch(reloadPage);
}

function reloadPage(){
    window.location.reload();
}

function invalidUsername(){
    alert('Este nome de usuário já está em uso!');
    enterRoom();
}

function searchMessages(){
    const promise = axios.get('https://mock-api.driven.com.br/api/v4/uol/messages');
    promise.then(renderMessages);
}

let lastMessage = {
    from:'',
    to:'',
    text:'',
    type:'',
    time:''
};

function renderMessages(response){
    let messages = response.data;
    let main = document.getElementsByTagName('main')[0];
    let lastServerMessage = messages[messages.length - 1];
    if (lastMessage.from != lastServerMessage.from || lastMessage.to != lastServerMessage.to || lastMessage.text != lastServerMessage.text || lastMessage.type != lastServerMessage.type || lastMessage.time != lastServerMessage.time){
        lastMessage = lastServerMessage;
        main.innerHTML = '';
        for (let i = 0; i < messages.length; i++){
            if (messages[i].type == 'status'){
                main.innerHTML += 
                `
                <div class = "msg status" id="msg${i}">
                    <p><span>(${messages[i].time}) </span><strong>${messages[i].from} </strong>${messages[i].text}</p>
                </div>
                `
            }

            if (messages[i].type == 'message'){
                main.innerHTML += 
                `
                <div class = "msg message" id="msg${i}">
                    <p><span>(${messages[i].time}) </span><strong>${messages[i].from} </strong>para <strong>${messages[i].to}</strong>: ${messages[i].text}</p>
                </div>
                `
            }

            if (messages[i].type == 'private_message'){
                main.innerHTML += 
                `
                <div class = "msg private_message" id="msg${i}">
                    <p><span>(${messages[i].time}) </span><strong>${messages[i].from} </strong>reservadamente para <strong>${messages[i].to}</strong>: ${messages[i].text}</p>
                </div>
                `
            }
            if (i == (messages.length - 1)){
                let lastAddedMessage = document.getElementById(`msg${i}`);
                lastAddedMessage.scrollIntoView();
            }
        }
    }
}

enterRoom();
searchMessages();
setInterval(searchMessages,3000);