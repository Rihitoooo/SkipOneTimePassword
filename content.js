async function main() {
    await new Promise(resolve => setTimeout(resolve,1000));

    var result = confirm('ワンタイムパスワードを自動入力しますか？');

    if(result) {
        ShowWaitingMessage();
        chrome.runtime.sendMessage(
            {type: "GET_OTP"},
            (response) => {
                console.log(response);
                if (response.success){
                    const otp = response.otp;
                    console.log(otp);
                    const input = document.getElementById("password_input");
                    input.value = otp;
                    HideWaitingMessage();
                    alert("OTPを入力しました。");
                }else{
                    alert("ワンタイムパスワードの取得に失敗しました");
                }
            }
        )
    } else {
        alert("自動入力がキャンセルされました。");
    }
}
function ShowWaitingMessage(){
    waitingMessage.style.display = "Block";
}
function HideWaitingMessage(){
    waitingMessage.style.display = "None";
}

const waitingMessage = document.createElement("div");

waitingMessage.textContent = "OTP受信を待っています…";

waitingMessage.style.position = "fixed";
waitingMessage.style.top = "20px";
waitingMessage.style.right = "20px";
waitingMessage.style.padding = "12px 20px";
waitingMessage.style.backgroundColor = "white";
waitingMessage.style.border = "1px solid #ccc";
waitingMessage.style.borderRadius = "8px";
waitingMessage.style.zIndex = "999999";
waitingMessage.style.display = "None";

document.body.appendChild(waitingMessage);


main();