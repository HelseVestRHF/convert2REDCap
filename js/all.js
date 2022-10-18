function process(data, filename) {
    // gets an array of variables and converts to JSON
    var header = data[0];

    var jsonVersion = []; // an array of structs

    // add the header to the table
    var str = "<tr>";
    for (var i = 0; i < header.length; i++) {
        str += "<th>" + header[i] + "</th>";
    }
    jQuery('#thead').append(str + "</tr>");


    // not every row is a full record. We should check if the first column has a value,
    // if not we should collate the rows until we find the next variable
    var merged_data = [];
    merged_data.push(header); // save to assume its a single row
    var current_variable = "";
    for (var i = 1; i < data.length; i++) {
        var row = data[i];
        //console.log("variable found: " + row[0]);
        if (row[0] != "") {
            // in case we get a new variable and we have the information from before, merge with merged_data
            if (current_variable != "") {
                merged_data.push(current_variable);
            }
            // we have a new variable
            current_variable = row; // remember this one (overwrite for next run)
        } else {
            // we get more information for the current variable
            if (current_variable != "") { // should always be true
                current_variable[2] += ("; " + row[2]); // append the information for the choices and check the next row
            }
        }
    }
    jQuery("#output").html(JSON.stringify(merged_data));
    jQuery("#stats").children().remove();
    jQuery('#stats').html(" (" + merged_data.length + " fields)");

    // add to JSON version
    for (var i = 1; i < merged_data.length; i++) {
        var row = merged_data[i];
        var entry = {};
        for (var j = 0; j < row.length; j++) {
            entry[header[j]] = row[j];
        }
        jsonVersion.push(entry);
    }
    jQuery('#jsonV').text(JSON.stringify(jsonVersion, null, 2));
    if (1) { // download
        var downloadLink = document.createElement("a");
        downloadLink.download = filename.replace(".csv", ".json");
        var myBlob = new Blob([JSON.stringify(jsonVersion, null, 2)], { type: "application/json" });
        downloadLink.href = window.URL.createObjectURL(myBlob);
        downloadLink.onclick = function (e) {
            document.body.removeChild(e.target);
        };
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();
    }

    // add the rows to the table
    var str = "";
    for (var i = 1; i < merged_data.length; i++) {
        str += "<tr>";
        var row = merged_data[i];
        for (var j = 0; j < row.length; j++) {
            str += "<td>" + row[j].replace(/;/g, ";<br>") + "</td>";
        }
        str += "</tr>";
    }
    jQuery('#tbody').append(str);
}

function upload(data) {
    //console.log(JSON.stringify(data));
    var filename = data[0].name;
    var fr = new FileReader();
    fr.onload = function () {
        var csv = fr.result;
        var data = Papa.parse(csv);

        // clear out the previous content
        jQuery('#tbody').children().remove();
        jQuery('#thead').children().remove();
        jQuery('#output').text("");
        jQuery('#jsonV').text("");

        process(data.data, filename);
        //console.log(JSON.stringify(data.data));

    };
    fr.readAsText(data[0]);
    return false;
}

jQuery(document).ready(function () {
    //console.log("HI");

    $('#drop-here').on(
        'dragover',
        function (e) {
            e.preventDefault();
            e.stopPropagation();
            //console.log("dragover");
            return true;
        }
    )
    $('#drop-here').on(
        'dragenter',
        function (e) {
            e.preventDefault();
            e.stopPropagation();
            //console.log("dragenter");
        }
    );

    jQuery('#drop-here').on('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        //console.log("drop here");
        if (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files.length) {
            /*UPLOAD FILES HERE*/
            //console.log("got a file");
            upload(e.originalEvent.dataTransfer.files);
        }
        return false;
    });
});
