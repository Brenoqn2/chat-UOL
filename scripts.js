let userName = null;
function enterRoom(){
    userName = prompt("Digite o seu nome de usuário")
    let promise = axios.post('https://mock-api.driven.com.br/api/v4/uol/participants',{name:userName});
    promise.then(validUsername);
    promise.catch(invalidUsername);
}

function validUsername(){
    searchMessages();
    setInterval(searchMessages,3000);
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
    // check if there is any new message
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

            if (messages[i].type == 'private_message' && (messages[i].to == userName || messages[i].from == userName)){
                main.innerHTML += 
                `
                <div class = "msg private_message" id="msg${i}">
                    <p><span>(${messages[i].time}) </span><strong>${messages[i].from} </strong>reservadamente para <strong>${messages[i].to}</strong>: ${messages[i].text}</p>
                </div>
                `
            }
            if (i == (messages.length - 1)){
                try{
                    let lastAddedMessage = document.getElementById(`msg${i}`);
                    lastAddedMessage.scrollIntoView();
                }
                catch(e){};
            }
        }
    }
}

let to = "Todos";
let type = "message";

function sendMessage(){
    let message = document.getElementsByTagName('input')[0].value;
    document.getElementsByTagName('input')[0].value = "";
    message = {
        from:userName,
        to: to,
        text:message,
        type:type
    };
    let promise = axios.post('https://mock-api.driven.com.br/api/v4/uol/messages',message)
    promise.then(searchMessages);
    promise.catch(reloadPage);
}

let refreshUsers = null;

function showSidebar(){
    let background = document.getElementsByClassName('background')[0];
    background.classList.remove('hidden');
    let sidebar = document.getElementsByTagName('section')[0];
    sidebar.classList.remove('hidden');
    searchUsers();
    refreshUsers = setInterval(searchUsers,10000)
}

function searchUsers(){
    let promise = axios.get('https://mock-api.driven.com.br/api/v4/uol/participants');
    promise.then(showUsers);
}

function showUsers(response){
    let container = document.getElementsByClassName('container')[0];
    let newUsers = response.data;
    let oldUsers = document.getElementsByClassName('user');
    // Remove users that disconnected
    for (let i = 0;i<oldUsers.length;i++){
        let userOnline = false;
        for (let j = 0;j<newUsers.length;j++){
            if (oldUsers[i].id == newUsers[j].name || oldUsers[i].id == "Todos"){
                userOnline = true;
            }
        }
        if (userOnline == false){
            oldUsers[i].remove()
        }
    }
    // Add new users
    for (let i = 0; i<newUsers.length; i++){
        let userAlreadyOnline = false;
        for (let j = 0; j<oldUsers.length; j++){
            if (newUsers[i].name == oldUsers[j].id){
                userAlreadyOnline = true;
            }
        }
        if (userAlreadyOnline == false){
            container.innerHTML +=
            `
            <div class="option user" onclick="selectUser(this)" id = ${newUsers[i].name}>
                <ion-icon name="person-circle"></ion-icon>
                <div>
                    <div class="textBox">${newUsers[i].name}</div>
                </div>
                <ion-icon name="checkmark-sharp"></ion-icon>
            </div>
            `
        }
    }
}

function selectUser(element){
    let users = document.getElementsByClassName('user');
    for (let i = 0; i < users.length; i++){
        if (users[i].classList.contains('selected')){
            users[i].classList.remove('selected');
        }
    }
    to = element.id;
    element.classList.add('selected');
    if (to == 'Todos'){
        lockPublicVisibility();
    }
    else{ 
        let footer = document.getElementsByTagName('footer')[0];
        try{
            document.getElementById('privateMessageAlert').remove();
        }
        catch(e){};
        if (type == 'private_message'){
            footer.innerHTML +=
            `
            <p id = "privateMessageAlert">Enviando para ${to} (reservadamente)</p>
            `
        }
        else{
            footer.innerHTML +=
            `
            <p id = "privateMessageAlert">Enviando para ${to}</p>
            `
        }
    }   
}

function selectVisibility(element){
    if (to != 'Todos'){
        let options = document.getElementsByClassName('visibility');
        for (let i = 0; i < options.length; i++){
            if (options[i].classList.contains('selected')){
                options[i].classList.remove('selected');
            }
        }
        type = element.id;
        element.classList.add('selected');
    }
    if (type =='private_message'){
        try{
            document.getElementById('privateMessageAlert').remove();
        }
        catch(e){};
        let footer = document.getElementsByTagName('footer')[0];
        footer.innerHTML +=
        `
        <p id = "privateMessageAlert">Enviando para ${to} (reservadamente)</p>
        `
    }
    if (type == 'message'){
        try{
            document.getElementById('privateMessageAlert').remove();
        }
        catch(e){};
    }
}

function lockPublicVisibility(){
    let options = document.getElementsByClassName('visibility');
    for (let i = 0; i < options.length; i++){
        if (options[i].classList.contains('selected')){
            options[i].classList.remove('selected');
        }
    }
    document.getElementById('message').classList.add('selected');
    type='message'
    try{
        document.getElementById('privateMessageAlert').remove();
    }
    catch(e){};
}

function hideSidebar(){
    let background = document.getElementsByClassName('background')[0];
    background.classList.add('hidden');
    let sidebar = document.getElementsByTagName('section')[0];
    sidebar.classList.add('hidden');
    clearInterval(refreshUsers);
}

enterRoom();