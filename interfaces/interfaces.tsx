export interface group_item{
    group_id : number,
    bold : boolean,
    active : boolean,
    group_user_name : string,
    image : string,
    last_message_user_id : number,
    lastmessageid : number | string,
    lastseen : number | string,
    message : string,
    name_user_id : number,
    req : number,
    userlastseen : number | string,
    last_time : string
}

export interface user{
    user_id : number,
    image : string,
    username : string
}
export interface message{
    group_id : number,
    message : string,
    message_id : number | string,
    sent_at : string,
    user_id : number,
    username : string
} 

export type stackNavigationParamList = {
    contactList : undefined;
    Messages : {
        group_id : number,
        request : boolean
    }
}

export type drawerNavigationParamList = {
    Chat : undefined,
    SearchUsers : undefined,
    NewGroup : undefined
}

export interface searchUsersResponse{
    user_id : number,
    username : string,
    image : string
}

export type tabNavigatorProps = {
    Contact : undefined,
    Requests : undefined
}

export type CredentialState = 'searchingToken' | 'tokenFound' | 'noTokenFound' | 'invalidToken' | 'showLinks' | 'loggedIn';