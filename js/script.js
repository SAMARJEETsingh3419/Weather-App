const container = document.querySelector('.container');
const search = document.querySelector('.search-box button');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.not-found');
const searchInput = document.querySelector('.search-box input');
const unitButtons = document.querySelectorAll('.unit-btn');

let currentUnit = 'celsius';
let currentWeatherData = null;

console.log('Script loaded');
console.log('Search button:', search);
console.log('Search input:', searchInput);

// Temperature conversion functions
const celsiusToFahrenheit = (celsius) => (celsius * 9/5) + 32;
const fahrenheitToCelsius = (fahrenheit) => (fahrenheit - 32) * 5/9;

// Format temperature based on current unit
const formatTemperature = (temp) => {
    const temperature = currentUnit === 'celsius' ? temp : celsiusToFahrenheit(temp);
    return `${Math.round(temperature)}°${currentUnit === 'celsius' ? 'C' : 'F'}`;
};

// Format day from timestamp
const formatDay = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
};

// Update weather display
const updateWeatherDisplay = () => {
    if (!currentWeatherData) return;

    const temperature = document.querySelector('.weather-box .temperature');
    const feelsLike = document.querySelector('.feels-like span');
    const forecast = document.querySelectorAll('.forecast-item .temp');

    temperature.innerHTML = formatTemperature(currentWeatherData.main.temp);
    feelsLike.innerHTML = formatTemperature(currentWeatherData.main.feels_like);
    
    forecast.forEach((item, index) => {
        if (currentWeatherData.forecast && currentWeatherData.forecast[index]) {
            item.innerHTML = formatTemperature(currentWeatherData.forecast[index].temp.day);
        }
    });
};

// Unit toggle event listeners
unitButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (button.dataset.unit === currentUnit) return;
        
        currentUnit = button.dataset.unit;
        unitButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        updateWeatherDisplay();
    });
});

// Function to handle the enter key press
searchInput.addEventListener('keypress', function(event) {
    console.log('Key pressed:', event.key);
    if (event.key === 'Enter') {
        search.click();
    }
});

search.addEventListener('click', () => {
    console.log('Search button clicked');
    
    const APIKey = '5c68afc4ba8053ed8f0edbcbb8a0beb6';
    const city = document.querySelector('.search-box input').value;
    console.log('City entered:', city);

    if (city === '') {
        console.log('No city entered');
        return;
    }

    // Add loading animation
    search.classList.add('loading');
    console.log('Making API request for:', city);

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}`)
        .then(response => {
            console.log('API Response:', response);
            return response.json();
        })
        .then(json => {
            console.log('Weather data:', json);
            // Remove loading animation
            search.classList.remove('loading');

            if (json.cod === '404') {
                console.log('City not found');
                container.style.height = '400px';
                weatherBox.style.display = 'none';
                weatherDetails.style.display = 'none';
                error404.style.display = 'block';
                error404.classList.add('fadeIn');
                return;
            }

            error404.style.display = 'none';
            error404.classList.remove('fadeIn');
            weatherBox.style.display = '';
            weatherDetails.style.display = '';

            currentWeatherData = json;

            // Fetch 5-day forecast using the correct endpoint
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${APIKey}`);
        })
        .then(response => response.json())
        .then(forecastData => {
            if (forecastData.cod !== '404') {
                // Process forecast data to get daily forecasts
                const dailyForecasts = {};
                
                forecastData.list.forEach(forecast => {
                    const date = new Date(forecast.dt * 1000).toLocaleDateString();
                    if (!dailyForecasts[date]) {
                        dailyForecasts[date] = {
                            date: forecast.dt,
                            temp: forecast.main.temp,
                            weather: forecast.weather[0],
                            humidity: forecast.main.humidity,
                            wind: forecast.wind.speed
                        };
                    }
                });

                // Convert to array and get next 5 days
                currentWeatherData.forecast = Object.values(dailyForecasts).slice(1, 6);
                
                error404.style.display = 'none';
                error404.classList.remove('fadeIn');

                weatherBox.style.display = '';
                weatherDetails.style.display = '';
                weatherBox.classList.add('fadeIn');
                weatherDetails.classList.add('fadeIn');
                container.style.height = 'auto';

                // Update weather icon
                const image = document.querySelector('.weather-box img');
                image.src = `https://openweathermap.org/img/wn/${currentWeatherData.weather[0].icon}@4x.png`;

                // Update current weather details
                const temperature = document.querySelector('.weather-box .temperature');
                const description = document.querySelector('.weather-box .description');
                const humidity = document.querySelector('.humidity span');
                const wind = document.querySelector('.wind span');
                const location = document.querySelector('.location span');
                const feelsLike = document.querySelector('.feels-like span');
                const pressure = document.querySelector('.pressure span');

                temperature.innerHTML = formatTemperature(currentWeatherData.main.temp);
                description.innerHTML = `${currentWeatherData.weather[0].description}`;
                humidity.innerHTML = `${currentWeatherData.main.humidity}%`;
                wind.innerHTML = `${parseInt(currentWeatherData.wind.speed)} Km/h`;
                location.innerHTML = `${currentWeatherData.name}, ${currentWeatherData.sys.country}`;
                feelsLike.innerHTML = formatTemperature(currentWeatherData.main.feels_like);
                pressure.innerHTML = `${currentWeatherData.main.pressure} hPa`;

                // Update forecast
                const forecastContainer = document.querySelector('.forecast-container');
                forecastContainer.innerHTML = '';

                currentWeatherData.forecast.forEach(forecast => {
                    const forecastItem = document.createElement('div');
                    forecastItem.className = 'forecast-item';
                    
                    const date = new Date(forecast.date * 1000);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayDate = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                    
                    forecastItem.innerHTML = `
                        <div class="day">${dayName}</div>
                        <div class="date">${dayDate}</div>
                        <img src="https://openweathermap.org/img/wn/${forecast.weather.icon}@2x.png" alt="${forecast.weather.description}">
                        <div class="temp">${formatTemperature(forecast.temp)}</div>
                        <div class="forecast-details">
                            <span><i class="fa-solid fa-water"></i> ${forecast.humidity}%</span>
                            <span><i class="fa-solid fa-wind"></i> ${parseInt(forecast.wind)} km/h</span>
                        </div>
                    `;
                    forecastContainer.appendChild(forecastItem);
                });
            }
        })
        .catch(() => {
            container.style.height = '400px';
            weatherBox.style.display = 'none';
            weatherDetails.style.display = 'none';
            error404.style.display = 'block';
            error404.classList.add('fadeIn');
        })
        .finally(() => {
            search.classList.remove('loading');
        });
}); 