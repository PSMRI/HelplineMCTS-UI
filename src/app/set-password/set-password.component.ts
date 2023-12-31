/* 
* AMRIT – Accessible Medical Records via Integrated Technology 
* Integrated EHR (Electronic Health Records) Solution 
*
* Copyright (C) "Piramal Swasthya Management and Research Institute" 
*
* This file is part of AMRIT.
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see https://www.gnu.org/licenses/.
*/


import { Component, OnInit } from '@angular/core';
import { HttpServices } from '../services/http-services/http_services.service';
import { dataService } from '../services/dataService/data.service';
import { Router } from '@angular/router';
import { ConfigService } from '../services/config/config.service';
import { ConfirmationDialogsService } from '../services/dialog/confirmation.service';
import { MdDialog } from '@angular/material';
import { loginService } from 'app/services/loginService/login.service';
import { AuthService } from 'app/services/authentication/auth.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.css']
})
export class SetPasswordComponent implements OnInit {

  constructor(
    public http_calls: HttpServices,
    public getUserData: dataService,
    private configService: ConfigService,
    private authService: AuthService,
    public router: Router, private alertService: ConfirmationDialogsService, public dialog: MdDialog, public loginservice: loginService) { 
            this._keySize = 256;
            this._ivSize = 128;
            this._iterationCount = 1989;
    }

  ngOnInit() {
  }

  newpwd: any;
  confirmpwd: any;

  uname: any = this.getUserData.uname;
  key: any;
  iv: any;
  SALT: string = "RandomInitVector";
  Key_IV: string = "Piramal12Piramal";
  encPassword: string;
  _keySize: any;
  _ivSize: any;
  _iterationCount: any;
  encryptedConfirmPwd : any;
  password:any;

  dynamictype_one: any = "password";
  dynamictype_two: any = "password";

  passwordPattern = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,12}$/;

  showPWD_one() {
    this.dynamictype_one = 'text';
  }
showPWD_two() {
    this.dynamictype_two = 'text';
  }
  hidePWD() {
    this.dynamictype_one = 'password';
    this.dynamictype_two = 'password';
  }

  get keySize() {
		return this._keySize;
	  }
	
	  set keySize(value) {
		this._keySize = value;
	  }
	
	
	
	  get iterationCount() {
		return this._iterationCount;
	  }
	
	
	
	  set iterationCount(value) {
		this._iterationCount = value;
	  }
	
	
	
	  generateKey(salt, passPhrase) {
		return CryptoJS.PBKDF2(passPhrase, CryptoJS.enc.Hex.parse(salt), {
      hasher: CryptoJS.algo.SHA512,
		  keySize: this.keySize / 32,
		  iterations: this._iterationCount
		})
	  }
	
	
	
	  encryptWithIvSalt(salt, iv, passPhrase, plainText) {
		let key = this.generateKey(salt, passPhrase);
		let encrypted = CryptoJS.AES.encrypt(plainText, key, {
		  iv: CryptoJS.enc.Hex.parse(iv)
		});
		return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
	  }
	
	  encrypt(passPhrase, plainText) {
		let iv = CryptoJS.lib.WordArray.random(this._ivSize / 8).toString(CryptoJS.enc.Hex);
		let salt = CryptoJS.lib.WordArray.random(this.keySize / 8).toString(CryptoJS.enc.Hex);
		let ciphertext = this.encryptWithIvSalt(salt, iv, passPhrase, plainText);
		return salt + iv + ciphertext;
	  }

  updatePassword(new_pwd) {
    let transactionId=this.loginservice.transactionId;
    this.password = this.encrypt(this.Key_IV, new_pwd)
		this.encryptedConfirmPwd=this.encrypt(this.Key_IV, this.confirmpwd)
    if (new_pwd === this.confirmpwd) {
      this.http_calls.postData(this.configService.getCommonBaseURL() + 'user/setForgetPassword',
        { 'userName': this.uname, 'password': this.password, 'transactionId': transactionId }
      ).subscribe(
        (response: any) =>{if (response !== undefined && response !== null)this.successCallback(response)
         },
          (error: any) => {
            
            this.alertService.alert(error.errorMessage, 'error');
            this.router.navigate(['/resetPassword']);
        },
        this.loginservice.transactionId=undefined
        );
    }
    else {
      this.alertService.alert('Passwords does not match', 'error');
    }
  }

  successCallback(response) {

    console.log(response);
    this.alertService.alert('Password changed successfully', 'success');
    this.loginservice.userLogout().subscribe((response) => { if (response !== undefined && response !== null) {
      this.router.navigate(['']);
      this.authService.removeToken();
    }
  });
 
  }
  errorCallback(response) {
    console.log(response);
  }


}
