import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "./styles.less";
import Todo from "../Todo/Todo";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase/firebase";

const TodosList = () => {
  const fileRef = useRef();

  const [todo, setTodo] = useState({
    title: "",
    body: "",
    completeDate: "",
    attachedFiles: null,
    complete: false,
  });
  const [todos, setTodos] = useState([]);
  const getTodos = async () => {
    try {
      const response = await axios.get(
        `https://womanup-9b548-default-rtdb.firebaseio.com/todo.json`
      );
      setTodos(response.data ? Object.entries(response.data) : []);
    } catch {}
  };

  const createTodo = async () => {
    const uploadFiles = await Promise.all(
      Array.from(todo.attachedFiles || []).map(async (file) => {
        const imageRef = ref(storage, `files/${file.name}`);
        const uploadTask = await uploadBytes(imageRef, file);
        const url = await getDownloadURL(uploadTask.ref);
        return { url, name: file.name };
      })
    );
    await axios.post(
      `https://womanup-9b548-default-rtdb.firebaseio.com/todo.json`,
      { ...todo, attachedFiles: uploadFiles }
    );
  };

  const now = dayjs().format("H:mm  DD.MM.YYYY");

  const putTodo = async () => {
    try {
      if (!todo.title) return;
      await createTodo();
      getTodos();
      setTodo({
        ...todo,
        title: "",
        body: "",
        completeDate: "",
      });
      fileRef.current.value = null;
    } catch {}
  };

  useEffect(() => {
    getTodos();
  }, []);

  return (
    <div className="todo_main_container">
      <h1>Планер</h1>
      <div>Текущая дата: {now}</div>
      <form className="add_todo_form">
        <input
          type="text"
          placeholder="Введите заголовок задачи"
          value={todo.title}
          onChange={(e) => setTodo({ ...todo, title: e.target.value })}
          className="todo_input"
        />
        <input
          type="text"
          placeholder="Введите описание задачи"
          value={todo.body}
          onChange={(e) => setTodo({ ...todo, body: e.target.value })}
          className="todo_input"
        />
        <input
          type="date"
          value={todo.completeDate}
          onChange={(e) => setTodo({ ...todo, completeDate: e.target.value })}
          className="todo_input"
        />
        <input
          type="file"
          ref={fileRef}
          multiple="multiple"
          onChange={(e) => {
            setTodo({ ...todo, attachedFiles: e.target.files });
          }}
          className="todo_input_file"
        />

        <button type="button" onClick={putTodo}>
          Создать задачу
        </button>
      </form>
      <div className="todosList">
        {todos.map((todo) => (
          <Todo todo={todo} key={todo[0]} getTodos={getTodos} />
        ))}
      </div>
    </div>
  );
};

export default TodosList;
