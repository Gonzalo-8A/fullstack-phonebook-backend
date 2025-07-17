const PersonForm = (props) => {
  return (
    <form onSubmit={props.onSubmit}>
      <div>
        Name: <input value={props.nameValue} onChange={props.onNameChange} />
      </div>
      <div>
        Number: <input value={props.phoneValue} onChange={props.onPhoneChange} />
      </div>
      <div>
        <button type='submit'>Add</button>
      </div>
    </form>
  )
}

export default PersonForm
