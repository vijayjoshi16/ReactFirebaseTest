import './App.css';
import {BrowserRouter, Link, Route, Routes} from 'react-router-dom';
import {useReducer, createContext } from "react";
import HomeScreen from './components/Screens/HomeScreen/HomeScreen';
import ChatScreen from './components/Screens/ChatScreen/ChatScreen';
import { initialState, reducer } from "./reducers/userReducer";

export const userContext = createContext();

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <userContext.Provider value={{ state, dispatch }}>
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<HomeScreen/>}/>
          <Route path="/chat" element={<ChatScreen/>}/>
        </Routes>
      </BrowserRouter>
    </div>
    </userContext.Provider>
  );
}

export default App;
