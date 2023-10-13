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


/*
* Created by Pankush Manchanda 15,January 2017
* Http Interceptor to add diffrent function to http request like passing option in every request
* Advantage : Used to remove the code duplication
*/

import { Injectable } from '@angular/core';
import { ConnectionBackend, RequestOptions, Request, RequestOptionsArgs, Response, Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { environment } from '../environments/environment';
import { AuthService } from './services/authentication/auth.service';
import { ConfirmationDialogsService } from './services/dialog/confirmation.service';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { SocketService } from './services/socketService/socket.service';

@Injectable()
export class SecurityInterceptedHttp extends Http {
    token: any;
    onlineFlag: boolean = true;
    count = 0;
    _count = 0;
    constructor(backend: ConnectionBackend, defaultOptions: RequestOptions
        , private router: Router, private authService: AuthService, private message: ConfirmationDialogsService, private socketService: SocketService) {
        super(backend, defaultOptions);
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        // url = this.updateUrl(url);
        let URL = this.updateURL(url);
        if (this.networkCheck()) {
            return super.get(URL, this.getRequestOptionArgs(options)).catch(this.onCatch)
                .do((res: Response) => {
                    this.onSuccess(res);
                }, (error: any) => {
                    this.onError(error);
                })
                .finally(() => {
                    this.onEnd();
                });
        }
        else {
            return Observable.empty();
        }
    }

    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        // url = this.updateUrl(url);
        let URL = this.updateURL(url);
        if (this.networkCheck()) {
            return super.post(URL, body, this.getRequestOptionArgs(
                options
            )).catch(
                this.onCatch
                ).do(
                (res: Response) => {
                    this.onSuccess(res);
                }, (error: any) => {
                    this.onError(error);
                })
                .finally(() => {
                    this.onEnd();
                });
        }
        else {
            return Observable.empty();
        }
    }

    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        // url = this.updateUrl(url);
        let URL = this.updateURL(url);
        if (this.networkCheck()) {
            return super.put(URL, body, this.getRequestOptionArgs(options)).catch(this.onCatch).do((res: Response) => {
                this.onSuccess(res);
            }, (error: any) => {
                this.onError(error);
            })
                .finally(() => {
                    this.onEnd();
                });
        }
        else {
            return Observable.empty();
        }
    }

    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        // url = this.updateUrl(url);
        let URL = this.updateURL(url);
        if (this.networkCheck()) {
            return super.delete(URL, this.getRequestOptionArgs(options)).catch(this.onCatch).do((res: Response) => {
                this.onSuccess(res);
            }, (error: any) => {
                this.onError(error);
            })
                .finally(() => {
                    this.onEnd();
                });
        }
        else {
            return Observable.empty();
        }
    }

    // private updateUrl(req: string) {
    //     return environment.origin + req;
    // }

    private getRequestOptionArgs(options?: RequestOptionsArgs): RequestOptionsArgs {
        if (options == null) {
            options = new RequestOptions();
        }
        if (options.headers == null) {
            options.headers = new Headers();
        }
        options.headers.append('Content-Type', 'application/json');
        options.headers.append('Access-Control-Allow-Origin', '*');
        options.headers.append('Authorization', this.authService.getToken());
        return options;
    }
    private onEnd(): void {
    }
    private onSuccess(response: any) {
        if (response.json().data) {
            // this._count = 0;
            return response;

        } else if (response.json().statusCode === 5002 && response.json().status != 'User login failed') {
            //   this.authService.cZentrixLogout();

            localStorage.removeItem('key');
            localStorage.removeItem('onCall');
            this.router.navigate(['']);
            // if (this._count == 0) {
                this.message.alert(response.json().errorMessage, 'error');
            //     this._count = this._count + 1;
            // }
            this.authService.removeToken();
            // this.socketService.logOut();
            return Observable.empty();
        } else if (response.json().statusCode === 5002 && response.json().status === 'User login failed') {
            //   this.authService.cZentrixLogout();

            localStorage.removeItem('key');
            localStorage.removeItem('onCall');
            this.router.navigate(['']);
            this.message.alert(response.json().errorMessage, 'error');
            this.authService.removeToken();
            // this.socketService.logOut();
            return Observable.empty();
        } else {
            throw response;
        }
    }
    private onError(error: any) {
        return error;
    }

    private onCatch(error: any, caught?: Observable<Response>): Observable<Response> {
        // return Observable.throw(error);
        return Observable.throw(error);
    }

    private networkCheck(): boolean {

        if (!this.onlineFlag) {
            // if (this.count === 0) {
                this.message.alert("You are offline. Please check");
            //     this.count++;
            // }
            return false;
        }
        else {
            this.count = 0;
            return true;
        }
    }
    private updateURL(url) {
        if(sessionStorage.getItem('apiman_key') != undefined || sessionStorage.getItem('apiman_key') != null) {
            let updatedURL = url + '?apikey=' + sessionStorage.getItem('apiman_key');
            return updatedURL;
        } else {
            return url;
        }
    }
}
