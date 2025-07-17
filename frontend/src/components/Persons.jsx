const Persons = (props) => {
  return (
    <ul>
      {props.filteredPersons.map((person) => {
        return (
          <li style={{ listStyle: 'none' }} key={person.name}>
            {person.name} - {person.number} <button onClick={() => {props.onClick(person.id)}}>Delete</button>
          </li>
        )
      })}
    </ul>
  )
}

export default Persons
