const z = require('zod');

const movieSchema = z.object({
    title: z.string(
        {
            invalid_type_error: 'Title must be a string',
            required_error: 'Title is required',
        }
    ),
    year: z.number().int().positive().min(1900).max(2024),
    director: z.string(),
    duration: z.number().int().positive(),
    poster: z.string().url({
        message: 'Poster must be a valid URL',
    }),
    genre: z.array(
        z.enum(['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller']),
        {
            invalid_type_error: 'Genre must be an array of enum values',
            required_error: 'Genre is required',
        }
    ),
    //rate: z.number().positive().max(10).default(1), //without 0
    rate: z.number().min(0).max(10).default(0),
})

function validateMovie (shape) {
    // return movieSchema.parse(object); // throws an error if the object is invalid, must be implemented in a try-catch block
    return movieSchema.safeParse(shape); // returns an object with an error property if the object is invalid, also you could use safeParseAsync
}

function validatePartialMovie (input) {
    return movieSchema.partial().safeParse(input);
}

module.exports = {
    validateMovie,
    validatePartialMovie,
};
