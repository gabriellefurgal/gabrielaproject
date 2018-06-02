changeToForm = function () {
    document.getElementById('placeInformationSection').style.display = 'none';
    document.getElementById('placeInformationForm').style.display = 'block';

};
$('#<%=adm.name %>').on('hidden.bs.collapse', function () {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", '/sortByCountry?v=<%=adm.name %>', false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
})


