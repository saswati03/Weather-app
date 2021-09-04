
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezone = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');


const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


// const API_KEY ='49cc8c821cd2aff9af04c9f98c36eb74';
const API_KEY ='57c3031e510d8db2e999880770e9e45a';





//get latitude and longitude from google places autocomplete library

let coordinates = [25,85];

let autocomplete;
function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'),
    {
        types: ['geocode'],
        fields: ['place_id', 'geometry', 'name']
    });

    autocomplete.addListener('place_changed', onPlaceChanged);
    
}



function onPlaceChanged() {
    var place = autocomplete.getPlace();

    if(!place.geometry) {
        document.getElementById('autocomplete').placeholder = 'Enter a place';
    } else {
        document.getElementById('placeName').innerHTML = place.name;
        coordinates[0] = place.geometry.location.lat();
        coordinates[1] = place.geometry.location.lng();

        console.log(coordinates[0]);
        console.log(coordinates[1]);
        

        //get local time from timezonedb api

        

        if(coordinates) {
            fetch(`http://api.timezonedb.com/v2.1/get-time-zone?key=WLA9XBFU2IT5&format=json&by=position&lat=${coordinates[0]}&lng=${coordinates[1]}`).then(res => res.json()).then(data => {
                if(data.status=="OK") {
                    myStopFunction();
                    console.log(data.formatted);
                  
                    const dateTime = data.formatted;
                    let year = dateTime.split(" ")[0].split("-")[0];
                    let month = dateTime.split(" ")[0].split("-")[1];
                    let date = dateTime.split(" ")[0].split("-")[2];

                    let hour = dateTime.split(" ")[1].split(":")[0];
                    let minutes = dateTime.split(" ")[1].split(":")[1];
                    let seconds = dateTime.split(" ")[1].split(":")[2];

                    let localTime = new Date(year, month-1, date, hour, minutes, seconds);
                    
                    // console.log(localTime);
                    myStartFunction(localTime);

                } else {
                    console.log("Error fetching current local time");
                }
                
            })
                     fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coordinates[0]}&lon=${coordinates[1]}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`).then(res => res.json()).then(data => {
                        showWeatherData(data);
                     })
                 }
        }
    
}






var myVar;

function myStartFunction(dateTimeInJS) {
        myVar = setInterval(timerFunc, 1000, dateTimeInJS);
}

function myStopFunction() {
    clearInterval(myVar);
}

function timerFunc(dateTimeInJS) {


    const month = dateTimeInJS.getMonth();
    const date = dateTimeInJS.getDate();
    const day = dateTimeInJS.getDay();
    const hour = dateTimeInJS.getHours();
    const hoursIn12HrFormat = hour >= 13 ? hour %12: hour
    const minutes = dateTimeInJS.getMinutes();
    const seconds = dateTimeInJS.getSeconds();
    const ampm = hour >=12 ? 'PM' : 'AM'  
    console.log(minutes);

    document.getElementById('time').innerHTML = (hoursIn12HrFormat < 10? '0'+hoursIn12HrFormat : hoursIn12HrFormat) + ':' + (minutes < 10? '0'+minutes: minutes) + `<span id="am-pm">${ampm}</span>`

    dateEl.innerHTML = days[day] + ', ' + date+ ' ' + months[month]

    dateTimeInJS.setSeconds(dateTimeInJS.getSeconds() + 1);

  
}




function showWeatherData (data){
    let {humidity, pressure, sunrise, sunset, wind_speed} = data.current;


    currentWeatherItemsEl.innerHTML = 
    `<div class="weather-item">
        <div>Humidity</div>
        <div>${humidity}%</div>
    </div>
    <div class="weather-item">
        <div>Pressure</div>
        <div>${pressure}</div>
    </div>
    <div class="weather-item">
        <div>Wind Speed</div>
        <div>${wind_speed}</div>
    </div>
    <div class="weather-item">
        <div>Sunrise</div>
        <div>${window.moment(sunrise * 1000).format('HH:mm a')}</div>
    </div>
    <div class="weather-item">
        <div>Sunset</div>
        <div>${window.moment(sunset*1000).format('HH:mm a')}</div>
    </div>
    
    
    `;

    let otherDayForcast = ''
    data.daily.forEach((day, idx) => {
        if(idx == 0){
            currentTempEl.innerHTML = `
            <img src="http://openweathermap.org/img/wn//${day.weather[0].icon}@4x.png" alt="weather icon" class="w-icon">
            <div class="other">
                <div class="day">${window.moment(day.dt*1000).format('dddd')}</div>
                <div class="temp">Night - ${day.temp.night}&#176;C</div>
                <div class="temp">Day - ${day.temp.day}&#176;C</div>
            </div>
            
            `
        }else{
            otherDayForcast += `
            <div class="weather-forecast-item">
                <div class="day">${window.moment(day.dt*1000).format('ddd')}</div>
                <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                <div class="temp">Night - ${day.temp.night}&#176;C</div>
                <div class="temp">Day - ${day.temp.day}&#176;C</div>
            </div>
            
            `
        }
    })

 


    weatherForecastEl.innerHTML = otherDayForcast;
    
}