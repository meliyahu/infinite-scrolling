var pagination = {
    currentPage: 1,
    lastRow: null,
    pageSize: 100
};

let skipValue = 0;
let prevPageNumber;

columnDefs = [
    { headerName: 'Survey ID', field: 'surveyId' },
    { headerName: 'Study Location ID', valueGetter: () => 'TODO' },
    { headerName: 'Sampling Unit ID', valueGetter: () => 'TODO' },
    { headerName: 'FOI', field: 'featureOfInterest' },
    { headerName: 'Ultimate FOI', field: 'ultimateFeatureOfInterest' },
    { headerName: 'Feature Qualifier', field: 'featureQualifier' },
    { headerName: 'Original FOI', field: 'originalFeatureOfInterest' },
    { headerName: 'Protocol', field: 'protocol' },
    { headerName: 'Property', field: 'property', valueFormatter: coalesceFormatter, cellClass: muteZeroLengthCellStyler },
    { headerName: 'Property Qualifier', field: 'propertyQualifier',
      valueFormatter: params => params.value === '' ? '(no qualifier)' : params.value, cellClass: muteZeroLengthCellStyler },
    { headerName: 'Value', field: 'value', valueFormatter: coalesceFormatter, cellClass: muteNaCellStyler },
    { headerName: 'Range Low', field: 'rangeLow', valueFormatter: coalesceFormatter, cellClass: muteNaCellStyler },
    { headerName: 'Range High', field: 'rangeHigh', valueFormatter: coalesceFormatter, cellClass: muteNaCellStyler },
    { headerName: 'Category', field: 'category', valueFormatter: coalesceFormatter, cellClass: muteNaCellStyler },
    { headerName: 'Comment', field: 'comment', valueFormatter: coalesceFormatter, cellClass: muteNaCellStyler },
    { headerName: 'Standard', field: 'standard', valueFormatter: coalesceFormatter, cellClass: muteNaCellStyler },
    { headerName: 'Type', field: 'type', valueFormatter: coalesceFormatter, cellClass: muteNaCellStyler },
  ]


var gridOptions = {
    cacheBlockSize: 100,
    columnDefs: columnDefs,
    enableServerSideSorting: true,
    enableServerSideFilter: true,
    infiniteInitialRowCount: 1,
    onPaginationChanged: onPaginationChanged,
    pagination: true,
    paginationPageSize: pagination.pageSize,
    rowModelType: 'infinite'
};

function onPaginationChanged() {
   
    if (gridOptions.api) {
        
        pagination.currentPage = gridOptions.api.paginationGetCurrentPage() + 1;

        if(gridOptions.api.paginationGetCurrentPage() === 0){
            skipValue = 0 
            prevPageNumber = 1;
        } else {
            let thisPageNum = gridOptions.api.paginationGetCurrentPage() + 1;
            if (thisPageNum >= prevPageNumber){ //we are going forward
                prevPageNumber = thisPageNum;
                skipValue += pagination.pageSize;
            }else { // we are going backward
                prevPageNumber = thisPageNum;
                skipValue = skipValue - pagination.pageSize;
            }
        }
        console.log('skipValue=' + skipValue);
        console.log('limit=' + pagination.pageSize);
        console.log('currentPage=' + pagination.currentPage);
        console.log('----------------')
    }
}

var dataSource = {
    rowCount: pagination.lastRow,
    getRows: function (params) {
        agGrid
            .simpleHttpRequest({
                url: 'http://localhost:1337/organism?' + 'skip=' + skipValue + '&limit=' + pagination.pageSize
            })
            .then(function (newData) {
                var newDataLength = newData.length;
                if (newDataLength === 0 || newDataLength < pagination.pageSize) {
                    pagination.lastRow = (pagination.currentPage - 1) * pagination.pageSize + newDataLength;
                }
                params.successCallback(newData, pagination.lastRow);
            });
    }
};

document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
    gridOptions.api.setDatasource(dataSource);
});

function coalesceFormatter (params) {
    const isNull = params.value === null
    const isUndefined = typeof(params.value) === 'undefined'
    const isZeroLength = !params.value || params.value.length === 0
    if (isNull || isUndefined || isZeroLength) {
      return '-'
    }
    return params.value
  }
  
  function muteNaCellStyler (params) {
    return params.value === 'N/A' ? 'text-muted' : null
  }
  
  function muteZeroLengthCellStyler (params) {
    return !params.value || params.value.length === 0 ? 'text-muted' : null
  }
