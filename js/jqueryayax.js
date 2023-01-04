$(document).ready(function () {
    setup();

    $("#berufe").on("change", function () {
        $("#klasse").empty()
        localStorage.setItem('lastSelectedJob', this.value);
        getClass(this.value);
    });

    $("#klasse").on("change", function () {
        localStorage.setItem('lastSelectedClass', this.value);
        localStorage.setItem('date', JSON.stringify(getWeek(new Date())));
        getTable();
    });
});

$("#last").click(function (e) {
    calcWeek("last");
    getTable();
});

$("#next").click(function (e) {
    calcWeek("next");
    getTable();
});


//Function to set a changed week and check if conditions are met.
function calcWeek(direction){       
    date =  JSON.parse( localStorage.getItem('date') );
    week = parseInt(date["week"]);

    
    if (direction == "last"){
        week = week-1;
        if (week <= 0){
            date["year"] = parseInt(date["year"])-1
            week = getWeek(new Date("12/31/" + date["year"]))["week"];
        }
    } else {
        week = week + 1;
        if (week > getWeek(new Date("12/31/" + date["year"]))["week"]){
            date["year"] = parseInt(date["year"])+1
            week = 1
        }
    }

    week = week.toString();
    while (week.length < 2) week = "0" + week; 
    date["week"] = week;
    localStorage.setItem('date', JSON.stringify(date));

}


//Function to load all default Values
function setup() {
    //Get all Jobs and append the Dropdown for Jobselection. If already a selected job is in the localstorage, it will be selected.
    lastJob = localStorage.getItem('lastSelectedJob')
    if (localStorage.getItem('date') === null){
        localStorage.setItem('date', JSON.stringify(getWeek(new Date())))
    }
    $.getJSON({
        dataType: "json",
        url: "http://sandbox.gibm.ch/berufe.php",
        success: function (result) {
            $.each(result, function (i, value) {
                item = "<option class='dropdown-item' value='" + value.beruf_id + "' >" + value.beruf_name + "</option>";
                $("#berufe").append(item);
            });

            if (lastJob != null) {
                $
                $("#berufe option[value=" + localStorage.getItem('lastSelectedJob') + "]").attr('selected', 'selected');
                getClass(lastJob);
            } else {
                getClass();
            };
        }
    });

}

//Function to calculate the current week number
function getWeek(currentDate){
    startDate = new Date(currentDate.getFullYear(), 0, 1);
    var days = Math.floor((currentDate - startDate) /(24 * 60 * 60 * 1000));
    var weekNumber = Math.ceil(days / 7);
    weekNumber = weekNumber.toString();
    while (weekNumber.length < 2) weekNumber = "0" + weekNumber;
    // Return the calculated result      
    return {"week":weekNumber, "year": currentDate.getFullYear()};
}

//Function to request a Table. Class must be given as parameter, week is optional.
function getTable() {
    klasse = localStorage.getItem("lastSelectedClass")
    date =  JSON.parse( localStorage.getItem('date') );
    woche = date["week"] + "-" + date["year"].toString();
    url = "http://sandbox.gibm.ch/tafel.php?klasse_id=" + klasse;
    if (woche != undefined) {
        url = url + "&woche=" + woche;
    };
    $.getJSON({
        dataType: "json",
        url: this.url,
        success: function (result) {
            console.log(result)
        }
    });

}



//Function to get all Classes & Append them. if a JobID is given als parameter, append Classes of this Job.
function getClass(berufID) {
    url = "http://sandbox.gibm.ch/klassen.php";
    if (berufID != undefined) {
        url = "http://sandbox.gibm.ch/klassen.php?beruf_id=" + berufID;
    };
    //Append the Class dropdown with all classes per default. If a class was already selected, it will be set as selected again.
    $.getJSON({
        dataType: "json",
        url: this.url,
        success: function (result) {
            $.each(result, function (i, value) {
                item = "<option class='dropdown-item' value='" + value.klasse_id + "' >" + value.klasse_name + "</option>";
                $("#klasse").append(item);
            });
            if (localStorage.getItem('lastSelectedClass') != null) {
                $("#klasse option[value=" + localStorage.getItem('lastSelectedClass') + "]").attr('selected', 'selected');
            };
        }
    });
}