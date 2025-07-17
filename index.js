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

app.get('/api/persons/:id', (request, response) => {
  Person.find({}).then((persons) => {
    const id = request.params.id
    const person = persons.find((p) => p.id === id)

    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
})

app.delete('/api/persons/:id', (request, response) => {
  Person.find({}).then((persons) => {
    const id = request.params.id
    persons = persons.filter((p) => p.id !== id)

    response.status(204).end()
  })
})

app.post('/api/persons', async (request, response) => {
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
    console.log(error)
  }
})

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
