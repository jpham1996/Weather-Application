const KEY = "1034fd268f112bf62313ff5b3ab38b61";
const form = document.querySelector("#weather_form");
const inputValue = document.querySelector(".inputValue");
const forecastContainer = document.querySelector("#forecastContainer");
const errorMessage = document.querySelector(".errorMessage");
let weatherCityText = document.querySelector("#weather_city");
let headerTitle = document.querySelector("#headerTitle");

const convertKtoF = function (kelvin) {
  const fahrenheit = (kelvin - 273.15) * 1.8 + 32;
  return Math.floor(fahrenheit);
};

const getCityNameText = function (data) {
  const cityName = data.name;
  headerTitle.innerText = "";
  weatherCityText = "for " + cityName;
  headerTitle.innerText = `Weather Forecast ${weatherCityText}`;
};

const getCurrentPosition = function () {
  if (navigator.geolocation) {
    // Only using success parameter passed as an async function
    navigator.geolocation.getCurrentPosition(async function (pos) {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      // Get Forecast Data from API Call
      await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${KEY}`
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Coordinates not found (${res.status})`);
          }
          return res.json();
        })
        .then((data) => {
          const { lat, lon } = data;

          displayForecast(data);

          // Get City Name from API Call
          return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${KEY}
          `);
        })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Coordinates not found (${res.status})`);
          }
          return res.json();
        })
        .then((data) => {
          getCityNameText(data);
        })
        .catch(() => {
          errorMessage.textContent = "Please search for a valid city";
        });
    });
  }
};

window.addEventListener("load", getCurrentPosition);

const displayForecast = function (data) {
  forecastContainer.innerHTML = "";
  let image;
  data.daily.forEach((value, index) => {
    if (index >= 0 && index < 7) {
      const dayName = new Date(value.dt * 1000)
        .toLocaleDateString("en", {
          weekday: "long",
        })
        .slice(0, 3)
        .toUpperCase();

      if (value.weather[0].main === "Rain") {
        image = "./img/rain.png";
      } else if (value.weather[0].main === "Clouds") {
        image = "./img/cloud.png";
      } else if (value.weather[0].main === "Thunderstorm") {
        image = "./img/thunderstorm.png";
      } else if (value.weather[0].main === "Clear") {
        image = "./img/clear-sky.png";
      } else if (value.weather[0].main === "Drizzle") {
        image = "./img/drizzle.png";
      } else if (value.weather[0].main === "Snow") {
        image = "./img/snow.png";
      } else if (value.weather[0].main === "Mist") {
        image = "./img/mist.png";
      } else if (value.weather[0].main === "Fog") {
        image = "./img/mist.png";
      } else if (value.weather[0].main === "Tornado") {
        image = "./img/tornado.png";
      }

      const currentTemp = value.temp.day;
      const minTemp = value.temp.min;
      const weatherDescription = value.weather[0].description;

      const fday = `<div class="weather_card">
      <div class="day-container">
        ${dayName}
      </div>
    
      <div class=img-container>
        <img class="img-responsive" src="${image}" />
        <p class="weatherDescription">${weatherDescription}</p>
      </div>
      <div class="temperature-container">
        <div class="currentTemp">${convertKtoF(currentTemp)}</div>
        <div class="minTemp">${convertKtoF(minTemp)}</div>
      </div>`;

      forecastContainer.insertAdjacentHTML("beforeend", fday);
    }
  });
};

const fetchCity = async (e) => {
  // Prevents form from submitting
  e.preventDefault();
  // Get City Name from API Call
  const letters = /^[^\d]+$/; // Matches non-numerical numbers [A-Z]
  await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${inputValue.value.match(
      letters
    )}&appid=${KEY}`
  )
    .then((res) => {
      inputValue.value = "";
      if (!res.ok) {
        throw new Error(`City not found (${res.status})`);
      }
      return res.json();
    })
    .then((data) => {
      errorMessage.textContent = "";

      getCityNameText(data);
      const { lat, lon } = data.coord;

      // Get Forecast Data from API Call
      return fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${KEY}`
      );
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Coordinates not found (${res.status})`);
      }
      return res.json();
    })
    .then((data) => {
      displayForecast(data);
    })
    .catch(() => {
      errorMessage.textContent = "Please search for a valid city name";
    });
};

form.addEventListener("submit", fetchCity);
