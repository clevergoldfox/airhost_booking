var sheetNum = 1;
var selSheet = 1;
var sheetList = [];
// var calendarYear = getInitialCalYearString(); // Default year for the calendar
var calendarYear = 2023; // Default year for the calendar
/* chart colors default */
var $chrt_border_color = "#efefef";
var $chrt_grid_color = "#DDD"
var $chrt_main = "#E24913";
/* red       */
var $chrt_second = "#6595b4";
/* blue      */
var $chrt_third = "#FF9F01";
/* orange    */
var $chrt_fourth = "#7e9d3a";
/* green     */
var $chrt_fifth = "#BD362F";
/* dark red  */
var $chrt_mono = "#000";

var reservation_data = JSON.parse(localStorage.getItem('reservationData'))||[];


function getInitialCalYearString() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const aprilFirst = new Date(currentYear, 3, 1); // Month is 0-indexed: 3 = April

    if (today < aprilFirst) {
        return String(currentYear - 1);  // Before April 1 => previous year
    } else {
        return String(currentYear);      // On or after April 1 => current year
    }
}

async function draw_operation_chart(data){
    console.log(data);
    
    /* ================  bar chart ================*/
    
    var data1 = [];
    var data2 = [];
    var data3 = [];
    await data[1].forEach((item, index) => {
            data1.push([index+1,item[1]?item[1]:0]);
            data2.push([index+1,item[2]?item[2]:0]);
            data3.push([index+1,item[3]?item[3]:0]);
    });
    
    if ($("#opedate-chart").length) {
    
        var ds = new Array();
    
        ds.push({
            data : data1,
            bars : {
                show : true,
                barWidth : 0.2,
                order : 1,
            }
        });
        ds.push({
            data : data2,
            bars : {
                show : true,
                barWidth : 0.2,
                order : 2
            }
        });
        ds.push({
            data : data3,
            bars : {
                show : true,
                barWidth : 0.2,
                order : 3
            }
        });
    
        //Display graph
        $.plot($("#opedate-chart"), ds, {
            colors : [$chrt_second, $chrt_fourth, "#666", "#BBB"],
            grid : {
                show : true,
                hoverable : true,
                clickable : true,
                tickColor : $chrt_border_color,
                borderWidth : 0,
                borderColor : $chrt_border_color,
            },
            legend : false,
            tooltip : true,
            tooltipOpts : {
                content : "<b>%x</b> = <span>%y</span>",
                defaultTheme : false
            }
    
        });
    
        }
    
        /*=============== end bar chart ==============*/
        $("#opedate-mark").empty();
        $("#opedate-mark").append(`<div class="col xs-2 col-sm-2 justify-items-right mb-4"><div style="background-color: #6595b4; width: 50%; height: 20px;"></div></div>
									<div class="col xs-2 col-sm-2"><p>: マンスリー+民泊</p></div>
									<div class="col xs-2 col-sm-2 justify-items-right"><div style="background-color: #7e9d3a; width: 50%; height: 20px;"></div></div>
									<div class="col xs-2 col-sm-2"><p>: マンスリー</p></div>
									<div class="col xs-2 col-sm-2 justify-items-right"><div style="background-color: #333; width: 50%; height: 20px;"></div></div>
									<div class="col xs-2 col-sm-2"><p>: 民泊使用日数</p></div>`);

        /**============== bar chart info ============ */
        $("#opedate-rooms").empty();
        var htmlstr = `<div class="col-xs-3 col-sm-3">`;
        
        for(let i = 0; i < data[1].length; i++){
            if ((i+1) % Math.ceil(data[1].length/4)){
                htmlstr += `<p class="col-xs-6 col-sm-6">${i+1}: ${data[1][i][0]}</p>
                            <p class="col-xs-6 col-sm-6 text-center">
                            <span class="bg-color-blue text-white col-xs-4 col-sm-4 text-center">${data[1][i][1]?data[1][i][1]:0}</span>
                            <span class="bg-color-green text-white col-xs-4 col-sm-4 text-center">${data[1][i][2]?data[1][i][2]:0}</span>
                            <span class="bg-color-grey text-white col-xs-4 col-sm-4 text-center" >${data[1][i][3]?data[1][i][3]:0}</span>
                            </p>`;
            } else {
                htmlstr += `<p class="col-xs-6 col-sm-6">${i+1}: ${data[1][i][0]}</p>
                            <p class="col-xs-6 col-sm-6 text-center">
                                <span class="bg-color-blue text-white col-xs-4 col-sm-4 text-center">${data[1][i][1]?data[1][i][1]:0}</span>
                                <span class="bg-color-green text-white col-xs-4 col-sm-4 text-center">${data[1][i][2]?data[1][i][2]:0}</span>
                                <span class="bg-color-grey text-white col-xs-4 col-sm-4 text-center" >${data[1][i][3]?data[1][i][3]:0}</span>
                            </p></div><div class="col-xs-3 col-sm-3">`;
            }
        }
        htmlstr += `</div>`;
        
        $("#opedate-rooms").append(htmlstr);

}

