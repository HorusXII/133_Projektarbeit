$(document).ready(function () {
    $.getJSON({
        dataType: "json",
        url: "http://sandbox.gibm.ch/berufe.php",
        success: function (result) {
            $.each(result, function (i, value) {
                item = "<option class='dropdown-item' value='" + value.beruf_id + "' >" + value.beruf_name + "</option>";
                $("#berufe").append(item);
            });
            if (localStorage.getItem('lastSelectedJob') != null) {
                $("#berufe option[value="+ localStorage.getItem('lastSelectedJob') +"]").attr('selected', 'selected');
            };   
        }
    });

    $.getJSON({
        dataType: "json",
        url: "http://sandbox.gibm.ch/klassen.php",
        success: function (result) {
            $.each(result, function (i, value) {
                item = "<option class='dropdown-item' value='" + value.klasse_id + "' >" + value.klasse_name + "</option>";
                $("#klasse").append(item);
            });
            if (localStorage.getItem('lastSelectedClass') != null) {
                $("#klasse option[value="+ localStorage.getItem('lastSelectedClass') +"]").attr('selected', 'selected');
            };
        }
    });

    
    $("#berufe").on("change", function () {
        $("#klasse").empty()
        localStorage.setItem('lastSelectedJob', this.value);     
        $.getJSON({
            dataType: "json",
            url: "http://sandbox.gibm.ch/klassen.php?beruf_id=" + this.value,
            success: function (result) {
                $.each(result, function (i, value) {
                    item = "<option class='dropdown-item' value='" + value.klasse_id + "' >" + value.klasse_name + "</option>";
                    $("#klasse").append(item);
                });
            }
        });
    });

    $("#klasse").on("change", function () {
        localStorage.setItem('lastSelectedClass', this.value);     
        $.getJSON({
            dataType: "json",
            url: "http://sandbox.gibm.ch/klassen.php?beruf_id=" + this.value,
            success: function (result) {
                $.each(result, function (i, value) {
                    item = "<option class='dropdown-item' value='" + value.klasse_id + "' >" + value.klasse_name + "</option>";
                    $("#klasse").append(item);
                    console.log(value.klasse_name)
                });
            }
        });
    });




    $("#clear").click(function (e) {
        localStorage.clear();
    });

});