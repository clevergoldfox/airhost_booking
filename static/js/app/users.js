//edit userdata
var edituserId = null;

$("#createuser-form").submit(function (event) {
    event.preventDefault();
    const form = this; // native DOM element
    const formData = new FormData(form); // create FormData object
    if(!edituserId){
        $.ajax({
            type: "POST",
            url: "/signup",
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                location.href = "/users-page"; // Redirect to login page on success
            },
            error: function (xhr, status, error) {
                alert("申し訳ありませんが、もう一度お試しください。");
            }
        });
    }else {
        formData.append("id", edituserId);
        $.ajax({
            type: "PUT",
            url: "/users",
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                console.log(response);
                
                location.href = "/users-page"; // Redirect to login page on success
            },
            error: function (xhr, status, error) {
                console.log(error);
                
                // alert("申し訳ありませんが、もう一度お試しください。");
            }
        });
    }
});

$("#users_data").on("click", ".edituserbtn", function(){
    const curUser = {
        "id": $(this).attr("data-index"),
        "firstname": $(this).closest("tr").find('td').eq(3).text(),
        "lastname": $(this).closest("tr").find('td').eq(2).text(),
        "gender": $(this).closest("tr").find('td').eq(4).text(),
        "birth": $(this).closest("tr").find('td').eq(5).text(),
        "email": $(this).closest("tr").find('td').eq(6).text(),
        "role": $(this).closest("tr").find('td').eq(7).text(),
        "avatar": $(this).closest("tr").find('img').attr('src')
    };
    console.log(curUser);
    edituserform(curUser);
});

$("#users_data").on("click", ".deluserbtn", function() {
    const id = $(this).attr("data-index");
    const formData = new FormData();
    formData.append("id", id);
    $.ajax({
        type: "DELETE",
        url: "/users/"+ id,
        success: function (response) {
            location.href = "/users-page"; // Redirect to login page on success
        },
        error: function (xhr, status, error) {
            alert("申し訳ありませんが、もう一度お試しください。");
        }
    });

})

function edituserform(data) {
    edituserId = data.id;
    $("#lastname").val(data.lastname);
    $("#firstname").val(data.firstname);
    $('input[name="gender"][value="'+ data.gender +'"]').prop('checked', true);
    $("#birth").val(data.birth);
    $("#email").val(data.email);
    $('input[name="role"][value="'+ data.role +'"]').prop('checked', true);
    $("#avatarimg").attr("src", data.avatar);
    $("#usersubbtn").text("修正")
    $("#passtoogle").addClass("d-none");
}



