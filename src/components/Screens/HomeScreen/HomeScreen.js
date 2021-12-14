import {db,auth} from '../../../firebase';
import { ref,set,get,child } from "firebase/database";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useEffect,useState,useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { userContext } from "../../../App";
import { successToast,errorToast } from '../../toast';
import logo from '../../../img/logo.png';

const HomeScreen = ()=>{
  const [users,setUsers] = useState({});
  const [notReg,setNotReg] = useState(false);
  const [email,setEmail] = useState("");
  const [name,setName] = useState("");
  const [username,setUsername] = useState("");
  const [loaded,setLoaded] = useState(false);
  const [pic,setPic] = useState("");
  const navigate = useNavigate();
  const { state, dispatch } = useContext(userContext);

  const prohibited = ['.','#','$','[',']',' '];
    
  const findUser = (emailId)=>{
    console.log(users);
    for(const user in users){
      console.log(users[user]);
      if(users[user].email==emailId)
        return users[user];
    }
    return false;
  }

  const signUp = ()=>{
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth,provider)
    .then(res=>{
      console.log(res);
      console.log(users)
      setEmail(res.user.email);
      setPic(res.user.photoURL);
      const existingUser = findUser(res.user.email);
      console.log(existingUser);
      if(existingUser===false){
        setNotReg(true);
      }else{
        set(ref(db,"users/"+existingUser.username+"/isOnline/"),true);
        setNotReg(false);
        dispatch({
            type: "ADD",
            payload: {
                ...existingUser
            }
        });
        successToast("Successfully Logged in");
        navigate("/chat")
      }
    })
  

  }
  
  const register = ()=>{
    if(name===""){
      errorToast("Please enter name!");
      return;
    }
    if(username===""){
      errorToast("Please enter username!");
      return;
    }
    for(let i=0;i<username.length;i++){
        console.log(username[i]);
        if(prohibited.includes(username[i])){
            errorToast("Invalid Username, Username should not consist of '.','#','$','[',']',' '");
            return;
        }
    }
    if(users!=null && username in users){
      errorToast("Username already taken!");
      return;
    }
    
    set(ref(db,"users/"+username),{
      name:name,
      username:username,
      email:email,
      pic:pic,
      isOnline:true
    }).then((res)=>{
      successToast("Successfully registered");
      dispatch({
        type: "ADD",
        payload: {
            name:name,
            username:username,
            email:email,
            pic:pic
        }
    })
      navigate("/chat")
    })
    .catch(err=>{
      console.log(err);
    })
  }

    useEffect(()=>{
        console.log(state)
        if(state!=null)
            navigate("/chat")
        else{
            const dbRef = ref(db);
            get(child(dbRef, 'users/')).then((snapshot)=>{
                console.log(snapshot.val())
                setUsers(snapshot.val());
                console.log(users);
                console.log(loaded)
                setLoaded(true);
            })
            .catch(err=>{
              window.location.reload()
                console.log(err);
            })
            
        }
        
    },[]);
    return(
        <>
            <img src={logo}/>
            <br></br>
            
      {
        loaded==true
        ?
        <button
        onClick={signUp}
        disabled={!loaded}
        style={{
          width:"200px",
          height:"50px",
          fontSize:"1.2rem",
          borderRadius:"15px",
          outline:"none",
          border:"none",
          cursor:"pointer"
        }}>Enter with google</button>
        :
        <p>Loading...</p> 
      }
      
      
      {
        notReg && <>
          <h2>User with given email not registerd</h2>
          <p>Please enter your name and username to continue</p>
          <br></br>
          <label>Enter your name</label>
          <input onChange={e=>setName(e.target.value)}></input>
          <br></br>
          <label>Enter your username</label>
          <input onChange={e=>setUsername(e.target.value)}></input>
          <br></br>
          <button
          onClick={register}>Register</button>
        </>
      }
        </>
    )
}

export default HomeScreen;