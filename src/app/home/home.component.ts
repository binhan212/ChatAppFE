import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { User } from '../models/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  //userForm: FormGroup= new FormGroup({});
  //submitted = false;
  name="";
  user:User=new User();
  openChat=false;
  constructor(private formBuilder:FormBuilder,private chatService:ChatService){}
  ngOnInit(): void {
      //this.initialzeform()
  }
  // initialzeform(){
  //   this.userForm=this.formBuilder.group({
  //     name:['',Validators.required,Validators.minLength(3),Validators.maxLength(100)]
  //   })
  // }
  submitform(){
    // this.submitted=true;
    // if(this.userForm.valid){
    //   console.log(this.userForm.value);
    // }
    if(this.name.length>=3 && this.name.length<=100){
      this.user.name=this.name;
      this.chatService.registerUser(this.user).subscribe({
        next:()=>{
          // console.log("Open Chat");
          this.chatService.myName=this.name;
          this.openChat=true;
        }
      })
    }
  }
  closeChat(){
    this.openChat=false;
  }
}
