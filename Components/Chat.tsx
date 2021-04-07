import React, { ReactNode } from 'react';
import {View,Text,ScrollView,Image,StyleSheet,SafeAreaView} from 'react-native'
import constants from '../constants'
import * as SecureStore from 'expo-secure-store';
import constatnts from '../constants';
import {group_item,user,stackNavigationParamList, message,drawerNavigationParamList} from '../interfaces/interfaces';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack'
import Contact from './contact'
import Messages from './Messages';
import NewGroup from './newGroup';
import socketIOClient from "socket.io-client";
import {createDrawerNavigator} from '@react-navigation/drawer'
import SearchUser from './SearchUsers'
const SOCKET_ENDPOINT = constants.urlWithoutNip;
let socket; 


interface State{
    groups : group_item[],
    user : user,
    selected : group_item,
    [key : number] : message[],
    token : string,
    typing : boolean,
    requests : group_item[]
}

interface Props{

}

// interface Chat {
//     typingEventFlag : boolean
// }

class Chat extends React.Component<Props,State>{
    
    typingEventFlag : boolean;
    constructor(props){
        super(props);
        this.state = {
            groups : [],
            user : null,
            selected : {
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
            },
            token : null,
            typing : false,
            requests : []
        }
        this.changeSelected = this.changeSelected.bind(this);
        this.addMessages = this.addMessages.bind(this);
        this.addMessage = this.addMessage.bind(this);
        this.getToken = this.getToken.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.modifyMessage = this.modifyMessage.bind(this);
        this.sendTypingEvent = this.sendTypingEvent.bind(this);
        this.updateSeen = this.updateSeen.bind(this);
        this.typingEventFlag = false;
        this.resetSelected = this.resetSelected.bind(this);
        this.updateInactive = this.updateInactive.bind(this);
        this.updateActive = this.updateActive.bind(this);
        this.ContactAndMessages = this.ContactAndMessages.bind(this);
        this.DrawerNavigation = this.DrawerNavigation.bind(this);
        this.addRequestContact = this.addRequestContact.bind(this);
        this.modifyRequestGroup = this.modifyRequestGroup.bind(this);
        this.onRequestAccept = this.onRequestAccept.bind(this);

    }

    async getToken():Promise<string>{
        if(this.state.token) return this.state.token;
        let token = await SecureStore.getItemAsync('jwtToken');
        this.setState({
            token : token
        })
        // console.log(token);
        return token;
    }

    changeSelected(group:group_item){
        let moddedItem : group_item = null;
        this.setState(old=>{
            let groups = old.groups.map(item=>{
                if(group.group_id !== item.group_id) return item;
                if(item.userlastseen !== item.lastmessageid){
                    socket.emit('message-seen',{group_id:item.group_id});
                }
                moddedItem = {
                    ...item,
                    bold : false,
                    userlastseen : item.lastmessageid
                }
                return moddedItem;
            })
            let requests = old.requests;
            if(!moddedItem){
                requests = requests.map(request=>{
                    if(request.group_id !== group.group_id) 
                        return request;
                    moddedItem = {
                        ...group,
                        bold : false
                    }
                    return moddedItem;
                })
            }
            let selected = moddedItem ? moddedItem : old.selected ;
            return({
                groups : groups,
                selected : selected,
                requests : requests
            })
        })
    }

    addMessages(group_id:number,messages:message[]){
        console.log(messages);
        this.setState(old=>({
            [group_id] : messages.reverse()
        }))
    }

    addMessage(message:message){
        let group_id = message.group_id;
        let updatedGroup:group_item;
        this.setState(old=>({
            [group_id] : old[group_id] ? [message ,...old[group_id]] : old[group_id],
            groups : old.groups.map(group=>{
                if(group.group_id !== group_id){
                    return group;
                }
                let userlastseen = group.userlastseen;
                if(group.group_id === old.selected.group_id){
                    userlastseen = message.message_id;
                    if(message.user_id !== old.user.user_id){
                        socket.emit('message-seen',{group_id:message.group_id});
                    }
                }
                let bold = message.group_id !== old.selected.group_id;
                let lastseen = (message.user_id !== old.user.user_id) ? message.message_id : group.lastseen;
                updatedGroup = {
                    ...group,
                    lastmessageid : message.message_id,
                    last_message_user_id : message.user_id,
                    userlastseen : userlastseen,
                    message : message.message,
                    bold : bold,
                    lastseen : lastseen
                }
                return updatedGroup;
            }),
            selected : old.selected.group_id === message.group_id ? updatedGroup : old.selected
        }));
    }

