

var IDofPlot;


$(document).ready(function () {
    var today = new Date();
    //console.log((today.getTime()/1000).toFixed(0));
    var tmpurl = window.location.href;
    var tmp1 = tmpurl.substring(tmpurl.indexOf("?") + 1);
    var tmp2 = tmp1.split('&');
    var plotParams = {};
    console.log("tmp2", tmp2);
    for (let index = 0; index < tmp2.length; index++) {
        var tmp3 = tmp2[index].split("=");
        plotParams[tmp3[0]] = tmp3[1];
    }
    console.log("plotParams", plotParams);
    IDofPlot = plotParams["plotID"];
    var plotTitle = decodeURIComponent(plotParams["plotName"]);
    var template = $('#headTitle-template').html();
        var templateScript = Handlebars.compile(template);
        var html = templateScript(plotTitle);
        $("#headTitle").append(html);



   
});


$(function () {
    $("#datepicker").datepicker();
});


function OnClickAlg() {
    var date = $("#datepicker").val();
    console.log("date::::::", date)
    var settings = {
        "url": "http://localhost:3000/calculate?plotId=" + IDofPlot + "&startDate=" + date,
        "method": "GET",
        "timeout": 0,
    };

    $.ajax(settings).done(function (response) {
        console.log(response);
        var tmparr=[];
        
        for (const [key, value] of Object.entries(response.result)) {
            console.log(key, value);
            var TM = ((new Date(response.result[key])).getTime()/1000).toFixed(0);
            var obj={
                text: key,
                date: response.result[key],
                stamp: TM
            }
            tmparr.push(obj);
          }
        var template = $('#timeline-template').html();
        var templateScript = Handlebars.compile(template);
        var html = templateScript(tmparr);
        $("#jtimeline-plot").append(html);
        $(function () {
            $('#jtimeline-plot').jTimeline();
        });
    });
}