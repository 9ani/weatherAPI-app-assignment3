const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const axios = require('axios');
const path = require('path');
const ejs = require('ejs'); 

const app = express();
const port = 3000;


app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'public/views')); 

mongoose.connect('mongodb+srv://gani:qwerty123456@weatherapi.qd1uz2q.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  isAdmin: {
    type: Boolean,
    default: false,
  }
});
const weatherDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  city: String,
  temperature: Number, 
  description: String, 
  humidity: Number, 
  pressure: Number, 
  windSpeed: Number, 
  timestamp: {
    type: Date,
    default: Date.now,
  },
});


const WeatherData = mongoose.model('WeatherData', weatherDataSchema);

const User = mongoose.model('User', userSchema);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: '123456',
  resave: true,
  saveUninitialized: true,
}));

const requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect('/login');
  } else {
    next();
  }
};

const requireAdmin = async (req, res, next) => {
    try {
      const user = await User.findById(req.session.userId);
      if (user.isAdmin) {
        next();
      } else {
        res.redirect('/');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

app.get('/', requireLogin, (req, res) => {
  res.render('index.ejs');
});


app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.userId = user._id;

    if (user.isAdmin) {
      console.log('you are admin');
      res.redirect('/admin');
    } else {
      res.render('index', { userName: user.username });
    }
  } else {
    res.redirect('/login');
  }
});



app.get('/admin', requireAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.render('admin', { users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/admin/add', requireAdmin, async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, isAdmin: isAdmin || false });
    await newUser.save();
    res.redirect('/admin');
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/admin/edit/:id', requireAdmin, async (req, res) => {
  try {
    const { username, isAdmin } = req.body;
    const userId = req.params.id;

    await User.findByIdAndUpdate(userId, { username, isAdmin });
    res.status(200).send('User updated successfully');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/admin/delete/:id', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.redirect('/admin');
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.get('/register', (req, res) => {
  res.render('register.ejs');
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    res.redirect('/register');
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, isAdmin: false });
    await newUser.save();
    res.redirect('/login');
  }
});
app.get('/users/weather-history', requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId;
    const userWeatherData = await WeatherData.find({ user: userId }).sort({ timestamp: -1 });
    res.json(userWeatherData);
  } catch (error) {
    console.error('Error fetching user weather history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.post('/weather', requireLogin, async (req, res) => {
  try {
    const city = req.body.city;
    const apiKey = '00f1bb8a38011dd438f299b212a62ee9';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    const response = await axios.get(apiUrl);
    const weatherData = response.data;

    const newWeatherData = new WeatherData({
      user: req.session.userId,
      city,
      temperature: weatherData.main.temp,
      description: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      windSpeed: weatherData.wind.speed,
      timestamp: new Date(),
    });

    await newWeatherData.save();

    console.log('Weather API Response:', weatherData);

    res.json(weatherData);
  } catch (error) {
    console.error('Error processing weather request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});






app.get('/users/weather-history', requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId;
    const weatherHistory = await WeatherData.find({ user: userId });
    res.json(weatherHistory);
  } catch (error) {
    console.error('Error fetching weather history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.get('/users/:userId/weather', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const weatherData = await WeatherData.find({ user: userId }).sort({ timestamp: -1 });
    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching user weather data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


app.post('/news', async (req, res) => {
  try {
    const city = req.body.q;     
    console.log('City:', city);

    const apiKey = '988f29fedc0b4d3e8b801de2705cbd57';
    const apiUrl = `https://newsapi.org/v2/top-headlines?q=${encodeURIComponent(city)}&apiKey=${apiKey}&pageSize=3`;

    const response = await axios.get(apiUrl);
    const newsData = response.data;

    console.log('News API Response:', newsData); 

    res.json(newsData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/photos', async (req, res) => {
  try {
    const city = req.body.city;
    const accessKey = 'tjZa3_FiUlmcGH9Y36YkR1dv6d7jJPdRjy9QwElCWyA'; 
    const apiUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(city)}&client_id=${accessKey}`;

    const response = await axios.get(apiUrl);
    const photoData = response.data;

    res.json(photoData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