function draw_opedate_pagination() {
    $("#opedate-chart-title").text(`稼働日数(${sheetList[selSheet-1]})`);
    //============　pagination ===================
    const pagination = $("#opedate_paginate");
    pagination.empty();
    var htmlstr = "";
    htmlstr += "<ul class='pagination pagination-sm'>";
    if (selSheet == 1) {
        htmlstr += `<li class="paginate_button previous disabled" aria-controls="dt_basic" tabindex="0" id="opedate_previous"><span>Previous</span></li>`;
    } else {
        htmlstr += `<li class="paginate_button previous" aria-controls="dt_basic" tabindex="0" id="opedate_previous"><span>Previous</span></li>`;
    }
    if (sheetNum <= 6) {
        for (let i = 1; i <= sheetNum; i++) {
            if (i == selSheet) {
                htmlstr += `<li class="paginate_button active" aria-controls="dt_basic" tabindex="0" data-index="${i}"><span>${sheetList[i-1]}</span></li>`;
            } else {
                htmlstr += `<li class="paginate_button" aria-controls="dt_basic" tabindex="0" data-index="${i}"><span>${sheetList[i-1]}</span></li>`;
            }
        }
    }else{
        if (selSheet <= 3) {
            for (let i = 1; i <= 5; i++) {
                if (i == selSheet) {
                    htmlstr += `<li class="paginate_button active" aria-controls="dt_basic" tabindex="0" data-index="${i}"><span>${sheetList[i-1]}</span></li>`;
                } else {
                    htmlstr += `<li class="paginate_button" aria-controls="dt_basic" tabindex="0" data-index="${i}"><span>${sheetList[i-1]}</span></li>`;
                }
            }
            htmlstr += `<li class="paginate_button disabled"><span>...</span></li>`;
            htmlstr += `<li class="paginate_button" aria-controls="dt_basic" tabindex="0" data-index="${sheetNum}"><span>${sheetNum}</span></li>`;
        } else if (selSheet >= sheetNum - 2) {
            htmlstr += `<li class="paginate_button" aria-controls="dt_basic" tabindex="0" data-index="1"><span>${sheetList[0]}</span></li>`;
            htmlstr += `<li class="paginate_button disabled"><span>...</span></li>`;
            for (let i = sheetNum - 4; i <= sheetNum; i++) {
                if (i == selSheet) {
                    htmlstr += `<li class="paginate_button active" aria-controls="dt_basic" tabindex="0" data-index="${i}"><span>${sheetList[i-1]}</span></li>`;
                } else {
                    htmlstr += `<li class="paginate_button" aria-controls="dt_basic" tabindex="0" data-index="${i}"><span>${sheetList[i-1]}</span></li>`;
                }
            }
        } else {
            htmlstr += `<li class="paginate_button" aria-controls="dt_basic" tabindex="0" data-index="1"><span>${sheetList[0]}</span></li>`;
            htmlstr += `<li class="paginate_button disabled"><span>...</span></li>`;
            for (let i = selSheet - 2; i <= selSheet/1 + 2; i++) {
                console.log(i);
                
                if (i == selSheet) {
                    htmlstr += `<li class="paginate_button active" aria-controls="dt_basic" tabindex="0" data-index="${i}"><span>${sheetList[i-1]}</span></li>`;
                } else {
                    htmlstr += `<li class="paginate_button" aria-controls="dt_basic" tabindex="0" data-index="${i}"><span>${sheetList[i-1]}</span></li>`;
                }
            }
            htmlstr += `<li class="paginate_button disabled"><span>...</span></li>`;
            htmlstr += `<li class="paginate_button" aria-controls="dt_basic" tabindex="0" data-index="${sheetNum}"><span>${sheetList[sheetNum-1]}</span></li>`;
        }
    }
    if (selSheet == sheetNum) {
        htmlstr += `<li class="paginate_button next disabled" aria-controls="dt_basic" tabindex="0" id="dt_basic_next"><span>Next</span></li>`;
    } else {
        htmlstr += `<li class="paginate_button next" aria-controls="dt_basic" tabindex="0" id="dt_basic_next"><span>Next</span></li>`;
    }
    htmlstr += "</ul>";
    pagination.append(htmlstr);

    //================ opedate page info =================
    $("#opedate-info").empty();
    $("#opedate-info").append(`稼働日数 
        <span class="txt-color-darken">(${sheetList[selSheet-1]})</span>
         
        <span class="txt-color-darken">第二${selSheet}</span>
        <span class="txt-color-darken">ページ</span>
        <span class="txt-color-darken">全</span> 
        <span class="text-primary">${sheetNum}個中</span>
        entries`
    );
}

