var cost_pre_data = JSON.parse(localStorage.getItem('costData'))||[];
var cost_data = JSON.parse(cost_pre_data.replace(/\bNaN\b/g, 'null'));
console.log(cost_data);


function draw_costTable(){
    const cost_table = $("#dt_basic");
    cost_table.empty();
    var htmlstr = "";
    if (cost_data && cost_data.length > 0) {
        const headData = cost_data[0];
        
        var htmlstr = "<thead><tr>";
        headData.slice(1).forEach((value, i) => {
            if(value.indexOf("Unnamed")>=0){
                value = " "
            }
            htmlstr += "<th data-hide='phone'>" + value.replace(".1", "") + "</th>";
        });
        htmlstr += "</tr></thead>";
        const tableData = cost_data.slice(1);
        
        htmlstr += "<tbody id='cost_data'>";
        tableData.forEach((item, index) => {
            htmlstr += "<tr>";
            item.slice(1).forEach((value, i) => {
                value = value? value: "-";
                htmlstr += "<td>" + value + "</td>"
            });
            htmlstr += "</tr>";
        });
        htmlstr += "</tbody>";
    } else {
        htmlstr = `<thead>
                    <tr>
                        <th class="nodatathead" style="font-weight: 600; width: 100%; text-align: center;">資料を追加してください。</th>
                        <!-- <th data-class="expand"><i
                                class="fa fa-fw fa-user text-muted hidden-md hidden-sm hidden-xs"></i>
                            Name</th>
                        <th data-hide="phone"><i
                                class="fa fa-fw fa-phone text-muted hidden-md hidden-sm hidden-xs"></i>
                            Phone</th>
                        <th>Company</th>
                        <th data-hide="phone,tablet"><i
                                class="fa fa-fw fa-map-marker txt-color-blue hidden-md hidden-sm hidden-xs"></i>
                            Zip</th>
                        <th data-hide="phone,tablet">City</th>
                        <th data-hide="phone,tablet"><i
                                class="fa fa-fw fa-calendar txt-color-blue hidden-md hidden-sm hidden-xs"></i>
                            Date</th> -->
                    </tr>
                </thead>
                <tbody id="cost_data">
                    <tr >
                        <td> </td>
                    </tr>
                    <!-- Add more rows with similar structure as needed -->
                </tbody>`
    }
    cost_table.append(htmlstr);
    $(".dt-toolbar").empty();
    $(".dt-toolbar").append(`<button onclick="add_modal_show()" class="btn btn-success btn-labeled" href="javascript:void(0);" style="padding-left: 12px!important; padding-right: 12px!important; float:right;"> <span class="btn-label"><i class="fa fa-plus-circle"></i></span>追加</button>`);
    $(".dt-toolbar-footer").remove();
}

function add_modal_show() {
    let pre_cost = {};
    cost_data.slice(1).forEach((item, index) => {
        for (let i = item.length - 5; i >= 0; i--) {
            if (item[i] !== null) {
                pre_cost[item[1]] = item[i];
                break;
            }
        }
    });
    console.log(pre_cost);
    
    let htmlstr = "";
    htmlstr += `<fieldset>
    <legend>
    客室価格変更  ${getFormattedNow()}
    </legend>`;
    for(key in pre_cost){
        htmlstr += `<div class="form-group">
        <label class="col-xs-2 col-lg-3 control-label">${key}</label>
        <div class="col-xs-9 col-lg-6 inputGroupContainer">
        <div class="input-group">
        <input type="number" class="form-control" name="${key.replace(/[\u3040-\u30FF\u4E00-\u9FFF()（）]/g, '')}" value="${pre_cost[key]}" required/>
        <span class="input-group-addon">¥</span>
        </div>
        </div>
        </div>`;
    }
    htmlstr += `</fieldset>
    <div class="form-actions">
    <div class="row">
    <div class="col-md-12">
    <button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-reply"></i>  戻る</button>
    <button class="btn btn-info" type="submit"><i class="fa fa-check"></i>  変更</button>
    </div>
    </div>
    </div>`;
    $("#changeCostForm").empty();
    $("#changeCostForm").append(htmlstr);
    $("#costRegModal").modal("show");
}


function getFormattedNow() {
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}
