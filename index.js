const express = require('express')
const path = require('path')
const app = express()

let persons = [
  {
    id: '1',
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: '2',
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: '3',
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: '4',
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
]

app.use(express.json())

const cors = require('cors')
app.use(cors())

app.use(express.static('dist'))

const morgan = require('morgan')
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/info', (request, response) => {
  response.send(`
    <h1>Agenda de contactos</h1>
    <p>La API contiene información sobre ${persons.length} personas</p>
    <p>${new Date()}</p>
  `)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find((p) => p.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter((p) => p.id !== id)

  response.status(204).end()
})

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => Number(n.id))) : 0
  return String(maxId + 1)
}

app.post('/api/persons', (request, response) => {
  const { name, number } = request.body

  if (!name) {
    return response.status(400).json({ error: 'name missing' })
  }
  if (!number) {
    return response.status(400).json({ error: 'number missing' })
  }
  const personAlreadyExists = persons.find((p) => p.name === name)
  if (personAlreadyExists) {
    return response.status(400).json({ error: 'Name already exists. Name must me unique' })
  }

  const person = {
    name,
    number,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
})

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
