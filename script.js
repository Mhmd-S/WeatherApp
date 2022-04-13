function getTime(offset) {
    // Take local time and convert to UTC
    var d = new Date();

    // Convert the offset to hours
    offset = (parseInt(offset)/3600)

    // convert to msec
    // subtract local time zone offset
    // get UTC time in msec
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);

    // create new Date object for different city
    // using supplied offset
    var nd = new Date(utc + (3600000*offset));

    // returns a language sensitive represntation of the time
    nd = nd.toLocaleTimeString(); 

    // regex pattern for hours:mins (00:00);
    const re = /[0-9]{1,2}:[0-9]{2}/;

    // return hour and minutes only using regex and the pm or am using []
    const time = nd.match(re) + " " + nd[nd.length-2] + nd[nd.length-1];

    return time
}

async function getIcon(iconCode) {
    // Using the URL below we insert the code inside it and it returns the icon;
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

    // Fetch the icon url
    const iconResponce = await fetch(iconUrl);

    // If all goes well blob the image and create a url for it
    // blolb stands for binary large object
    if (iconResponce.status === 200) {
            
        const imageBlob = await iconResponce.blob().then(blobedImage => {return URL.createObjectURL(blobedImage)});
        return imageBlob;
    
    }
    else {
        console.log("HTTP-Error: " + response.status)
    }
}
 
async function getLocation(location) {
    // async function takes that parameter and uses an api to get the coordinates of a location.

    //  Geocoding API URL
    const geoLocationApi = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=3992b263f58f2bfebefbec5ee3a35bfc`

    // Fetching the location Coordinate from the API
   const locationCo = await fetch(geoLocationApi);

    // Changing the json object to a js object
    const locationCoString = await locationCo.json();

    if (locationCoString == "") {
        displayInvalidInput('add');
        return
    } else {
        displayInvalidInput('remove')
    }

    // Extract the the latitude from the object
    const latitude = locationCoString[0].lat;
    // Extract the longitude from the object
    const longitude = locationCoString[0].lon;

    getWeatherData(longitude, latitude, 'c');
}


async function getWeatherData(lon, lat, mode) {
    // async function that takes the coordinates and find the weather data using an api

    // Weather API URL
    const geoWeatherApi = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=3992b263f58f2bfebefbec5ee3a35bfc`;

    // fetching the weather data from the api
    const wData = await fetch(geoWeatherApi);

    // Turns the json object to js object
    const wObj = await wData.json();

    let tempCurrent;
    // The api returns the temp as in Kelvin, here we convert it to celsius or fahrenheit.
    if (mode == 'f'){ //Convert to Celsius
        tempCurrent = parseInt(wObj.main.temp * 9/5 +32)
    } else {
        tempCurrent = Math.round(wObj.main.temp);
    }

    // Inserts the object inside the getTime function to extract the time.
    const time = getTime(wObj.timezone)

    // extract wind data
    const wind = parseInt(wObj.wind.speed);

    // Extract the humidity
    const humidity = wObj.main.humidity;

    // Exract the 'feels like' temp
    const flTemp = parseInt(wObj.main.feels_like);

    // icon for current weather
    const weatherIcon = await getIcon(wObj.weather[0].icon);

    // Extract description of the weather
    const descWeather  = wObj.weather[0].description;  

    // Extract lowest and highest temp
    const highestTemp = parseInt(wObj.main.temp_max);
    const lowestTemp = parseInt(wObj.main.temp_min);

    // Extract city name
    const cityName = wObj.name;

    displayInfo([tempCurrent, time, wind, humidity, flTemp, descWeather, weatherIcon, highestTemp, lowestTemp, cityName]);
}

// ******************** DOM FUNCTIONS *********************

async function getInput(e) {
    e.preventDefault();
    const locationInput = document.getElementById('location-input').value;
    getLocation(locationInput);
}

function displayInfo(weatherInfo){
    // All the displays 
    console.log(weatherInfo)
    const cityName = document.getElementById('city-name');
    cityName.textContent = weatherInfo[9];

    const currentTime = document.querySelector('.current-time');
    currentTime.textContent = weatherInfo[1];
    currentTime.dateTime = weatherInfo[1];

    const weatherIcon = document.getElementById('weatherIcon');
    weatherIcon.src = weatherInfo[6]

    const mainTemp = document.querySelector('.current-temp-info');
    mainTemp.textContent = `${weatherInfo[0]} °C`;

    const weatherDesc = document.querySelector('.current-temp-desc');
    weatherDesc.textContent = weatherInfo[5];

    const hTemp = document.querySelector('.highest-temp');
    hTemp.textContent = `H: ${weatherInfo[7]}`;

    const lTemp = document.querySelector('.lowest-temp');
    lTemp.textContent = `L: ${weatherInfo[8]}`;

    const feelTemp = document.getElementById('feelTemp');
    feelTemp.textContent = `${weatherInfo[4]} °C`;

    const windInfo = document.getElementById('wind');
    windInfo.textContent = `${weatherInfo[2]} km/h`;

    const humidityInfo = document.getElementById('humidity');
    humidityInfo.textContent = `${weatherInfo[3]}%`;
}

function displayInvalidInput(mode){
    const searchBar = document.getElementById('location-input');
    if (mode === 'add'){
        searchBar.classList.add('invalidInput');
        searchBar.value = '';
        searchBar.placeholder = 'Invalid Input';
    }else {
        searchBar.classList.remove('invalidInput');
        searchBar.value = '';
        searchBar.placeholder = 'City Name';
    }
}


// IIFE to add event lister to the button
(() => {
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', (e)=> {getInput(e)});
  })();
  