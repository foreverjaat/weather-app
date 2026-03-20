import React, { useEffect, useState } from "react";
import WeatherBackground from "./components/WeatherBackground";
import {
  convertTemperature,
  getHumidityValue,
  getVisibilityValue,
  getWindDirection,
  getWindSpeedKmh,
} from "./components/Helper";

import {
  HumidityIcon,
  SunriseIcon,
  SunsetIcon,
  VisibilityIcon,
  WindIcon,
} from "./components/Icons";

const App = () => {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("");
  const [suggestion, setSuggestion] = useState([]);
  const [unit, setUnit] = useState("c");
  const [error, setError] = useState("");

  const API_KEY = import.meta.env.VITE_API_KEY_MY;

  /* ---------- WEATHER CONDITION ---------- */

  const getWeatherCondition = () =>
    weather && {
      main: weather.weather[0].main,
      isDay:
        Date.now() / 1000 > weather.sys.sunrise &&
        Date.now() / 1000 < weather.sys.sunset,
    };

  const condition = getWeatherCondition();

  const isDarkBackground =
    !condition ||
    !condition.isDay ||
    ["Rain", "Clouds", "Thunderstorm", "Snow", "Mist"].includes(
      condition.main
    );

  const textColor = isDarkBackground ? "text-white" : "text-black";

  /* ---------- SEARCH SUGGESTIONS ---------- */

  useEffect(() => {
    if (city.trim().length >= 3 && !weather) {
      const timer = setTimeout(() => fetchSuggestions(city), 400);
      return () => clearTimeout(timer);
    }
    setSuggestion([]);
  }, [city, weather]);

  const fetchSuggestions = async (query) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      setSuggestion(await res.json());
    } catch {
      setSuggestion([]);
    }
  };

  /* ---------- FETCH WEATHER ---------- */

  const fetchWeatherData = async (url, name = "") => {
    setError("");
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("City not found");

      const data = await res.json();
      setWeather(data);
      setCity(name || data.name);
      setSuggestion([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (!city.trim()) return setError("Enter city");

    fetchWeatherData(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
  };

  /* ---------- UI ---------- */

  return (
    <div className="min-h-screen">
      <WeatherBackground condition={condition} />

      <div className="flex items-center justify-center min-h-screen p-6">
        <div
          className={`bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl
          p-8 max-w-md w-full border border-white/30 z-10 ${textColor}`}
        >
          <h1 className="text-4xl font-bold text-center mb-2">
            Weather App
          </h1>

          {error && <p className="text-red-400 text-center">{error}</p>}

          {/* UNIT TOGGLE */}
          {weather && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() =>
                  setUnit((u) => (u === "c" ? "f" : "c"))
                }
                className="px-4 py-1 rounded-full bg-white/30 backdrop-blur-md"
              >
                °{unit.toUpperCase()}
              </button>
            </div>
          )}

          {!weather ? (
            <form onSubmit={handleSearch} className="flex flex-col relative">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city"
                className="mb-4 p-3 rounded border border-white bg-transparent"
              />

              {/* CITY SUGGESTIONS */}
              {suggestion.length > 0 && (
                <div className="absolute top-12 left-0 right-0 bg-black/80 text-white rounded-lg z-50 overflow-hidden">
                  {suggestion.map((s) => (
                    <button
                      key={`${s.lat}-${s.lon}`}
                      type="button"
                      className="block w-full text-left px-4 py-2 hover:bg-blue-600"
                      onClick={() =>
                        fetchWeatherData(
                          `https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon=${s.lon}&appid=${API_KEY}&units=metric`,
                          `${s.name}, ${s.country}`
                        )
                      }
                    >
                      {s.name}, {s.country}
                    </button>
                  ))}
                </div>
              )}

              <button className="bg-purple-700 py-2 rounded text-white">
                Get Weather
              </button>
            </form>
          ) : (
            <div className="text-center">
              <button
                onClick={() => {
                  setWeather(null);
                  setCity("");
                }}
                className="bg-purple-700 px-3 py-1 rounded text-white mb-3"
              >
                New Search
              </button>

              <h2 className="text-3xl font-bold">{weather.name}</h2>

              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt=""
                className="mx-auto"
              />

              <p className="text-5xl font-bold">
                {convertTemperature(weather.main.temp, unit)}°{unit}
              </p>

              <p className="capitalize mb-4">
                {weather.weather[0].description}
              </p>

              {/* WEATHER STATS */}
              <div className="flex flex-wrap gap-6 justify-center mt-4">
                {[
                  [
                    HumidityIcon,
                    "Humidity",
                    `${weather.main.humidity}% (${getHumidityValue(
                      weather.main.humidity
                    )})`,
                  ],
                  [
                    WindIcon,
                    "Wind",
                    `${getWindSpeedKmh(weather.wind.speed)} km/h (${getWindDirection(
                      weather.wind.deg
                    )})`,
                  ],
                  [
                    VisibilityIcon,
                    "Visibility",
                    getVisibilityValue(weather.visibility),
                  ],
                ].map(([Icon, label, value]) => (
                  <div key={label} className="text-center">
                    <Icon />
                    <p>{label}</p>
                    <p className="text-sm">{value}</p>
                  </div>
                ))}
              </div>

              {/* SUNRISE / SUNSET */}
              <div className="flex gap-8 justify-center mt-6">
                {[
                  [SunriseIcon, "Sunrise", weather.sys.sunrise],
                  [SunsetIcon, "Sunset", weather.sys.sunset],
                ].map(([Icon, label, time]) => (
                  <div key={label} className="text-center">
                    <Icon />
                    <p className="font-semibold">{label}</p>
                    <p className="text-sm">
                      {new Date(time * 1000).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>

              {/* FEELS LIKE */}
              <div className="mt-6 text-sm text-center">
                <p>
                  <strong>Feels Like:</strong>{" "}
                  {convertTemperature(weather.main.feels_like, unit)}°{unit}
                </p>
                <p>
                  <strong>Pressure:</strong> {weather.main.pressure} hPa
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;