import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/enviroments/enviroment';
import { User } from '../models/user';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  myName:string="";
  private chatConnection?:HubConnection;
  onlineUsers:string[]=[];
  messages:Message[]=[];
  constructor(private httpClient:HttpClient) { }
  registerUser(user:User){
    return this.httpClient.post(`${enviroment.apiUrl}api/chat/register-user`,user,{responseType:'text'});
  }
  createChatConnection(){
    this.chatConnection = new HubConnectionBuilder().withUrl(`${enviroment.apiUrl}hubs/chat`).withAutomaticReconnect().build();
    this.chatConnection.start().catch(er=>{
      console.log(er);
    })
    this.chatConnection.on("UserConnected",()=>{
      //console.log("the server has called here!")
      this.addUserConnectionId();
    })
    this.chatConnection.on("OnlineUsers",(onlineUsers)=>{
      this.onlineUsers=[...onlineUsers]
      //console.log("the server has called here!")
      //this.addUserConnectionId();
    })
    this.chatConnection.on("NewMessage",(newMessage:Message)=>{
      this.messages=[...this.messages,newMessage]
    })
  }

  stopChatConnection(){
    this.chatConnection?.stop().catch(er=>console.log(er));
  }
  addUserConnectionId(){
    return this.chatConnection?.invoke('AddUserConnectionId',this.myName)
    .catch(er=>console.log(er))
  }

  async sendMessage(content:string){
    const message:Message={
      from:this.myName,
      content:content
    }
    return this.chatConnection?.invoke("ReceiveMessage",message)
    .catch(er=>console.log(er));
  }
}