function draw_reservation_calendar() {
    
    const months = [
        { name: "4月", days: 30 },
        { name: "5月", days: 31 },
        { name: "6月", days: 30 },
        { name: "7月", days: 31 },
        { name: "8月", days: 31 },
        { name: "9月", days: 30 },
        { name: "10月", days: 31 },
        { name: "11月", days: 30 },
        { name: "12月", days: 31 },
        { name: "1月", days: 31 },
        { name: "2月", days: 28 }, // Adjust later if leap year
        { name: "3月", days: 31 }
    ];

    // Leap year adjustment for February of next year
    const febYear = calendarYear + 1;
    const isLeap = (febYear % 4 === 0 && febYear % 100 !== 0) || (febYear % 400 === 0);
    if (isLeap) months[10].days = 29;

    const thead = document.getElementById("calendar-thead");
    thead.innerHTML = "";
    const monthRow = document.createElement("tr");
    const dayRow = document.createElement("tr");
    const roomCell = document.createElement("th");
    roomCell.rowSpan = 2;
    roomCell.innerText = "部屋番号";
    monthRow.appendChild(roomCell);
    months.forEach(month => {
        const monthCell = document.createElement("th");
        monthCell.colSpan = month.days;
        monthCell.innerText = month.name;
        monthRow.appendChild(monthCell);

        for (let d = 1; d <= month.days; d++) {
            const dayCell = document.createElement("th");
            dayCell.innerText = d;
            dayRow.appendChild(dayCell);
        }
    });

    thead.appendChild(monthRow);
    thead.appendChild(dayRow);

    const tbody = document.getElementById("calendar-tbody");
    tbody.innerHTML = "";

    console.log(reservation_data);
    var calendarData = [];
    reservation_data.forEach(item=>{
        const index = calendarData.findIndex(data => data[0] == item[5]);
        if (index === -1) {
            calendarData.push([item[5], [[item[3], item[4]]]]);
        } else {
            calendarData[index][1].push([item[3], item[4]]); // Assuming item[1] is the count of reservations
        }
    })
    console.log(calendarData.slice(1));


    calendarData.slice(1).forEach(item => {
        const roomRow = document.createElement("tr");
        const roomCell = document.createElement("td");
        roomCell.innerText = item[0];
        roomRow.appendChild(roomCell);
        const dates = item[1].sort((a,b) => new Date(a[0]) - new Date(b[0]));
        let preDate = new Date("2023-03-31"); // Start date for the calendar
        let reminder = 0;
        for (let i = 0; i < dates.length; i++) {
            let curInDate = new Date(dates[i][0]);
            let curOutDate = new Date(dates[i][1]);
            let status = true;
            if(curInDate < new Date("2023-04-01")){
                if(curOutDate < new Date("2023-04-01")){
                    status = false;
                } else if(curOutDate > new Date("2024-03-31")){
                    curInDate = new Date("2024-03-31");
                    curOutDate = new Date("2024-03-31");
                }
            } else if (curInDate > new Date("2024-03-31")){
                status = false;
            } else {
                if(curOutDate > new Date("2024-03-31")){
                    curOutDate = new Date("2024-03-31");
                }
            }

            if(status){

                if(i > 0){
                    preDate = new Date(item[1][i - 1][1]);
                } 
                if(i == dates.length - 1){
                    reminder = Math.round((new Date("2024-03-31") - curOutDate) / (1000 * 60 * 60 * 24));
                    console.log("reminder:", reminder);
                }
                let preTds = 0; // Previous days to fill before the first reservation
                let tdCol = 1;
                if(preDate >= curInDate){
                    console.log("warning:", item[0]);
                    preTds = 0;
                    const repeat = Math.round((curInDate - preDate) / (1000 * 60 * 60 * 24)); // Include the day of the reservation
                    tdCol = Math.round((curOutDate - preDate) / (1000 * 60 * 60 * 24)); // Include the day of the reservation
                    
                }else{
                    preTds = Math.round((curInDate - preDate) / (1000 * 60 * 60 * 24))-1;
                    tdCol = Math.round((curOutDate - curInDate) / (1000 * 60 * 60 * 24))+1;
                }
                console.log("preTds:", preTds, "tdCol:", tdCol);
                
                for(let i = 0; i < preTds; i++){
                    const calendarCell = document.createElement("td");
                    roomRow.appendChild(calendarCell);
                }
                const calendarCell = document.createElement("td");
                calendarCell.colSpan = tdCol;
                calendarCell.style.backgroundColor = "#7e9d3a";
                calendarCell.title = `${dates[i][0]} - ${dates[i][1]}`; // Assuming ele[0] is the start date and ele[1] is the end date
                roomRow.appendChild(calendarCell);
            }
        
        }
        for(let i = 0; i < reminder; i++){
            const calendarCell = document.createElement("td");
            roomRow.appendChild(calendarCell);
        }
        tbody.appendChild(roomRow);
    });

}

