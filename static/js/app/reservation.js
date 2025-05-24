var reservation_data = null;
var activePage = 1;
var pageSize = 10;
var pageCount = 1;
function draw_reservationTable(){
    const reservation_table = $("#reservation_data");
    reservation_table.empty();
    console.log(activePage, pageSize);
    
    const startIndex = (activePage - 1) * pageSize;
    const endIndex = startIndex + pageSize/1;
    console.log(startIndex, endIndex);
    
    const tableData = reservation_data.slice(startIndex, endIndex);
    console.log(tableData);
    
    var htmlstr = "";
    tableData.forEach((item, index) => {
        htmlstr += "<tr>\
        <td>" + (startIndex+ index + 1) + "</td>";
        item.forEach((value, i) => {
            htmlstr += "<td>" + value + "</td>"
        });
        htmlstr += "</tr>";
    });
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