/**
 * Calculates the week number and year of the given date.
 *
 * @param {Date} currentDate - The date to calculate the week number for.
 * @return {Object} An object containing the calculated week number and year.
 */
function getWeek(currentDate) {
    // Create a new Date object representing January 1 of the current year
    startDate = new Date(currentDate.getFullYear(), 0, 1);
    // Create a new Date object representing January 1 of the current year
    var days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));
    // Calculate the weeknumber by dividing the days by 7 and format it to string and round it up to the next full int
    var weekNumber = Math.ceil(days / 7);
    weekNumber = weekNumber.toString();
    // If the Number is shorter then 2 it will append leading zeros.
    while (weekNumber.length < 2) weekNumber = "0" + weekNumber;
    // Return the calculated result      
    return { "week": weekNumber, "year": currentDate.getFullYear() };
}

/**
 * Calculates the week number for the previous or next week, and updates the date in local storage.
 *
 * @param {string} direction - The direction to move the date, either "last" or "next".
 */
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

    // Format the Week to the correct format, put it into a JSON-Object and store it into the LocalStorage
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
        // API is reachable and delivers data
        if (data[0]) {
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
        } else {
            // API is reachable but does not deliver data
            $("#info").text("API is reachable but does not deliver data.");
            $("#info").show();
            setTimeout(function () {
                $("#info").hide()
            }, 1000);
        }
    }).fail(function () {
        // API is not reachable or not delivering data, display a message and retry after a short delay
        $("#info").text("API is not reachable");
        $("#info").show();
        setTimeout(function () {
            $("#info").hide()
        }, 1000);
    });
}

/**
 * Retrieves the selected class and week from local storage, and updates the table with the corresponding data.
 */
function updateTable() {
    klasse = localStorage.getItem("lastSelectedClass");
    date = JSON.parse(localStorage.getItem('date'));
    woche = date["week"] + "-" + date["year"].toString();
    appendTable(klasse, woche);
}


/**
 * Retrieves the list of classes from the API and appends them to the class dropdown.
 * If a berufID is given as a parameter, it filters the classes by job.
 * If a class was previously selected, it is set as the selected option again.
 *
 * @param {string} berufID - The ID of the job to filter the classes by.
 */
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
        },
        // If there is a unvalid input, it will repeat the request without a specific job.
        error: function () {
            getClass();
        }
    });
}

/**
 * Sets up the default values and loads the data from the API.
 *
 * Hides the info text, retrieves the list of jobs and appends them to the job dropdown.
 * If a job was previously selected, it is set as the selected option again.
 * If the date is not stored in local storage, it retrieves the current week number and stores it in local storage.
 * It then displays the current week number and retrieves the list of classes from the API, filtered by the selected job if applicable.
 */
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
            if (result) {
                // Checks of there is Data
                $.each(result, function (i, value) {
                    item = "<option class='dropdown-item' value='" + value.beruf_id + "' >" + value.beruf_name + "</option>";
                    $("#berufe").append(item);
                });
                // If there is already a job in the localStorage, it will selct this one. and request all the classes of the Job else it just requests every Class.
                if (lastJob != null) {
                    $("#berufe option[value=" + localStorage.getItem('lastSelectedJob') + "]").attr('selected', 'selected');
                    getClass(lastJob);
                } else {
                    getClass();
                };

            } else {
                // API is reachable but does not deliver data
                $("#info").text("API is reachable but does not deliver data.");
                $("#info").show();
                setTimeout(function () {
                    $("#info").hide()
                }, 1000);
            }
        },
        error: function () {
            // API is not reachable
            $("#info").text("API is not reachable. Retrying in 1 seconds...");
            $("#info").show();
            setTimeout(function () {
                $("#info").hide()
            }, 1000);
            setTimeout(setup, 1000);
        }
    });

}


// Document ready function
$(document).ready(function () {
    // Set up default values and load data from the API
    setup();

    // Get the current week number
    currentWeek = getWeek(new Date());

    // Show the info text when the timetable is modified and hide it after 1 second
    $("#timetable").on("DOMSubtreeModified", function () {
        $("#info").text("Daten wurden verändert");
        $("#info").show();
        setTimeout(function () {
            $("#info").hide()
        }, 1000);
    });

    // When the job dropdown changes, update the class dropdown and local storage
    $("#berufe").on("change", function () {
        $("#klasse").empty();
        localStorage.setItem('lastSelectedJob', this.value);
        localStorage.setItem('date', JSON.stringify(currentWeek));
        getClass(this.value);
        updateTable();
        $('#woche').text("Woche " + currentWeek.week);
    });

    // When the class dropdown changes, update local storage
    $("#klasse").on("change", function () {
        localStorage.setItem('lastSelectedClass', this.value);
        localStorage.setItem('date', JSON.stringify(currentWeek));
        updateTable();
        $('#woche').text("Woche " + currentWeek.week);
    });

    // When the "last" button is clicked, calculate the previous week and update the table
    $("#last").click(function (e) {
        calcWeek("last");
        updateTable();
    });

    // When the "next" button is clicked, calculate the next week and update the table
    $("#next").click(function (e) {
        calcWeek("next");
        updateTable();
    });
});