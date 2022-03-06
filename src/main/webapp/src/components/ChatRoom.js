import React from 'react'
import { useState } from 'react';
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
var stompClient = null;

export const ChatRoom = () => {
    const [publicChats, setpublicChats] = useState([]);
    const [privateChats, setprivateChats] = useState(new Map());
    const [userData, setUserData] = useState({
        username: '',
        receiverName: '',
        connected: false,
        messages: "",
    });

    const handleUserName = event => {
        const { value } = event.target;
        setUserData({ ...userData, username: value });
    }

    const registerUser = () => {
        let Sock = new SockJS("http://localhost:8080/ws");
        stompClient = over(Sock);
        stompClient.connect({}, onConnected, onError);
    }

    const onConnected = () => {
        setUserData({ ...userData, connected: true });
        stompClient.subscribe('/chatroom/public', onPublicMessageReceived);
        stompClient.subscribe('/user/' + userData.username + '/private', onPrivateMessageReceived);
    }

    const onPublicMessageReceived = (payload) => {
        let payloadData = JSON.parse(payload.body);
        switch (payloadData.status) {
            case "JOIN":
                if (!privateChats.get(payloadData.senderName)) {
                    privateChats.set(payloadData.senderName, []);
                    setprivateChats(new Map(privateChats));
                }
                break;
            case "MESSAGE":
                publicChats.push(payloadData);
                setpublicChats([...publicChats]);
                break;
            default:
                break;
        }
    }

    const onPrivateMessageReceived = payload => {
        let payloadData = JSON.parse(payload.body);
        if (privateChats.get(payloadData.senderName)) {
            privateChats.get(payloadData.senderName).push(payloadData);
            setprivateChats(new Map(privateChats));
        } else {
            let list = [];
            list.push(payloadData);
            privateChats.set(payloadData.senderName, list);
            setprivateChats(new Map(privateChats));

        }
    }


    return (
        <div className='container'>
            {userData.connected ?
                <div className='chat-box'>
                    <div className='member-list'>
                        <ul>
                            <li>Chatroom</li>
                            {[...privateChats.keys()].map((name, index) => {
                                <li className='member' key={index}>
                                    {name}
                                </li>
                            })}
                        </ul>
                    </div> 
                    <div className='chat-content'>
                        {publicChats.map((chat, index) => {
                            <li className='member' key={index}>
                                {chat.senderName != userData.username &&}    
                            </li>
                        })}
                        </div>
                    :
                    <div className='register'>
                        <input
                            id='user-name'
                            placeholder='enter user name'
                            value={userData.username}
                            onChange={handleUserName}
                        />
                        <button type='button'
                            onClick={registerUser}>connect</button>
                    </div>}
        </div>
    
    )
}
