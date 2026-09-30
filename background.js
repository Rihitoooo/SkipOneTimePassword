async function getToken() {
    const result = await chrome.identity.getAuthToken({
        interactive: true
    });
    return result.token;
}
async function getOTP() {
    const token = await getToken();

    const timeout = 20000;
    const starttime = Date.now();

    while(Date.now() - starttime < timeout){
        const response = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:ninsho-qa@iimc.kyoto-u.ac.jp&maxResults=1",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        const data = await response.json();
        if (!data.messages || data.messages.length === 0){
            await new Promise(resolve => setTimeout(resolve,500));
            continue;
        }

        const messageID = data.messages[0].id;
        const messageResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageID}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const message = await messageResponse.json();
        const receiveTime = Number(message.internalDate);
        const age = Date.now() - receiveTime;

        if (age >= 0 && age <= 60 * 1000){
            const otp = message.snippet.split(" ")[19]
            return otp
        }

        await new Promise(resolve => setTimeout(resolve,500));
    }
    
    throw new Error("OTPメールが届きませんでした。")
}

chrome.runtime.onMessage.addListener(
    (message,sender,sendResponse) => {
        if (message.type === "GET_OTP"){
            getOTP().then(otp => {
                sendResponse({
                    success: true,
                    otp: otp
                });
            }).catch(error => {
                sendResponse({
                    success: false,
                    error: error.message
                });
            });
            return true;
        }
    }
)