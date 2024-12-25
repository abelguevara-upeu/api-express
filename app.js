const express = require('express');
const movies = require('./movies.json');
const crypto = require('node:crypto');
const cors = require('cors');
const { validateMovie, validatePartialMovie } = require('./schemas/movies');

const app = express();
app.use(express.json());
//app.use(cors()); // Enable CORS for all routes

const PORT_HTTP = 53761;
app.use(cors(
    {
        //origin: 'http://localhost:56632'
        origin: function (origin, callback) {
            const ACCEPTED_ORIGINS = [
                `http://localhost:${PORT_HTTP}`,
            ];
            if (ACCEPTED_ORIGINS.includes(origin)) {
                return callback(null, true);
            }

            if (!origin) {
                return callback(null, true);
            }

            return callback(new Error('Not allowed by CORS'));
        }
    }
));
app.disable('x-powered-by');

// Normal methods: GET/HEAD/POST
// Complex methods: PUT/DELETE/PATCH

// CORS PRe-Flight Request
// OPTIONS

app.get('/', (req, res) => {

    res.json({ message: 'Hello World!' });
});

// Todos los recursos de la API RESTful
app.get('/movies', (req, res) => {

    const { genre } = req.query;
    if (genre) {
        const filteredMovies = movies.filter(
            // movie => movie.genre.includes(genre)
            movie => movie.genre.some(
                g => g.toLowerCase() === genre.toLowerCase()
            )
        );
        return res.json(filteredMovies);
    }
    res.json(movies);
});

app.get('/movies/:id', (req, res) => { // path-to-regex

    const { id } = req.params;
    const movie = movies.find(movies => movies.id === id);
    if (movie) return res.json(movie);
    res.status(404).json({ message: 'Movie not found' });
});

app.post('/movies', (req, res) => {

    const result = validateMovie(req.body);

    //if (result.error) {
    if(!result.success) {
        // You might use a status code 422 (Unprocessable Entity) instead of 400 (Bad Request)
        //return res.status(400).json(JSON.parse(result.error.message));
        return res.status(422).json(result.error);
    }

    // simulating a database
    const newMovie = {
        id: crypto.randomUUID(), // UUID v4
        ...result.data // it's not equal to req.body
    };

    // Esto no seria REST, porque estamos guardando el estado de la aplicación en memoria
    movies.push(newMovie);

    res.status(201).json(newMovie);
});

app.delete('/movies/:id', (req, res) => {

    const { id } = req.params;

    const movieIndex = movies.findIndex(movie => movie.id === id);

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' });
    }

    movies.splice(movieIndex, 1);

    return res.status(204).json({ message: 'Movie deleted' });
});

app.patch('/movies/:id', (req, res) => {

    const result = validatePartialMovie(req.body);

    if (!result.success) {
        return res.status(400).json(result.error);
    }

    const { id } = req.params;
    const movieIndex = movies.findIndex(movie => movie.id === id);

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' });
    }

    // simulating a database
    const updateMovie = {
        ...movieIndex[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie;

    res.json(updateMovie);
});

app.options('/movies/:id', (req, res) => {
    const origin = req.header('origin');

    if (ACCEPTED_ORIGINS.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    }

    res.send();
});

const PORT = process.env.PORT ?? 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
