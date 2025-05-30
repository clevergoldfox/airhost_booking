var reservation_data = JSON.parse(localStorage.getItem('reservationData'))||[];
var activePage = 1;
var pageSize = 10;
var pageCount = Math.ceil(reservation_data.length / pageSize);
function draw_reservationTable(){
    const reservation_table = $("#dt_basic");
    reservation_table.empty();
    var htmlstr = "";
    if (reservation_data && reservation_data.length > 0) {
        
        const startIndex = (activePage - 1) * pageSize;
        const endIndex = startIndex + pageSize/1;
        const headData = reservation_data[0];
        var htmlstr = "<thead><tr><th>No</th>";
        headData.forEach((value, i) => {
            htmlstr += "<th data-hide='phone'>" + value + "</th>";
        });
        htmlstr += "</tr></thead>";
        const tableData = reservation_data.slice(1).slice(startIndex, endIndex);
        console.log(tableData);
        htmlstr += "<tbody>";
        tableData.forEach((item, index) => {
            htmlstr += "<tr>\
            <td>" + (startIndex+ index + 1) + "</td>";
            item.forEach((value, i) => {
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
                <tbody id="reservation_data">
                    <tr >
                        <td> </td>
                    </tr>
                    <!-- Add more rows with similar structure as needed -->
                </tbody>`
    }
    reservation_table.append(htmlstr);
}

function draw_pagination(){
    console.log("pageCount", pageCount);
    console.log("activePage", activePage);
    
    const pagination = $("#dt_basic_paginate");
    pagination.empty();
    var htmlstr = "";
    htmlstr += "<ul class='pagination pagination-sm'>";
    if (activePage == 1) {
        htmlstr += `<li class="paginate_button previous disabled" aria-controls="dt_basic" tabindex="0" id="dt_basic_previous"><span>Previous</span></li>`;
    } else {
        htmlstr += `<li class="paginate_button previous" aria-controls="dt_basic" tabindex="0" id="dt_basic_previous"><span>Previous</span></li>`;
    }
    if (pageCount <= 6) {
        for (let i = 1; i <= pageCount; i++) {
            if (i == activePage) {
                htmlstr += `<li class="paginate_button active" aria-controls="dt_basic" tabindex="0" data-index="${i}"><span>${i}</span></li>`;
            } else {
                htmlstr += `<li class="paginate_button" aria-controls="dt_basic" tabindex="0" data-index="${i}"><span>${i}</span></li>`;
            }
        }
    }else{
        if (activePage <= 3) {
            for (let i = 1; i <= 5; i++) {
                if (i == activePage) {
                    htmlstr += `<li class="paginate_button active" aria-controls="dt_basic" tabindex="0" data-index="${i}"><span>${i}</span></li>`;
                } else {
                    htmlstr += `<li class="paginate_button" aria-controls="dt_basic" tabindex="0" data-index="${i}"><span>${i}</span></li>`;
                }
            }
            htmlstr += `<li class="paginate_button disabled"><span>...</span></li>`;
            htmlstr += `<li class="paginate_button" aria-controls="dt_basic" tabindex="0" data-index="${pageCount}"><span>${pageCount}</span></li>`;
        } else if (activePage >= pageCount - 2) {
            htmlstr += `<li class="paginate_button" aria-controls="dt_basic" tabindex="0" data-index="1"><span>1</span></li>`;
            htmlstr += `<li class="paginate_button disabled"><span>...</span></li>`;
            for (let i = pageCount - 4; i <= pageCount; i++) {
                if (i == activePage) {
                    htmlstr += `<li class="paginate_button active" aria-controls="dt_basic" tabindex="0" data-index="${i}"><span>${i}</span></li>`;
                } else {
                    htmlstr += `<li class="paginate_button" aria-controls="dt_basic" tabindex="0" data-index="${i}"><span>${i}</span></li>`;
                }
            }
        } else {
            htmlstr += `<li class="paginate_button" aria-controls="dt_basic" tabindex="0" data-index="1"><span>1</span></li>`;
            htmlstr += `<li class="paginate_button disabled"><span>...</span></li>`;
            for (let i = activePage - 2; i <= activePage/1 + 2; i++) {
                console.log(i);
                
                if (i == activePage) {
                    htmlstr += `<li class="paginate_button active" aria-controls="dt_basic" tabindex="0" data-index="${i}"><span>${i}</span></li>`;
                } else {
                    htmlstr += `<li class="paginate_button" aria-controls="dt_basic" tabindex="0" data-index="${i}"><span>${i}</span></li>`;
                }
            }
            htmlstr += `<li class="paginate_button disabled"><span>...</span></li>`;
            htmlstr += `<li class="paginate_button" aria-controls="dt_basic" tabindex="0" data-index="${pageCount}"><span>${pageCount}</span></li>`;
        }
    }
    if (activePage == pageCount) {
        htmlstr += `<li class="paginate_button next disabled" aria-controls="dt_basic" tabindex="0" id="dt_basic_next"><span>Next</span></li>`;
    } else {
        htmlstr += `<li class="paginate_button next" aria-controls="dt_basic" tabindex="0" id="dt_basic_next"><span>Next</span></li>`;
    }
    htmlstr += "</ul>";
    pagination.append(htmlstr);
}