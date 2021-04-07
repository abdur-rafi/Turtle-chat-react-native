import {group_item} from './interfaces/interfaces';
interface GetOption{
    method : RequestInit['method'],
    mode : RequestInit['mode'],
    credentials : RequestInit['credentials'],
    cache : RequestInit['cache']
}

interface postOption{
    method : RequestInit['method'],
    mode : RequestInit['mode'],
    credentials : RequestInit['credentials'],
    cache : RequestInit['cache']
}

interface Constants{

    url : string,
    getOption:GetOption,
    postOption : postOption,
    urlWithoutNip : string,
    sent : number,
    image64Prefix : string,
    defaultGroup : group_item
}

let constatnts : Constants = {
    // url : "http://192.168.0.102.nip.io:3000/",
    url : "https://turtle-chat-server.herokuapp.com/",
    getOption : {
        method:"GET",
        cache : "default",
        credentials : "include",
        mode : "cors"
    },
    // urlWithoutNip : "http://192.168.0.102:3000/",
    urlWithoutNip : "https://turtle-chat-server.herokuapp.com/",
    sent : 1,
    postOption : {
        method:"POST",
        cache : "default",
        credentials : "include",
        mode : "cors"
    },
    image64Prefix : "data:image/png;base64,",
    defaultGroup : {
        group_id : -1,
        bold : false,
        active : false,
        group_user_name : null,
        image : null,
        last_message_user_id : -1,
        lastmessageid : -1 ,
        lastseen : -1,
        message : null,
        name_user_id : -1,
        req : -1,
        userlastseen : -1,
        last_time : null
    }
}

export default constatnts;