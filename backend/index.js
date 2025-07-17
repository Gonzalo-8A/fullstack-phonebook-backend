const express = require('express')
const path = require('path')
const app = express()
require('dotenv').config()
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person.js')

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.get('/api/info', (request, response) => {
  Person.find({}).then((persons) => {
    response.send(`
    <h1>Agenda de contactos</h1>
    <p>La API contiene información sobre ${persons.length} personas</p>
    <p>${new Date()}</p>
  `)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch((error) => next(error))
})

app.post('/api/persons', async (request, response, next) => {
  const { name, number } = request.body

  if (!name) {
    return response.status(400).json({ error: 'name missing' })
  }
  if (!number) {
    return response.status(400).json({ error: 'number missing' })
  }

  try {
    const existingPerson = await Person.findOne({ name })
    if (existingPerson) {
      return response.status(400).json({ error: 'Name already exists. Name must be unique' })
    }

    const person = new Person({ name, number })
    const savedPerson = await person.save()
    response.json(savedPerson)
  } catch (error) {
    next(error)
  }
})

app.put('/api/persons/:id', async (request, response, next) => {
  const { name, number } = request.body

  const updatedPerson = {
    name,
    number,
  }

  try {
    const result = await Person.findByIdAndUpdate(request.params.id, updatedPerson, {
      new: true,
      runValidators: true,
      context: 'query',
    })
    if (result) {
      response.json(result)
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
