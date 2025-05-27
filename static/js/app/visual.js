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
    var chartData = [];
    for (const key in data) {
        chartData.push([key, data[key]])
    }
    console.log(chartData[0][1]);
    
    var data1 = [];
    var data2 = [];
    var data3 = [];
    await chartData[0][1].forEach((item, index) => {
            data1.push([index,item[1]?item[1]:0]);
            data2.push([index,item[2]?item[2]:0]);
            data3.push([index,item[3]?item[3]:0]);
    });
    console.log(data1);
    console.log(data2);
    console.log(data3);
    
    /* bar chart */
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
    
        /* end bar chart */
}