function nationality_chart() {
     // start　initial environment sets
     var pieOptions = {
        //Boolean - Whether we should show a stroke on each segment
        segmentShowStroke: true,
        //String - The colour of each segment stroke
        segmentStrokeColor: "#fff",
        //Number - The width of each segment stroke
        segmentStrokeWidth: 2,
        //Number - Amount of animation steps
        animationSteps: 100,
        //String - types of animation
        animationEasing: "easeOutBounce",
        //Boolean - Whether we animate the rotation of the Doughnut
        animateRotate: true,
        //Boolean - Whether we animate scaling the Doughnut from the centre
        animateScale: false,
        //Boolean - Re-draw chart on page resize
        responsive: true,
        //String - A legend template
        // {% raw %}
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){ %><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span></li><% } %></ul>"
        // {% endraw %}
    };
    
    const colors = {
        "US": "#6595b4", // Blue
        "JP": "#7e9d3a", // Green
        "CN": "#FF9F01", // Orange
        "KR": "#BD362F", // Dark Red
        "AU": "#E24913", // Red
        "SG": "#333", // Grey
        "GB": "#666", // Dark Grey
        "IN": "#999", // Light Grey
        "other": "#DDD" // Default color for others
    }
    // end　initial environment sets
    console.log("reservation_data",reservation_data);
    

    let data = {};
    var nationalAnalysis = {};
    reservation_data.forEach(item => {
        const phoneNumber = String(Number(item[9].replace(/[\s+]/g, "")).toFixed(0)).replace(/[^0-9+]/g, ''); // Clean the phone number
        console.log(phoneNumber);
        if(phoneNumber.length < 10 || phoneNumber.length > 15){
            console.log("Invalid phone number length:", phoneNumber);
            return;
        } else{
            const nationality = phoneNumber? libphonenumber.parsePhoneNumber(String(`+${phoneNumber}`))?.country: "";
            console.log(nationality);
            if(data[nationality]){
                data[nationality].push(item);
            } else {
                data[nationality] = [item];
            }
        }
    });

    console.log("analysisData", data);
    
    for(const key in data){
        nationalAnalysis[key] = data[key].length;
    }
    // data.forEach(item=>{
    //     if (nationalAnalysis[item]) {
    //         nationalAnalysis[item]++;
    //     } else {
    //         nationalAnalysis[item] = 1;
    //     }
    // });

    console.log(nationalAnalysis);
    

    const reservations = reservation_data.length;
    console.log(reservations);
    
    let nationalChartData = [];
    let others = 0;
    for (const key in nationalAnalysis){
    // nationalAnalysis.forEach((value, key) => {
        if(nationalAnalysis[key] >= reservations/20 || key == "US"){
            // nationalChartData[key] = value;
            nationalChartData.push({
                "value": nationalAnalysis[key],
                "color": colors[key] || colors["other"],
                "label": countryCodeToJapanese[key]
            });
        } else {
            others += nationalAnalysis[key];
        }
    }
    nationalChartData.push({
        value: others,
        color: colors["other"],
        label: "その他"
    });

    // render chart
    var ctx = document.getElementById("national-pieChart").getContext("2d");
    var myNewChart = new Chart(ctx).Pie(nationalChartData, pieOptions);
    
    $("#nation-footer").empty();
    var htmlstr = "";
    for (let i = 0; i < nationalChartData.length; i++) {
        if( i % 4 == 0 && i != 0) {
            htmlstr += `</div>`;
            htmlstr += `<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 d-flex">`;
        } else if (i == 0) {
            htmlstr += `<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 d-flex">`;
        } else if( i == nationalChartData.length) {
            htmlstr += `</div>`;
        }
        htmlstr += `<div class="col-xs-3 col-sm-3 col-md-3 col-lg-3 flex-column text-center">
                        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 txt-color-white" style="background-color: ${nationalChartData[i]["color"]};">${nationalChartData[i]["label"]}</div>
                        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        <p>予約数: ${nationalChartData[i]["value"]}</p><p>パーセント: ${Math.round(nationalChartData[i]["value"]/reservations*100)}</p>
                        </div>
                    </div>`;
    }
    $("#nation-footer").append(htmlstr);
    
    // bar graph display
    
    
}

