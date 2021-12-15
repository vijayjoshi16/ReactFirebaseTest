import { useContext, useEffect, useState } from "react";
import { db } from "../../../firebase";
import { ref,set,onValue, onChildChanged } from "firebase/database";
import { userContext } from "../../../App";
import { useNavigate } from "react-router-dom"
import {Grid, setRef} from '@material-ui/core';
import { successToast } from "../../toast";

const ChatScreen = ()=>{
    const [users, setUsers] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [selectedChatMessages,setSelectedChatMessages] = useState([]);
    const [currentMessage,setCurrentMessage] = useState("");
    const navigate = useNavigate();
    const { state, dispatch } = useContext(userContext);
    const userRef = ref(db,'users/');
    console.log(users)
    const statusMap = {
        sent:"✓",
        received:"✓✓",
        read:"✓✓"
    }
    const colorMap = {
        sent:"gray",
        received:"gray",
        read:"blue"
    }
    
    const getChats = (otherUsername,otherName)=>{
        let key;
        if(state.username>otherUsername)
            key=otherUsername+" "+state.username;
        else
            key=state.username+" "+otherUsername;
        console.log(key)
        onValue(ref(db,'chats/'+key),(snapshot)=>{
            console.log(snapshot.exists())
            if(snapshot.exists()){
                console.log(snapshot.val())
                const msgStatusesToUpdate = snapshot.val();
                for(let i=1;i<msgStatusesToUpdate.length;i++){
                    console.log(msgStatusesToUpdate[i])
                    console.log(state.username)
                    if(msgStatusesToUpdate[i].sentBy!=state.username){
                        if(msgStatusesToUpdate[i].status!="read"){
                            msgStatusesToUpdate[i].status="read";
                        }
                    }
                    // if(msgStatusesToUpdate[i].sentBy==state.username && msgStatusesToUpdate[i].status=="sent"){
                    //     onValue(ref(db,'users/'+otherUsername),(snapshot)=>{
                    //         if(snapshot.val().isOnline==true){
                    //             msgStatusesToUpdate[i].status=
                    //         }
                    //     })
                    // }
                }
                console.log(msgStatusesToUpdate)
                set(ref(db,'chats/'+key),msgStatusesToUpdate);
                setSelectedChatMessages(msgStatusesToUpdate)
            }else{
                set(ref(db,'chats/'+key),[
                    {
                        message:"This is the beggining of your chat with ",
                        sentBy:"#"
                    }
                ]);
                setSelectedChatMessages([
                    {
                        message:"This is the beggining of your chat with ",
                        sentBy:"#"
                    }
                ])
            }
            setSelectedChat(otherUsername);
        })
    }

    const alertUser = (e) => {
        e.preventDefault()
        e.returnValue = 'Do you want to logout?'
    }

    useEffect(()=>{
        console.log(state)
        if(state==null)
            navigate("/")
        else{
            onValue(ref(db,'users/'),(snapshot)=>{
                console.log(snapshot.val());
                const userList = snapshot.val();
                setUsers(userList);
            })
        }
        window.addEventListener('beforeunload', alertUser)
        window.addEventListener('unload', Logout)
        return () => {
            window.removeEventListener('beforeunload', alertUser)
            window.removeEventListener('unload', Logout)
        }
    },[]);

    const sendMessage = ()=>{
        if(currentMessage===""){
            console.log("Please enter a valid message");
            return;
        }
        const currMsgArray = selectedChatMessages;
        console.log(currMsgArray)
        currMsgArray.push({
            message:currentMessage,
            sentBy:state.username,
            status:"sent"
        });
        setSelectedChatMessages(currMsgArray);
        setCurrentMessage("")
        let key;
        if(state.username>selectedChat)
            key=selectedChat+" "+state.username;
        else
            key=state.username+" "+selectedChat;
        set(ref(db,'chats/'+key),currMsgArray);
        setSelectedChatMessages(currMsgArray);
        

    }

    const Logout = ()=>{
        set(ref(db,"users/"+state.username+"/isOnline/"),false);
        dispatch({
            action:"REMOVE"
        })
        successToast("Successfully Logged out!")
        navigate("/")
    }

    return(
        <>
            <h1>Chat Screen</h1>
            <button
            onClick={Logout}>Logout</button>
            <br></br>
            <Grid container
            style={{
                margin:"15px"
            }}>
                <Grid item xs={12} sm={12} md={4} lg={3}
                style={{
                    padding:"10px",
                    height:"65vh",
                    overflow:"scroll"
                }}>
                    
                    <br></br>
                    {
                        Object.entries(users).map((user)=>{
                            if(user[1].username!=state.username)
                            return(
                                <Grid container
                                style={{
                                    cursor:"pointer",
                                    border:"1px solid gray",
                                    padding:"10px",
                                    marginTop:"10px",
                                    borderRadius:"15px"
                                }}
                                onClick={()=>{
                                    getChats(user[1].username,user[1].name);
                                }}>
                                    <Grid item xs={3} sm={3} md={3} lg={3}>
                                    <img src={user[1].pic} style={{
                                        width:"50px",
                                        height:"50px",
                                        borderRadius:"50%",
                                        marginTop:"15px"
                                    }}/>
                                    </Grid>
                                    <Grid item xs={9} sm={9} md={9} lg={9}
                                    style={{
                                        textAlign:"right"
                                    }}>
                                        <h4>
                                            {user[1].name}
                                        </h4>
                                        <p
                                        style={{}}>{
                                            user[1].isOnline?
                                            "Online"
                                            :
                                            "Offline"
                                        }</p>
                                    </Grid>
                                </Grid>
                            )
                        })
                    }
                </Grid>
                <Grid item xs={12} sm={12} md={8} lg={9}>
                
                    {
                        selectedChat!=null
                        ?
                        <>
                            <div
                            style={{
                                margin:"20px",
                                padding:"10px",
                                border:"1px solid gray",
                                borderRadius:"15px",
                                maxHeight:"65vh",
                                overflow:"scroll"
                            }}>
                                <p>{selectedChatMessages[0].message + selectedChat}</p>
                                {
                                    selectedChatMessages.slice(1).map(
                                        (msg)=>{
                                            if(msg.sentBy==state.username)
                                            return(
                                                <Grid container>
                                                <Grid item xs={12} sm={12} md={12} lg={12}>
                                                <div
                                                style={{
                                                    marginTop:"15px",
                                                    border:"1px solid gray",
                                                    textAlign:"right",
                                                    borderRadius:"10px",
                                                    padding:"5px",
                                                    float:"right",
                                                    clear:"both"
                                                }}>
                                                <p>{msg.message}</p>
                                                <p
                                                style={{
                                                    color:colorMap[msg.status]
                                                }}>{statusMap[msg.status]}</p>
                                                </div>
                                                
                                                </Grid>
                                                
                                                </Grid>
                                                
                                            )
                                            else
                                            return(
                                                <Grid container>
                                                <Grid item xs={12} sm={12} md={12} lg={12}>
                                                <p
                                                style={{
                                                    border:"1px solid gray",
                                                    borderRadius:"10px",
                                                    padding:"5px",
                                                    textAlign:"right",
                                                    float:"left",
                                                    clear:"both"
                                                }}>{msg.message}</p>
                                                </Grid>
                                                
                                                </Grid>
                                            )
                                        }
                                    )
                                }
                                <textarea
                                style={{
                                    width:"75%",
                                    height:"30px",
                                    margin:"auto",
                                    borderRadius:"15px",
                                    marginTop:"10px"
                                }}
                                value={currentMessage}
                                onChange={(e)=>{
                                    setCurrentMessage(e.target.value)
                                }}></textarea>
                                <button
                                style={{
                                    marginLeft:"10px",
                                    width:"100px",
                                    height:"30px",
                                    verticalAlign:"90%"
                                }}
                                onClick={sendMessage}>Send</button>
                            </div>
                        </>
                        :
                        <>
                            <br></br>
                            <div
                            style={{
                                margin:"20px",
                                padding:"10px",
                                border:"1px solid gray",
                                borderRadius:"15px"
                            }}>
                                Nothing to show. Select on a person to chat
                            </div>
                        </>
                    }
                </Grid>
            </Grid>
        </>
    )
}

export default ChatScreen;