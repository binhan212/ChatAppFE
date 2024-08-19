import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/enviroments/enviroment';
import { User } from '../models/user';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Message } from '../models/message';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PrivateChatComponent } from '../private-chat/private-chat.component';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  myName:string="";
  private chatConnection?:HubConnection;
  onlineUsers:string[]=[];
  messages:Message[]=[];
  privateMessages:Message[]=[];
  privateMesageInitiated = false;
  constructor(private httpClient:HttpClient, private modalService:NgbModal) { }
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
      this.privateMesageInitiated=true;
      const modalRef=this.modalService.open(PrivateChatComponent);
      modalRef.componentInstance.toUser=newMessage.from;
    })
    this.chatConnection.on("OpenPrivateChat",(newMessage:Message)=>{
      this.privateMessages=[...this.privateMessages,newMessage]
    })
    this.chatConnection.on("RecivePrivateMessage",(newMessage:Message)=>{
      this.privateMessages=[...this.privateMessages,newMessage]
    })
    this.chatConnection.on("ClosePrivateChat",()=>{
      this.privateMesageInitiated=false;
      this.privateMessages=[];
      this.modalService.dismissAll();
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
  async sendPrivateMessage(to:string,content:string){
    const message:Message={
      from:this.myName,
      to,
      content:content
    }
    if(!this.privateMesageInitiated){
      this.privateMesageInitiated=true;
      return this.chatConnection?.invoke("CreatePrivateChat",message)
      .then(()=>{
        this.privateMessages=[...this.privateMessages,message]
      })
      .catch(er=>console.log(er));
    }
    else{
      return this.chatConnection?.invoke("ReceivePrivateMessage",message)
      .catch(er=>console.log(er));
    }
  }
  async closePrivateChatMessage(otherUser:string){
    return this.chatConnection?.invoke('RemovePrivateChat',this.myName,otherUser)
    .catch(er=>console.log(er))
  }
}
