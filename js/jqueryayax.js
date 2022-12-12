$(document).ready(function () {


    $.getJSON({
        dataType: "json",
        url: "http://sandbox.gibm.ch/berufe.php",
        success: function (result) {
            console.log(result)

            $.each(result, function (i, value) {
                item = "<option class='dropdown-item' value='" + value.beruf_id + "' >" + value.beruf_name + "</option>";
                $("#dropdown").append(item);
            });
/* 
            if (localStorage.getItem('lastSelectedItem') != null) {
                $("#dropdown option[value="+ localStorage.getItem('lastSelectedItem') +"]").attr('selected', 'selected');
            }; */
    
        }
    });


/*     if (localStorage.getItem('lastSelectedItem') != null) {
        dataID = localStorage.getItem('lastSelectedItem')
        ajaxRequest(dataID);
    };


    $("#dropdown").on("change", function () {
        localStorage.setItem('lastSelectedItem', this.value);     
        ajaxRequest(this.value)
    });




    $("#clear").click(function (e) {
        localStorage.clear();
    });

 */
});

/* 
function ajaxRequest(value) {
    if (!$.trim( $('#ausgabe').html() ).length){
        console.log("empty")
        $('#ausgabe').append('<table id="tabele" class="table"><tr><th>Stadt</th><th>Strasse</th><th>Öffnungszeit</th></tr></table>');
    }else{
        $("#tabele").find("tr:gt(0)").remove();
    }

    $.getJSON({
        dataType: "json",
        url: "https://gibm.becknet.ch/warenhaus/getFiliale.php?filiale=" + value + "&format=JSON",
        success: function (result) {
            console.log(result)
            console.log("success")
            $('#tabele').append(
                '<tr><td>' + result[0].stadt +
                '</td><td>' + result[0].strasse +
                '</td><td>' + result[0].oeffnungszeiten +
                '</td></tr>');
        }
    });
} */