    updateSeen(data){
        let updatedGroup : group_item = null;
        this.setState(old=>({
            groups : old.groups.map(group=>{
                if(group.group_id !== data.group_id) return group;
                updatedGroup  = {
                    ...group,
                    lastseen : data.lastSeen
                }
                
                return updatedGroup;
            }),
            selected : (updatedGroup && updatedGroup.group_id === old.selected.group_id) ? 
                            updatedGroup : old.selected
        }))
    }

    async sendMessage(message:message){
        this.addMessage(message);
        let headers = new Headers({
            'Authorizaton' : `Bearer ${await this.getToken()}`,
            'Content-Type' : 'application/json'
        })    
        fetch(constatnts.urlWithoutNip+'groups/'+message.group_id,{
            ...constants.postOption,
            headers : headers,
            body : JSON.stringify({
                message : message.message,
                sendingId : message.message_id
            })
        })
        .then(resp=>{
            if(resp.status !== 200){
                throw new Error(resp.statusText);
            }
            return resp.json();
        })
        .then(data=>{
            if(data.request){
                this.modifyRequestGroup(parseInt(data.request),data.group_id);
                
            }
             this.modifyMessage(data.group_id,data.sendingId,data.message_id);
        })
        .catch(err=>{
            console.log(err)
        })
    }

    modifyRequestGroup(group_id:number,new_group_id:number){
        this.setState(old=>({
            groups : old.groups.map(group=>{
                if(group.group_id !== group_id) return group;
                return({
                    ...group,
                    group_id : new_group_id
                })
            }),
            [new_group_id] : []
        }))
    }

    modifyMessage(group_id : number , sendingId : string,message_id : number){
        this.setState(old=>{
            return({
                [group_id] : old[group_id].map(message=>{
                    if(message.message_id === sendingId) return {...message,message_id:message_id}
                    return message;
                })
            })
        })
    }

    sendTypingEvent(group_id:number){
        if(this.typingEventFlag) return;
        this.typingEventFlag = true;
        setTimeout(()=>{
            this.typingEventFlag = false;
        },1000);
        socket.emit('typing',{group_id:group_id});
    }
    

    addRequestContact(contact:group_item){
        this.setState(old=>{
            let groups: group_item[];
            let f = old.groups.some(group=>group.group_id === contact.group_id) || old.requests.some(request => request.group_id === contact.group_id);
            if(f) groups = old.groups;
            else{
                groups = [contact,...old.groups];
            }
            this.setState({
                groups : groups
            })

        })
    }

    onRequestAccept(group_id : number){
        // fetch(constatnts.urlWithoutNip + 'requests/accept/' + group_id,constatnts.postOption)
        // .then(resp => {
        //     if(resp.status !== 200){
        //         throw new Error(resp.statusText);
        //     }
        //     return resp.json();
        // })
        // .then(data=>{
            let request : group_item = undefined ;
            this.setState(old=>({
                requests : old.requests.filter(group=>{
                    if(group.group_id !== group_id) return true;
                    request = group;
                    return false;
                }),
                groups : request ? [request, ... old.groups] : old.groups
            }))
        // })
        // .catch(err=>{
        //     console.log("Error occurred in processing request: ", err);
        // })
        
        
    }

    async componentDidMount(){
        let token;
        if(this.state.token){
            token = this.state.token;
        }
        else{
            token = await SecureStore.getItemAsync('jwtToken');
            this.setState({
                token : token
            })
        }

        let headers = new Headers({
            'Authorizaton' : `Bearer ${token}`,
            'Content-Type' : 'application/json'
        })    
        socket = socketIOClient (SOCKET_ENDPOINT, {
            query : {token}
        })

        socket.on('new-message',(data:message)=>{
            this.addMessage(data);
        })
        socket.on('update-seen',data=>{
            this.updateSeen(data);
        })
        socket.on('typing',data=>{
            if(data.group_id === this.state.selected.group_id){
                if(!this.state.typing){
                    this.setState({typing : true});
                    setTimeout(()=>this.setState({typing : false}),2000);
                }
            }
        });

        socket.on('new-inactive',data=>this.updateInactive(data.user_id));
        socket.on('new-active',data=>this.updateActive(data.user_id));

        fetch(constatnts.urlWithoutNip+'groups',{
            ...constatnts.getOption,
            headers : headers
        })
        .then(resp => {
            console.log(resp.statusText);
            console.log(resp.status);
            if(resp.status === 200){
                return resp.json();
            }
            throw new Error(resp.statusText);
        })
        .then(data=>{
            // console.log(data);
            this.setState({
                groups : data.groups,
                user : data.user
            })
        })
        .catch(err=>{
            console.log(err);
        })
        fetch(constatnts.urlWithoutNip+'requests',{
            ...constatnts.getOption,
            headers : headers
        })
        .then(resp => {
            console.log(resp.statusText);
            console.log(resp.status);
            if(resp.status === 200){
                return resp.json();
            }
            throw new Error(resp.statusText);
        })
        .then(data=>{
            // console.log(data);
            this.setState({
                requests : data
            })
        })
        .catch(err=>{
            console.log(err);
        })
    }

