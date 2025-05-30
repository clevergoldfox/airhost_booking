$(function () {
    // myFunc();
    console.log("me");
    
}) ;

function myFunc () {
    var me = null;
        if(localStorage.getItem("me")){
            const medata = JSON.parse(localStorage.getItem("me"));
            me = {
                "id": medata[0],
                "firstname": medata[1],
                "lastname": medata[2],
                "gender": medata[3],
                "birth": medata[4],
                "email": medata[5],
                "role": medata[6],
                "avatar": medata[8]
            };
    }
    console.log(me);
    if(!me) {
        location.href = "/login";
    }
};
