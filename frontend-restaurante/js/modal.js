const modal1 = document.getElementById('modal1');
const modalMsg = document.getElementById('modalMsg');

const showMsg = (msg) => {
    modalMsg.innerHTML = msg;
    modal1.classList.remove('close');
}

const hideMsg = () => {
    modal1.classList.add('close');
}