const express = require('express')
const app = require('../app')
const api = express.Router()
const Client = require('mysql')

// database configuration
const hostname = "localhost",
  username = "root",
  password = "",
  databsename = "onito"


const con = Client.createConnection({
  host: hostname,
  user: username,
  password: password,
  database: databsename
})

con.connect((err) => {
  if (err) return console.error(
    'error: ' + err.message);
  console.log("connected")
});

// GET /longest-duration-movies
api.get('/longest-duration-movies', (req, res, next) => {
  const requiredQuery = 'SELECT tconst, primaryTitle, runtimeMinutes, genres FROM movies ORDER BY runtimeMinutes DESC LIMIT 10;'
  con.query(requiredQuery, (err, results, fields) => {
    if (err) {
      next(new Error("sdsd"))
    }
    res.status(200).json(
      {
        message: 'Success',
        movies: results
      }
    )
  })
})

// POST /new-movie
api.post('/new-movie', (req, res, next) => {

  const { body } = req
  const { titleType, primaryTitle, runtimeMinutes, genre } = body
  const trimQuery = `SELECT Trim(Leading 't' FROM tconst) as "tconst" FROM movies ORDER BY tconst DESC LIMIT 1;`
  con.query(trimQuery, (err, results, fields) => {

    // if there is any error
    if (err) next(new Error("Error in the query"))

    // function inserts a movie according to last record
    const saveMovie = (id, indexInNumber) => {
      con.query(requiredQuery, [`${id}${indexInNumber + 1}`, titleType, primaryTitle, runtimeMinutes, genre], (err, results, fields) => {
        if (err) {
          res.send(
            {
              message: 'Error',
              error: err.message
            }
          )
        }
        console.log(results)
        res.json({
          message: 'New movie added successfully.'
        })
        return
      })
    }

    if (results) {

      const indexInNumber = Number(results[0].tconst) // last record Id in number
      const indexInString = indexInNumber.toString() // last record Id in string

      // query for insertion
      const requiredQuery = 'INSERT INTO movies values(?, ?, ?, ?, ?);'

      // save
      if (indexInString.length === 2) saveMovie('tt00000', indexInNumber)
      if (indexInString.length === 3) saveMovie('tt0000', indexInNumber)
      if (indexInString.length === 4) saveMovie('tt000', indexInNumber)
      if (indexInString.length === 5) saveMovie('tt00', indexInNumber)
      if (indexInString.length === 6) saveMovie('tt0', indexInNumber)
      if (indexInString.length === 7) saveMovie('tt', indexInNumber)

    }

  })

})

// GET /top-rated-movies
api.get('/top-rated-movies', (req, res) => {
  const requiredQuery = `SELECT movies.tconst, movies.primaryTitle, movies.genres, ratings.averageRating FROM movies , ratings WHERE movies.tconst = ratings.tconst AND ratings.averageRating>6.0 ORDER BY ratings.averageRating`
  con.query(requiredQuery, (err, results, fields) => {
    if (err)
      res.status(500).json(
        {
          error: err.message
        }
      )

    res.status(200).json(
      {
        movies: {
          results
        }
      }
    )
    console.log(results)
  })
})

module.exports = api