import React, { useState } from "react";
import axios from "axios";
import "./styles.less";
import RedactTodoModal from "../UI/RedactTodoModal";
import dayjs from "dayjs";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "../firebase/firebase";

/**
 * @callback getTodos - Function that get todos from backend.
 */
/**
 * Represents a todo.
 * @param {[string,object]} todo - The object of todo in list.
 * @param {getTodos} getTodos - Function that get todos from backend.
 * @param {string} todo.title - The title of todo
 * @param {string} todo.body - The body of todo
 * @param {string} todo.completeDate - Planned completion date of todo
 * @param {object[]} todo.attachedFiles - Files that attached to todo
 * @param {string} todo.attachedFiles.url - Download file`s url
 */
const Todo = ({ todo, getTodos }) => {
  const [showModal, setShowModal] = useState(false);
  const redactTodo = () => {
    setShowModal(!showModal);
  };

  const todoDate = dayjs(todo[1].completeDate);
  const outDatedTodo = dayjs().isAfter(todoDate);

  const deleteFileOnServer = async (file) => {
    const fileRef = ref(storage, `files/${file.name}`);
    await deleteObject(fileRef);
  };
  const deleteTodo = async () => {
    try {
      await Promise.all(todo[1].attachedFiles.map(deleteFileOnServer));
      const response = await axios.delete(
        `https://womanup-9b548-default-rtdb.firebaseio.com/todo/${todo[0]}.json`
      );

      getTodos();
    } catch {}
  };

  const [doneTodo, setDoneTodo] = useState(!!todo[1].complete);
  const toggleTodo = async () => {
    setDoneTodo(!doneTodo);
    try {
      const response = await axios.put(
        `https://womanup-9b548-default-rtdb.firebaseio.com/todo/${todo[0]}.json`,
        {
          ...todo[1],
          complete: !doneTodo,
        }
      );
    } catch {
      setDoneTodo(doneTodo);
    }
  };

  return (
    <div className="todo_card">
      <div className={!doneTodo ? "todo_text" : "todo_text_done"}>
        <span>Заголовок: {todo[1].title}</span>
        <span>Описание:{todo[1].body}</span>
      </div>
      <div className="done_todo_check_container">
        <span>Выполнено</span>
        <input
          type="checkbox"
          onChange={toggleTodo}
          className="todo_checkbox"
          checked={doneTodo}
        />
      </div>
      <span className={outDatedTodo ? "todo_date_outdate" : "todo_date"}>
        Дата завершения: {todo[1].completeDate}
      </span>
      {todo[1].attachedFiles?.map((file) => (
        <a href={file.url} download target="_blank" key={file.url}>
          {file.name}
        </a>
      ))}
      <div className="todo_card_btns">
        <button onClick={deleteTodo}>Удалить задачу</button>
        <button onClick={redactTodo}>Редактировать</button>
      </div>
      <RedactTodoModal
        showModal={showModal}
        setShowModal={setShowModal}
        todo={todo}
        getTodos={getTodos}
      />
    </div>
  );
};

export default Todo;
