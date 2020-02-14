$(document).ready(function(){
    loadWeather(6173331); // Vancouver BC, Canada
});

// -----------------
// WEATHER FETCH
// -----------------
function loadWeather(location) {
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    const url = "https://api.openweathermap.org/data/2.5/weather?id="+location+"&appid=420432ebcd0b1d4e01e32dc8bcd4b99d&units=metric";
    const celsius = '&#8451;';

    fetch(url, requestOptions)
        .then((response) => {
            if(response.status !== 200) {
                console.log('Looks like there was a problem. Status Code:' + response.status);
                return;
            }

            response.json().then(function(data){
                //console.log(data);
                //$('#output').html(JSON.stringify(data));

                $('#cityName').html(data.name + " " + countryCodeEmoji(data.sys.country));
                //$('#country').html(countryCodeEmoji(data.sys.country));
                $('#temp').html(data.main.temp + celsius);
                $('#min').html(data.main.temp_min + celsius);
                $('#max').html(data.main.temp_max + celsius);
                $('#feelslike').html(data.main.feels_like + celsius);
                $('#pressure').html(data.main.pressure);
                $('#humidity').html(data.main.humidity);

                data.weather.forEach(element => {
                    let prev = $('#weather').html();
                    prev += `<li class='list-inline-item'>${element.main}<img src="http://openweathermap.org/img/wn/${element.icon}.png" alt="${element.description}"></li>`;
                    $('#weather').html(prev);
                });

                $('#sunrise').html(parseTime(data.sys.sunrise));
                $('#sunset').html(parseTime(data.sys.sunset));

            })
            .catch(function(error){
                console.log('this is a error ' +  error);
            });
        })
        //.then(result => console.log(result))
        .catch(error => console.log('error', error));
}


// -----------------
// FLAGS
// -----------------

// country code regex
const CC_REGEX = /^[a-z]{2}$/i;

// offset between uppercase ascii and regional indicator symbols
const OFFSET = 127397;

/**
 * convert country code to corresponding emoji flag
 * @param {string} cc - country code string
 * @returns {string} country code emoji
 */
function countryCodeEmoji(cc) {
  if (!CC_REGEX.test(cc)) {
    const type = typeof cc;
    throw new TypeError(
      `cc argument must be an ISO 3166-1 alpha-2 string, but got '${
        type === 'string' ? cc : type
      }' instead.`,
    );
  }

  const chars = [...cc.toUpperCase()].map(c => c.charCodeAt() + OFFSET);
  return String.fromCodePoint(...chars);
}

// -----------------
// FORMATS THE TIME
// -----------------

function parseTime(timestamp) {
    var date = new Date(timestamp * 1000);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();

    // Will display time in HH:MM:SS format
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime;
}

function reloadCity(cityCode) {
    $('#modalCities').modal('hide');
    loadWeather(cityCode);
    $('#cityToSearch').val('');
}

// -----------------
// SEARCH CITIES
// -----------------
$('#modalCities').on('shown.bs.modal', function () {
    //clear previous results in the modal window
    $('#listcities').html('');

    let cty = $('#cityToSearch').val();
    cty = cty.trim();
    //console.log('vai buscar ' + cty);

    //search cities in the JSON file
    var cities = [];
    fetch("city.list.json")
        .then(response => response.json())
        .then(json => {
            //console.log(json)
            cities = $.grep(json, function(element, index) {
                var rx = new RegExp(cty, "ig");
                // console.log(index + '>> ' + cty + '>>> ' + element.name);
                // console.log(element.name.match(`/${cty}gi`));
                // console.log(element.name.match('/'+cty+'/gi'));
                // console.log(element.name === cty);
                // console.log(element.name == cty);
                // console.log(element.name.match(reg));
                // console.log(element.name.includes(cty));
                // console.log(/cty/i.test(element.name));
                // console.log(index + '>> ' + (element.name.search(rx) > 0));
                return element.name.search(rx) >= 0;
            });

            // console.log('Selected cities: ');
            // console.log(cities);
    
            // put the results in the modal window
            cities.forEach(ct => {
                //console.log(ct);
                let i = $('<button type="button" class="list-group-item list-group-item-action">');
                i.text(countryCodeEmoji(ct.country) + " - " + ct.name);
                i.attr("onclick", `reloadCity(${ct.id})`);
                $('#listcities').append(i);
            });
        });
});

$('#cityToSearch').keydown(function (event) { 
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("buttonSearch").click();
    }
});

