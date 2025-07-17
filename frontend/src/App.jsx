import './App.css'

import { useEffect, useState } from 'react'
import axios from 'axios'
import personsService from './services/persons.js'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons.jsx'
import Notification from './components/Notification.jsx'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [filter, setFilter] = useState('')
  const [message, setMessage] = useState({
    text: null,
    type: ''
  })

  useEffect(() => {
    personsService.getAll().then((initialPersons) => {
      setPersons(initialPersons)
    })
  }, [])

  const addNewPhone = (event) => {
    event.preventDefault()

    if (newName === '' || newPhone === '') {
      return
    }

    const newPerson = {
      name: newName,
      number: newPhone,
    }

    const person = persons.find((p) => p.name === newName)

    if(person) {
      if (
        window.confirm(
          `${person.name} is already added to the phonebook, replace the old number with a new one?`
        )
      ) {
        personsService
          .update(person.id, newPerson)
          .then((updatedPerson) => {
            setPersons((prev) => prev.map((p) => (p.id === updatedPerson.id ? updatedPerson : p)))
            setNewName('')
            setNewPhone('')
            setMessage({text: `${updatedPerson.name} was successfully updated`, type: 'add'})
            setTimeout(() => {
              setMessage({text: null, type: ''})
            }, 5000)
          })
          .catch((error) => {
            console.error('Error updating person:', error)
            setMessage({text: `Failed to update ${person.name}. They may have been removed from the server.`, type: 'error'})
            setTimeout(() => {
              setMessage({text: null, type: ''})
            }, 5000)
          })
      } else return
    } else {
          personsService
      .create(newPerson)
      .then((createdPerson) => {
        setPersons((prev) => prev.concat(createdPerson))
        setNewName('')
        setNewPhone('')
        setMessage({text: `${createdPerson.name} was successfully added`, type: 'add'})
        setTimeout(() => {
          setMessage({text: null, type: ''})
        }, 5000)
      })
      .catch((error) => {
        console.error('Error adding person:', error)
        setMessage({text: 'Failed to add new person, please try again later.', type: 'error'})
        setTimeout(() => {
          setMessage({text: null, type: ''})
        }, 5000)
      })
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handlePhoneChange = (event) => {
    setNewPhone(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  const deletePerson = (id) => {
    const person = persons.find((p) => p.id === id)
    if (!person) return
    if (window.confirm(`Are you sure you want to delete ${person.name}`)) {
      personsService
        .remove(id)
        .then(() => {
          setPersons((prev) => prev.filter((p) => p.id !== id))
          setMessage({ text: `${person.name} successfully removed`, type: 'delete' })
          setTimeout(() => {
            setMessage({ text: null, type: '' })
          }, 5000)
        })
        .catch((error) => {
          console.log(error)
          setMessage({
            text: `Information of ${person.name} has already been removed from server`,
            type: 'delete',
          })
          setPersons((prev) => prev.filter((p) => p.id !== id))
          setTimeout(() => {
            setMessage({ text: null, type: '' })
          }, 5000)
        })
    } else return
  }

  const filteredPersons = persons.filter((p) => p.name.includes(filter))

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message}/>
      <Filter value={filter} onChange={handleFilterChange} />
      <h2>Add a new Contact</h2>
      <PersonForm
        onSubmit={addNewPhone}
        nameValue={newName}
        onNameChange={handleNameChange}
        phoneValue={newPhone}
        onPhoneChange={handlePhoneChange}
      />
      <h2>Numbers</h2>
      <Persons filteredPersons={filteredPersons} onClick={deletePerson} />
    </div>
  )
}

export default App
