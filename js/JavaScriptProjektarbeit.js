//Function to calculate the current week number
function getWeek(currentDate) {
    startDate = new Date(currentDate.getFullYear(), 0, 1);
    var days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));
    var weekNumber = Math.ceil(days / 7);
    weekNumber = weekNumber.toString();
    while (weekNumber.length < 2) weekNumber = "0" + weekNumber;
    // Return the calculated result      
    return { "week": weekNumber, "year": currentDate.getFullYear() };
}

//Function to set a changed week and check if conditions are met.
function calcWeek(direction) {
    date = JSON.parse(localStorage.getItem('date'));
    week = parseInt(date["week"]);

    if (direction == "last") {
        week = week - 1;
        if (week <= 0) {
            date["year"] = parseInt(date["year"]) - 1
            //calculate the last week of the year by checking the week of the last year.
            week = getWeek(new Date("12/31/" + date["year"]))["week"];
        }
    } else {
        week = week + 1;
        if (week > getWeek(new Date("12/31/" + date["year"]))["week"]) {
            date["year"] = parseInt(date["year"]) + 1
            week = 1
        }
    }

    week = week.toString();
    while (week.length < 2) week = "0" + week;
    date["week"] = week;
    $('#woche').text("Woche " + date.week);
    localStorage.setItem('date', JSON.stringify(date));
}




/**
* Fügt Daten einer HTML-Tabelle von der API unter http://sandbox.gibm.ch/tafel.php hinzu.
* @param {string} klasse_id - Die ID der Klasse, für die Daten abgerufen werden sollen.
* @param {string} [woche] - Die Woche, für die Daten abgerufen werden sollen (optional).
* @note Diese Funktion wurde von einem AI erstellt.
*/
function appendTable(klasse_id, woche) {
    // Prüfe, ob die klasse_id leer ist, und zeige eine Warnung an, falls ja
    if (klasse_id == "empty") {
        alert('Die klasse_id darf nicht leer sein!');
        return;
    }

    // Erstelle die URL mit den klasse_id und optionalen woche-Parametern
    var url = `http://sandbox.gibm.ch/tafel.php?klasse_id=${klasse_id}`;
    if (woche) {
        url += `&woche=${woche}`;
    }

    // Lösche alle Zeilen in der Tabelle ausser die Kopfzeile
    $('#timetable').find('tr:not(:first)').remove();

    // Erstelle ein Dictionary-Objekt, das die Zahlen auf die Wochentage abbildet
    var weekdays = {
        0: 'Sonntag',
        1: 'Montag',
        2: 'Dienstag',
        3: 'Mittwoch',
        4: 'Donnerstag',
        5: 'Freitag',
        6: 'Samstag'
    };

    // Hole die Daten von der API und füge sie der Tabelle hinzu
    $.getJSON(url, function (data) {
        $.each(data, function (index, item) {
            // Split the tafel_datum value into its component parts
            var parts = item.tafel_datum.split('-');
            // Join the parts back together in the desired format
            var formattedDate = `${parts[2]}.${parts[1]}.${parts[0]}`;
            // Replace the tafel_wochentag value with the corresponding weekday
            var weekday = weekdays[item.tafel_wochentag] || 'N/A';
            // Format the tafel_von and tafel_bis times to the hh:mm format
            var startTime = item.tafel_von.substr(0, 5) || 'N/A';
            var endTime = item.tafel_bis.substr(0, 5) || 'N/A';
            $('#timetable').append(`
            <tr>
              <td>${formattedDate}</td>
              <td>${weekday}</td>
              <td>${startTime}</td>
              <td>${endTime}</td>
              <td>${item.tafel_lehrer || 'N/A'}</td>
              <td>${item.tafel_fach || 'N/A'}</td>
              <td>${item.tafel_raum || 'N/A'}</td>
            </tr>
          `);
        });
    });
}


//Function to request a Table. Class must be given as parameter, week is optional.
function updateTable() {
    klasse = localStorage.getItem("lastSelectedClass");
    date = JSON.parse(localStorage.getItem('date'));
    woche = date["week"] + "-" + date["year"].toString();
    appendTable(klasse, woche);
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
            var currentValue = localStorage.getItem('lastSelectedClass');
            if ($('#klasse option[value="' + currentValue + '"]').length > 0) {
                $('#klasse').val(currentValue);
            } else {
                var newValue = $('#klasse option:first').val();
                localStorage.setItem('lastSelectedClass', newValue);
            }
            updateTable();
        }
    });
}

//Function to load all default Values
function setup() {
    //hide the infotext
    $("#info").hide();
    //Get all Jobs and append the Dropdown for Jobselection. If already a selected job is in the localstorage, it will be selected.
    lastJob = localStorage.getItem('lastSelectedJob');
    if (localStorage.getItem('date') === null) {
        localStorage.setItem('date', JSON.stringify(getWeek(new Date())));
    }
    var date = $.parseJSON(localStorage.getItem('date'));
    $('#woche').text("Woche " + date.week);
    //request the Data and filter if all Jobs ar needed or if there is already a selected Job
    $.getJSON({
        dataType: "json",
        url: "http://sandbox.gibm.ch/berufe.php",
        success: function (result) {
            $.each(result, function (i, value) {
                item = "<option class='dropdown-item' value='" + value.beruf_id + "' >" + value.beruf_name + "</option>";
                $("#berufe").append(item);
            });
            if (lastJob != null) {
                $("#berufe option[value=" + localStorage.getItem('lastSelectedJob') + "]").attr('selected', 'selected');
                getClass(lastJob);
            } else {
                getClass();
            };
        }
    });

}


$(document).ready(function () {

    setup();
    //set current week to the Date of the current week
    currentWeek = getWeek(new Date());

    $("#timetable").on("DOMSubtreeModified", function(){
        $("#info").show();
        setTimeout(function(){
            $("#info").hide()
        }, 1000);
    });


    

    //everytime 
    $("#berufe").on("change", function () {
        //reseten der ganzen Ansicht wenn die Klasse gewechselt wird.
        $("#klasse").empty()
        localStorage.setItem('lastSelectedJob', this.value);
        localStorage.setItem('date', JSON.stringify(currentWeek));
        getClass(this.value);
        updateTable();
        $('#woche').text("Woche " + currentWeek.week);
    });


    $("#klasse").on("change", function () {
        localStorage.setItem('lastSelectedClass', this.value);
        localStorage.setItem('date', JSON.stringify(currentWeek));
        updateTable();
        $('#woche').text("Woche " + currentWeek.week);
    });

    //eventlistener for moving backwards 1 week
    $("#last").click(function (e) {
        calcWeek("last");
        updateTable();
    });

    //eventlistener for the Button to move 1 week forward
    $("#next").click(function (e) {
        calcWeek("next");
        updateTable();
    });


});