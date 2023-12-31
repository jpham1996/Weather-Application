// Import API Key
import WEATHER_API_KEY from "./apikey.js";

// DOM Selectors
const form = document.querySelector("#weather_form");
const inputValue = document.querySelector(".inputValue");
const forecastContainer = document.querySelector("#forecastContainer");
const errorMessage = document.querySelector(".errorMessage");
let weatherCityText = document.querySelector("#weather_city");
let headerTitle = document.querySelector("#headerTitle");

// Convert from Kelvin to Fahrenheit
const convertKtoF = function (kelvin) {
  const fahrenheit = (kelvin - 273.15) * 1.8 + 32;
  return Math.floor(fahrenheit);
};

// Get City Name Text
const getCityNameText = function (data) {
  const cityName = data.name;
  headerTitle.innerText = "";
  weatherCityText = "for " + cityName;
  headerTitle.innerText = `Weather Forecast ${weatherCityText}`;
};

// Get current position from the Geolocation Object
const getCurrentPosition = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async function (pos) {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      // Get Forecast Data from API Call
      await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${WEATHER_API_KEY}`
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

          // Fetch City Name from lat, lon, and API Key
          return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}
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
          errorMessage.innerText = "Please search for a valid city";
        });
    });
  }
};

// Display 7 Day Forecast
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

// Searches for city name, and retrives city's lat and lon to display 7 Day Forecast
const fetchCity = async (e) => {
  e.preventDefault();
  // Matches non-numerical numbers [A-Z]
  const letters = /^[^\d]+$/;
  await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${inputValue.value.match(
      letters
    )}&appid=${WEATHER_API_KEY}`
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

      // Fetches lat, and lon from previous API call, and API Key
      return fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${WEATHER_API_KEY}`
      );
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Coordinates not found (${res.status})`);
      }
      return res.json();
    })
    .then((data) => {
      console.log(data);
      displayForecast(data);
    })
    .catch(() => {
      errorMessage.innerText = "Please search for a valid city name";
    });
};

window.addEventListener("load", getCurrentPosition);
form.addEventListener("submit", fetchCity);
