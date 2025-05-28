var sheetNum = 1;
var selSheet = 1;
var sheetList = [];

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
        $("#opedate-mark").append(`<div class="col xs-2 col-sm-2 justify-items-right"><div style="background-color: #6595b4; width: 50%; height: 20px;"></div></div>
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
                htmlstr += `<p>${i+1}: ${data[1][i][0]}
                                <span class="bg-color-blue text-white px-7px mx-5px">${data[1][i][1]?data[1][i][1]:0}</span>
                                <span class="bg-color-green text-white px-7px mx-5px">${data[1][i][2]?data[1][i][2]:0}</span>
                                <span class="bg-color-grey text-white px-7px mx-5px" >${data[1][i][3]?data[1][i][3]:0}</span>
                            </p>`;
            } else {
                htmlstr += `<p>${i+1}: ${data[1][i][0]}
                                <span class="bg-color-blue text-white px-7px mx-5px">${data[1][i][1]?data[1][i][1]:0}</span>
                                <span class="bg-color-green text-white px-7px mx-5px">${data[1][i][2]?data[1][i][2]:0}</span>
                                <span class="bg-color-grey text-white px-7px mx-5px" >${data[1][i][3]?data[1][i][3]:0}</span>
                            </p></div><div class="col-xs-3 col-sm-3">`;
            }
        }
        htmlstr += `</div>`;
        
        $("#opedate-rooms").append(htmlstr);

}

function draw_opedate_pagination() {
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

    $("#opedate-info").empty();
    console.log("opedate");
    $("#opedate-info").append(`Showing 
        <span class="txt-color-darken">${sheetList[selSheet-1]}</span>
         to 
        <span class="txt-color-darken">${sheetNum}</span>
         of 
        <span class="text-primary">${selSheet}</span>
        entries`
    );
    console.log("opedate--");
    

}