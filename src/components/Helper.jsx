
// temperature conversion
export const convertTemperature = (temp, unit) => {
    if (unit === "c") return Math.round(temp);
    return Math.round((temp * 9) / 5 + 32);
};


// humidity level
export const getHumidityValue = (value) => {
    if (value < 30) return "Low";
    if (value < 60) return "Normal";
    return "High";
};


// visibility (IMPROVED)
export const getVisibilityValue = (value) => {
    const km = value / 1000;

    if (km >= 10) return "10 km (Excellent)";
    if (km >= 5) return `${km.toFixed(1)} km (Good)`;
    if (km >= 2) return `${km.toFixed(1)} km (Moderate)`;
    return `${km.toFixed(1)} km (Poor)`;
};


// wind direction
export const getWindDirection = (degree) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return directions[Math.round(degree / 45) % 8];
};

// for showing wind spped 
export const getWindSpeedKmh = (speed) => {
  return (speed * 3.6).toFixed(1);
};