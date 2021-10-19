// starter code in both routes/celebrities.routes.js and routes/movies.routes.js
const router = require("express").Router();

const Celebrity = require("../models/Celebrity.model");
const Movie = require("../models/Movie.model");

router.get("/movies", (req, res, next) => {
  Movie.find()
    .then((moviesFromDb) => {
      res.render("movies/movies", { moviesFromDb });
    })
    .catch((err) => console.log(`Err while rendering movie list: ${err}`));
});

router.get("/movies/create", (req, res, next) => {
  Celebrity.find()
    .then((celebritiesFromDb) => {
      res.render("movies/new-movie", { celebritiesFromDb });
    })
    .catch((err) => console.log(`Err while creating movie: ${err}`));
});

router.post("/movies/create", (req, res, next) => {
  const { title, genre, plot, cast } = req.body;

  Movie.create({ title, genre, plot, cast })
    .then(() => {
      res.redirect("/movies");
    })
    .catch((err) => {
      console.log(`Error while adding new movie to the DB: ${err}`);
      res.redirect("movies/new-movie");
    });
});

//
// EDIT
//
router.get("/movies/:movieId/edit", (req, res, next) => {
  const { movieId } = req.params;

  let allCelebrities;

  Celebrity.find()
    .then((celebritiesFromDB) => {
      allCelebrities = celebritiesFromDB;
      return Movie.findById(movieId).populate("cast");
    })
    .then((movieFromDB) => {
      let remainingCelebrities = allCelebrities.filter((celeb) => {
        return celeb._id.toString() != movieFromDB.cast[0]._id.toString();
      });
      res.render("movies/edit-movie", { movie: movieFromDB, remainingCelebrities });
    })
    .catch((error) => {
      console.log("error displaying movie editor", error);
      next(error);
    });
});

router.post("/movies/:movieId/edit", (req, res, next) => {
  const { movieId } = req.params;
  const { title, genre, plot, cast } = req.body;
  console.log(req.body);

  Movie.findByIdAndUpdate(movieId, { title, genre, plot, cast }, { new: true })
    .populate("cast")
    .then((updatedMovie) => {
      console.log("POPULATE", updatedMovie);
      res.redirect(`/movies/${updatedMovie._id}`);
    })
    .catch((error) => {
      console.log("error editing movie", error);
      next(error);
    });
});

//
// DELETE
//
router.post("/movies/:movieId/delete", (req, res, next) => {
  const { movieId } = req.params;

  Movie.findByIdAndDelete(movieId)
    .then(() => res.redirect("/movies"))
    .catch((error) => {
      console.log("error deleting movie", error);
      next(error);
    });
});

router.get("/movies/:movieId", (req, res, next) => {
  const { movieId } = req.params;

  Movie.findById(movieId)
    .populate("cast")
    .then((singleMovieFromDb) => {
      res.render("movies/movie-details", { movie: singleMovieFromDb });
    })
    .catch((err) => {
      console.log(`Error while rendering movie details`, err);
      next(err);
    });
});

module.exports = router;
