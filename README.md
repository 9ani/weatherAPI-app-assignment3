# Weather App

## Overview

Welcome to the WeatherAPI App! This application allows users to check weather information, view weather history, and more.

## Features
- User registration, login
- Get current weather information for a specific city.
- Display latest news articles related to the city.
- Showcase a picture of the city using Unsplash API.
- Visualize the city on a map.
- Weather history feature
- Admin's page

## Setup

### Prerequisites

- Node.js installed on your machine.

### Installation

- Follow these steps to set up the WeatherAPI App on your local machine:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/9ani/weatherAPI-app-assignment3.git
   ```
2. **Navigate to the project directory:**

    ```bash
    cd weatherAPI-app-assignment3
    ```
3. **Install dependencies:**

   
    ```bash
    npm install
    ```
    This will install the necessary packages based on the package.json file.

4. **Create API keys:**

- Obtain an API key from [OpenWeatherMap](https://openweathermap.org) and replace the placeholder in **server.js.**
- Get an API key from [News API ](https://newsapi.org) and  replace the placeholder in **server.js.**
- Get an API key from [Unsplash API](https://unsplash.com/oauth/applications/new) and replace the placeholder in **server.js.**

5. **Start the server:**


    ```bash
    npm run start
    ```
6.  **Open your browser and go to http://localhost:3000.**

### Usage
- Registrate as a user and log in
- Enter the name of the city in the input field and click "Get Weather."
- Look at your history
- View the weather information, latest news, a picture of the city, and its location on a map.
### Admin

The default username and password for admin access are:
- Username: gani
- Password: gani

### API Usage
- OpenWeatherMap API: Provides weather information.
- News API: Fetches the latest news articles.
- Unsplash API: Retrieves high-quality images of the city.

### Design Decisions
- Separation of Concerns: The work logic is implemented in the core JS file (server.js) to keep the HTML file clean.
- Responsive Design: The application is designed to work seamlessly on various screen sizes.
- Structured CSS: The CSS is organized into classes to improve maintainability.

### Maps:
This app uses the Leaflet package for displaying maps.
### Author
Gani Uapov

Group: SE-2206