    resetSelected(){
        this.setState({
            selected : constatnts.defaultGroup
        })
    }

    updateInactive(user_id : number){
        let updatedGroup : group_item = null;
        this.setState(old=>({
            groups : old.groups.map(group=>{
                if(group.name_user_id !== user_id) return group;
                updatedGroup = {
                    ...group,
                    active : false
                }
                return updatedGroup;
            }),
            selected : (updatedGroup && updatedGroup.group_id === old.selected.group_id) ? updatedGroup : old.selected
        }))
    }

    updateActive(user_id : number){
        let updatedGroup : group_item = null;
        this.setState(old=>({
            groups : old.groups.map(group=>{
                if(group.name_user_id !== user_id) return group;
                updatedGroup = {
                    ...group,
                    active : true
                }
                return updatedGroup;
            }),
            selected : (updatedGroup && updatedGroup.group_id === old.selected.group_id) ? updatedGroup : old.selected
        }))
    }

    ContactAndMessages(){
        const Stack = createStackNavigator<stackNavigationParamList>();
        return(
            <NavigationContainer independent={true}  >
                <Stack.Navigator initialRouteName="contactList" screenOptions={{
                    headerStyle : styles.headerStyle
                }}  >
                    <Stack.Screen name="contactList" options={{title : "Turtle Chat"}} >
                        {props=>
                        <Contact {...props} groups={this.state.groups} user={this.state.user} requests={this.state.requests}
                        changeSelected={this.changeSelected} />
                        }
                    </Stack.Screen>
                    <Stack.Screen name="Messages" initialParams={{
                        group_id : -1
                    }}>
                        {props =>
                            <Messages {...props} messages = {this.state[this.state.selected.group_id]}
                            user = {this.state.user} addMessages={this.addMessages} selected={this.state.selected}
                            sendMessage = {this.sendMessage} sendTypingEvent={this.sendTypingEvent}
                            typing = {this.state.typing} resetSelected = {this.resetSelected} 
                            onRequestAccept = {this.onRequestAccept}/>
                        }
                    </Stack.Screen>
                </Stack.Navigator>
            </NavigationContainer>
            
        )
    }

    DrawerNavigation(){
        const Drawer = createDrawerNavigator<drawerNavigationParamList>();

        return (
            <NavigationContainer independent={true}>
                <Drawer.Navigator initialRouteName="NewGroup">
                <Drawer.Screen name = "Chat" >
                    {props=> <this.ContactAndMessages /> }
                </Drawer.Screen>
                <Drawer.Screen name = "SearchUsers">
                    {props=><SearchUser addRequestContact={this.addRequestContact} {...props}  />}
                </Drawer.Screen>
                <Drawer.Screen name="NewGroup" component={NewGroup} />
                </Drawer.Navigator>
            </NavigationContainer>
  );
    }

    render():ReactNode{
        console.log(this.state.groups);
        return(
            <this.DrawerNavigation />
        )
        // const Stack = createStackNavigator<stackNavigationParamList>();
        // return(
        //     <NavigationContainer independent={true}  >
        //         <Stack.Navigator initialRouteName="contactList" screenOptions={{
        //             headerStyle : styles.headerStyle
        //         }}  >
        //             <Stack.Screen name="contactList" options={{title : "Turtle Chat"}} >
        //                 {props=>
        //                 <Contact {...props} groups={this.state.groups} user={this.state.user}
        //                 changeSelected={this.changeSelected} />
        //                 }
        //             </Stack.Screen>
        //             <Stack.Screen name="Messages" initialParams={{
        //                 group_id : -1
        //             }}>
        //                 {props =>
        //                     <Messages {...props} messages = {this.state[this.state.selected.group_id]}
        //                     user = {this.state.user} addMessages={this.addMessages} selected={this.state.selected}
        //                     sendMessage = {this.sendMessage} sendTypingEvent={this.sendTypingEvent}
        //                     typing = {this.state.typing} resetSelected = {this.resetSelected} />
        //                 }
        //             </Stack.Screen>
        //         </Stack.Navigator>
        //     </NavigationContainer>
            
        // )
    }
}
let styles = StyleSheet.create({
    container : {
        width:"100%",
        padding : "2%"  
    },
    headerStyle : {
        backgroundColor : "#d7ddd5"
    }
})

export default Chat;