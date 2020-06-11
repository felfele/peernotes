import React, { useState } from 'react';
import './App.css';

function InputForm(props: {addTodo: (s: string) => void}) {
  const [value, setValue] = useState('')
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    props.addTodo(value)
    setValue('')
  }
  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'stretch',
        alignItems: 'stretch',
      }}
    >
      <input
        id='forminput'
        type='text'
        value={value}
        placeholder='New item here...'
        onChange={e => setValue(e.target.value)}
        style={{
          flex: 1,
          fontSize: 'large',
        }}
      />
    </form>
  )
}

function TodoItem(props: {text: string, index: number, deleteItem: (index: number) => void}) {
  return (
    <div
      className='todo'
    >
      <div style={{display: 'flex'}}>{props.text}</div>
      <div style={{display: 'flex'}}><button onClick={() => props.deleteItem(props.index)}>X</button></div>
    </div>
  )
}

function App() {
  const [todos, setTodos] = useState<string[]>([])
  return (
    <div className="App">
      <header className="App-header">
        <div className='todo-list'>
          {todos.map((todo, index) =>
            <TodoItem
              text={todo}
              index={index}
              deleteItem={index => {
                const todosCopy = [...todos]
                todosCopy.splice(index, 1)
                setTodos(todosCopy)}
              }
            />)}
          <InputForm addTodo={s => setTodos([...todos, s])} />
        </div>
      </header>
    </div>
  );
}

export default App;
