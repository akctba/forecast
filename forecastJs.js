$(document).ready(function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(weatherPosition);
    } else {
        //browser doesn't support geolocation
        loadWeatherByLocation(6173331); // Vancouver BC, Canada
    }

    //loadWeatherByLocation(6173331); // Vancouver BC, Canada
    //loadWeatherByLocation(2643743); // London, UK
});

const celsius = '&#8451;';

function weatherPosition(position) {
    //console.log(position);
    // console.log("Latitude: " + position.coords.latitude);
    // console.log("Longitude: " + position.coords.longitude);
    const url = "https://api.openweathermap.org/data/2.5/weather?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&appid=420432ebcd0b1d4e01e32dc8bcd4b99d&units=metric";

    loadWeather(url);
}

// -----------------
// CURRENT WEATHER FETCH
// -----------------
function loadWeatherByLocation(location) {
    const url = "https://api.openweathermap.org/data/2.5/weather?id=" + location + "&appid=420432ebcd0b1d4e01e32dc8bcd4b99d&units=metric";
    loadWeather(url);
}

function loadWeather(endpoint) {
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetch(endpoint, requestOptions)
        .then((response) => {
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code:' + response.status);
                return;
            }

            response.json().then(function (data) {
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
                        prev += `<li class='list-inline-item'>${element.main}<img src="https://openweathermap.org/img/wn/${element.icon}.png" alt="${element.description}"></li>`;
                        $('#weather').html(prev);
                    });

                    $('#sunrise').html(parseTime(data.sys.sunrise, data.timezone));
                    $('#sunset').html(parseTime(data.sys.sunset, data.timezone));

                    //load the forecast
                    forecast(data.id);

                })
                .catch(function (error) {
                    console.error('this is a error ' + error);
                });
        })
        //.then(result => console.log(result))
        .catch(error => console.error('error', error));
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

function parseTime(timestamp, timezone) {
    let local = new Date();
    //console.log(local.getTimezoneOffset()*60);
    //console.log('>>> Timezone: ' + timezone);

    //var adjTimestamp = (timestamp * 1000) - timezone - (local.getTimezoneOffset()/60);
    var adjTimestamp = timestamp * 1000 + timezone * 1000;
    //console.log('Adjusted time: ' + adjTimestamp);

    var date = new Date(adjTimestamp);
    // Hours part from the timestamp
    var hours = date.getUTCHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getUTCMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getUTCSeconds();

    // Will display time in HH:MM:SS format
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime;
}



function reloadCity(cityCode) {
    //console.log(`Reload city ${cityCode}`);
    $('#modalCities').modal('hide');
    loadWeatherByLocation(cityCode);
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
            cities = $.grep(json, function (element, index) {
                var rx = new RegExp(cty, "ig");
                return element.name.search(rx) >= 0;
            });

            // console.log('Selected cities: ');
            // console.log(cities);

            // put the results in the modal window
            if (cities.length <= 0) {
                let i = $('<p></p>');
                i.text(`No city found to ${cty}`);
                $('#listcities').append(i);
            } else {
                cities.forEach(ct => {
                    //console.log(ct);
                    let i = $('<button type="button" class="list-group-item list-group-item-action">');
                    i.text(countryCodeEmoji(ct.country) + " - " + ct.name);
                    i.attr("onclick", `reloadCity(${ct.id})`);
                    $('#listcities').append(i);
                });
            }
        });
});

$('#cityToSearch').keydown(function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("buttonSearch").click();
    }
});

// -----------------
// FORECAST
// -----------------

function forecast(cityId) {
    $("#forecast").html('');

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    const endpoint = `https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&appid=420432ebcd0b1d4e01e32dc8bcd4b99d&units=metric`

    fetch(endpoint, requestOptions)
        .then((response) => {
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code:' + response.status);
                return;
            }

            response.json().then(function (data) {
                //console.log(data.list);
                let numberOf = 4;

                let row = $("<div class='row'></div>");
                for(let i=0; i < numberOf; i++) {
                    let col = $("<div class='col'></div>");

                    //icon
                    col.append($(`<div><img src="https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png" alt="${data.list[i].weather[0].description}">`));
                    //time
                    col.append($("<div class='text-info'></div>").text(parseTime(data.list[i].dt, data.city.timezone)));
                    //description
                    col.append($("<div></div>").text(data.list[i].weather[0].description));

                    row.append(col);

                }
                $("#forecast").append(row);

            })
            .catch(function (error) {
                console.log('this is a error ' + error);
            });
        })
        //.then(result => console.log(result))
        .catch(error => console.log('error', error));
}

