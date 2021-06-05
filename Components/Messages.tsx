import React, { version } from 'react';
import { Text,View,FlatList,ListRenderItem ,StyleSheet,TextInput,Image} from 'react-native'
import {NavigationContainer, RouteProp} from '@react-navigation/native'
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack'
import {group_item, messageInfoStackNavParamList, stackNavigationParamList, user} from '../interfaces/interfaces'
import {message} from '../interfaces/interfaces'
import constatnts from '../constants';
import * as SecureStore from 'expo-secure-store';
import LinearGradient from 'react-native-linear-gradient';
import {Icon, Input,Button} from 'react-native-elements'
// import {FiSend} from 'react-icons/fi'

interface Messages{
    flatListRef : FlatList<message>
}

interface HeaderProps{
    image : string,
    username : string,
    navigation : StackNavigationProp<stackNavigationParamList,"Messages">,
    group : group_item

}

const CustomHeader:React.FC<HeaderProps> = (props)=>{

    return(
        <View style={styles.headerView} >
            <Image source={{
                uri : "data:image/png;base64,"+ props.image
            }} style={styles.headerImage} />
            <View style={{alignSelf : "center",padding : 5}}>
                <Text style={styles.headerUsernameText}>{props.username}</Text>

            </View>
            <View style={{flexGrow : 1,padding : 5, display : 'flex',
                    flexDirection : 'row', justifyContent : 'flex-end' }}>
                <View >
                    <Button onPress ={ (e)=>props.navigation.navigate('GroupInfo',props.group) } type = {'clear'} icon = {<Icon name='users' type = 'feather' />} />
                    
                </View>

            </View>
         </View>
    )
}


const RequestPrompt : React.FC<{
    onRequestAccept : (group_id : number)=>void,
    request_id : number,
    requestStatus : State['requestStatus'],
    setRequestStatus : (status : State['requestStatus'])=>void
}> = (props)=> {

    const onAcceptPress = async ()=>{
        let token = await SecureStore.getItemAsync('jwtToken');
        let headers = new Headers({
            'Authorizaton' : `Bearer ${token}`,
            'Content-Type' : 'application/json'
        }) 
        props.setRequestStatus("sentToServer");
        fetch(constatnts.urlWithoutNip + 'requests/accept/' + props.request_id,
        {
            ...constatnts.postOption,
            headers : headers
        })
        .then(resp => {
            if(resp.status !== 200){
                throw new Error(resp.statusText);
            }
            return resp.json();
        })
        .then(data=>{
            props.onRequestAccept(props.request_id);
            props.setRequestStatus("notRequest"); 
        })
        .catch(err=>{
            console.log("Error occurred in processing request: ", err);
        })
        // props.setRequestStatus("sentToServer");
        // setTimeout(()=>{
        //     props.onRequestAccept(props.request_id);
        //     props.setRequestStatus("notRequest");
        // },3000);
    }

    const onShowPrompt = ()=>(
        <View>
            <Text style={{
                fontSize : 20,
                margin : 10
            }}>
                Accept Request? 
            </Text>
            <View style={{
                display : "flex",
                flexDirection : "row"
            }}>
                <Button title="Confirm" containerStyle={{
                    marginRight : 10 
                }} onPress={onAcceptPress}/>
                <Button title="Delete" containerStyle={{
                    marginLeft : 10
                }}/>
            </View>
        </View>
    )

    const onSentToServer = ()=>(
        <View>
            <Text>
                Processing Request. Hang on a second...
            </Text>
        </View>
    )

    return(
        <View style={{
            height : 100,
            display : "flex",
            alignItems : "center"
        }}>
            {props.requestStatus === "showPrompt" && onShowPrompt()}
            {props.requestStatus ==="sentToServer" && onSentToServer()}
        </View>
    )
}

interface Props{
    route : RouteProp<stackNavigationParamList,"Messages">,
    navigation : StackNavigationProp<stackNavigationParamList,"Messages">,
    messages : message[],
    user : user,
    addMessages : (group_id:number,messages:message[]) => void,
    sendMessage : (message : message) => void,
    selected : group_item,
    sendTypingEvent : (group_id : number)=>void,
    typing : boolean,
    resetSelected : ()=>void,
    onRequestAccept : (group_id : number)=>void
}
interface State{
    [key : number] : message[],
    value : string,
    requestStatus : "notRequest" | "showPrompt" | "sentToServer",
}


class Messages extends React.Component<Props,State>{

    constructor(props){
        super(props);
        this.state = {
            value : "",
            requestStatus : "notRequest"
        }
        this.flatListRef = null;
        this.setRequestStatus = this.setRequestStatus.bind(this);
        this.inputOnChange = this.inputOnChange.bind(this);
        this.rightIconOnClick = this.rightIconOnClick.bind(this);
        // this.GroupInfo = this.GroupInfo.bind(this);
        // this.MessageComp = this.MessageComp.bind(this);
        // this.MessageInfoStackNav = this.MessageInfoStackNav.bind(this);
    }

    setRequestStatus(status : State['requestStatus']){
        this.setState({
            requestStatus : status
        })
    }

    async componentDidMount(){
        this.setState({
            requestStatus : this.props.route.params.request ? "showPrompt" : "notRequest"
        })
        console.log("mounted");            
        this.props.navigation.setOptions({
            headerTitle : props => <CustomHeader group = {this.props.selected} navigation={this.props.navigation} username={this.props.selected.group_user_name}
            image={this.props.selected.image} {...props}
            />
        })
        let token = await SecureStore.getItemAsync('jwtToken');
        let headers = new Headers({
            'Authorizaton' : `Bearer ${token}`,
            'Content-Type' : 'application/json'
        })  
        if(this.props.messages === undefined){
            console.log("fetch");
            if(this.props.route.params.group_id < 0){
                this.props.addMessages(this.props.route.params.group_id,[]);
                return;
            }
            let url = constatnts.urlWithoutNip ;
            if(this.props.route.params.request){
                url += 'requests/' + this.props.route.params.group_id
            }
            else{
                url += 'groups/'+this.props.route.params.group_id;
            }
            fetch(url,{
                ...constatnts.getOption,
                headers : headers
            })
            .then(resp=>{
                if(resp.status !== 200){
                    throw new Error(resp.statusText);
                }
                return resp.json(); 
            })
            .then(data=>{
                // console.log(data);
                this.props.addMessages(this.props.route.params.group_id,data);
            })
            .catch(err=>{
                console.log(err);
            })
        }
        else{
            console.log("not found");

        }
    }

    componentWillUnmount(){
        console.log("unmount");
        this.props.resetSelected();
        
    }

    renderItem : ListRenderItem<message> = ({item,index})=>{
        // console.log(index);
        let date = new Date(item.sent_at);
        let next_message_time = date;
        if((index-1) > 0){
            next_message_time = new Date(this.props.messages[index - 1].sent_at);
            // console.log(next_message_time === date);
        }
        
        let show_date = !(date.getDate() === next_message_time.getDate() && date.getMonth() === next_message_time.getMonth());
        let h = date.getHours() > 12 ? date.getHours()-12:date.getHours();

        let flexDir,textAlign:object = styles.textAlignLeft;
        if(item.user_id === this.props.user.user_id){
            flexDir = styles.flexRight;
            textAlign = styles.textAlignRight;
        }
        else{
            flexDir = styles.flexLeft;
        }

        let showSeen:boolean = item.message_id === this.props.selected.lastseen;

        return(
            <View style={{
                display : "flex",
                flexDirection : "row"
            }}>
                <View style={{flexGrow : 1}}>
                    <View style={{...styles.messageContainer,...flexDir}}>
                        <View style={styles.paddingView}></View>
                        <View style={{
                            display : "flex",
                            flex:2, 
                            flexDirection : item.user_id === this.props.user.user_id ? "row" : "row-reverse"
                        }}>
                            <View style={styles.contentContainer}>
                                    <View style={{...textAlign,...styles.contentText}}>
                                        <Text style={styles.messageFontColor} >
                                            {item.message } 
                                        </Text>
                                        <Text style={
                                            {
                                                ...styles.timeTextColor,
                                                alignSelf : item.user_id === this.props.user.user_id ?
                                                    "flex-end" : "flex-start"
                                            }
                                            }>
                                            { (h < 10 ? "0"+h : h) + ":" + (date.getMinutes() < 10 ? "0"+ date.getMinutes() : date.getMinutes())
                                            + (date.getHours() > 12 ? ' pm' : ' am')}
                                        </Text>
                                    </View>
                                    <View>
                                </View>
                            </View>
                        </View>
                    </View>
                    { show_date && <Text style={{textAlign : "center"}}>
                        {next_message_time.getDate() + " " + next_message_time.toLocaleString('default',{month : "long"}) + " "
                        + next_message_time.getFullYear()} 
                    </Text>}
                </View>
                {
                    <View style={{ justifyContent: "flex-end"}}>
                        <Image source={{
                            uri: constatnts.image64Prefix + (showSeen ? this.props.selected.image : "")
                        }} style={{
                            height: 18,
                            width: 18,
                            borderRadius: 10,
                            marginBottom : show_date ? 25 : 10
                        }} />
                    </View>
                }
            </View>
        )
    }

    inputOnChange = (e) =>{
        if(e !== this.state.value){
            this.props.sendTypingEvent(this.props.selected.group_id);
        }
        // console.log(e)
        this.setState({
            value : e
        })
    }

    rightIconOnClick = ()=>{
        console.log("clicked");
        if(this.state.value.trim() === '') return;
        let message : message = {
            message : this.state.value,
            user_id : this.props.user.user_id,
            sent_at : Date().toString(),
            message_id : ++constatnts.sent,
            group_id : this.props.selected.group_id,
            username : this.props.user.username
        }
        this.setState({
            value : ""
        })
        this.props.sendMessage(message);

    }


    // MessageComp:React.FC<{
    //     messages : message[],
    //     requestStatus : "notRequest" | "showPrompt" | "sentToServer",
    //     group_id : number,
    //     typing : boolean,
    //     selected : group_item,
    //     value : string,
    //     navigation : StackNavigationProp<messageInfoStackNavParamList,'Messages'>

    // }> = (props) =>{
    //     return (
    //         // <View>

    //         // </View>
    //         <LinearGradient colors={['#d7ddd5','#0a8fa3']} style={{height : "100%"}} >
    //             <FlatList<message> renderItem={this.renderItem} data={props.messages} 
    //             keyExtractor={message => message.message_id.toString()} style = {styles.flatist}
    //             ref={ref=>this.flatListRef = ref}
    //             inverted
    //             />
    //             {props.requestStatus !== "notRequest" ? (<RequestPrompt
    //             request_id={props.group_id} 
    //             onRequestAccept={this.props.onRequestAccept}
    //             requestStatus ={props.requestStatus}
    //             setRequestStatus = {this.setRequestStatus}
    //             />) : 
    //                 (<View>
    //                     <Text>
    //                         {props.typing &&
    //                         <Text> {`${props.selected.group_user_name} is typing...`} </Text>
    //                         }
    //                     </Text>
    //                     <Input placeholder="Enter Message" 
    //                     rightIcon={
    //                     <Icon onPress={this.rightIconOnClick}  name="paper-plane-o" type="font-awesome" color="white"
    //                     iconStyle={styles.rightIconStyle} />
    //                     }
    //                     inputContainerStyle={{...styles.inputStyle}} 
    //                     value={props.value}
    //                     onChangeText={this.inputOnChange} style={{color : "white"}} 
    //                     placeholderTextColor="white" 
    //                     multiline={true} 
    //                     />
    //                 </View>)
    //             }
    //         </LinearGradient>
    //     )
    // }

    // GroupInfo: React.FC<{
        
    // }> = (props)=>{
    //     return(
    //         <View>
    //             <Text>
    //                 Group Info
    //             </Text>
    //         </View>
    //     )
    // }

    // MessageInfoStackNav:React.FC<{
    //     messages : message[],
    //     requestStatus : "notRequest" | "showPrompt" | "sentToServer",
    //     group_id : number,
    //     typing : boolean,
    //     selected : group_item,
    //     value : string
    // }> = (props)=>{
    //     const Stack = createStackNavigator<messageInfoStackNavParamList>();
    //     const MessageComp = this.MessageComp;
    //     return (
    //         // <View>
    //         //     <Text>sdf</Text>
    //         // </View>
    //         <NavigationContainer independent = {true}>
    //             <Stack.Navigator initialRouteName = 'Messages'>
    //                 <Stack.Screen name='Messages' >
    //                    {prs => <MessageComp {...props} {...prs} />}
    //                 </Stack.Screen>
    //                 <Stack.Screen name = 'GroupInfo' component = {this.GroupInfo}/>
    //             </Stack.Navigator>
    //         </NavigationContainer>
    //     )
    // }

    render(){


        return(
            // <this.MessageInfoStackNav messages = {this.props.messages} requestStatus = {this.state.requestStatus}
            // group_id = {this.props.route.params.group_id} typing = {this.props.typing} selected = {this.props.selected} value = {this.state.value} />
            <LinearGradient colors={['#d7ddd5','#0a8fa3']} style={{height : "100%"}} >
                <FlatList<message> renderItem={this.renderItem} data={this.props.messages} 
                keyExtractor={message => message.message_id.toString()} style = {styles.flatist}
                ref={ref=>this.flatListRef = ref}
                inverted
                />
                {this.state.requestStatus !== "notRequest" ? (<RequestPrompt
                request_id={this.props.route.params.group_id} 
                onRequestAccept={this.props.onRequestAccept}
                requestStatus ={this.state.requestStatus}
                setRequestStatus = {this.setRequestStatus}
                />) : 
                    (<View>
                        <Text>
                            {this.props.typing &&
                            <Text> {`${this.props.selected.group_user_name} is typing...`} </Text>
                            }
                        </Text>
                        <Input placeholder="Enter Message" 
                        rightIcon={
                        <Icon onPress={this.rightIconOnClick}  name="paper-plane-o" type="font-awesome" color="white"
                        iconStyle={styles.rightIconStyle} />
                        }
                        inputContainerStyle={{...styles.inputStyle}} 
                        value={this.state.value}
                        onChangeText={this.inputOnChange} style={{color : "white"}} 
                        placeholderTextColor="white" 
                        multiline={true} 
                        />
                    </View>)
                }
            </LinearGradient>
        )
    }

}

let styles = StyleSheet.create({
    flatist : {
        display : "flex",
        // backgroundColor : "linear-gradient(0deg, hsla(188, 88%, 34%, 1) 0%, hsla(105, 11%, 85%, 1) 100%);"
    },
    messageContainer : {
        // backgroundColor : "white"
    },
    flexRight : {
        display : "flex",
        flexDirection : "row"
    },
    flexLeft : {
        display : "flex",
        flexDirection:"row-reverse"
    },
    paddingView : {
        flex : 1
    },
    contentContainer : {
        flex : 3,
        padding : 2,
        margin : 2,
        // backgroundColor : "red"
    },
    textAlignRight : {
        alignSelf : "flex-end",
        backgroundColor : 'rgb(64, 127, 243)',
    },
    textAlignLeft : {
        alignSelf : "flex-start",
        backgroundColor : "#0A40A4",
        marginLeft : 10
    },
    contentText : {
        padding : 10,
        borderRadius : 10,
        color : "white",
        display : "flex"
    },
    inputStyle : {
        // backgroundColor : "red"
        borderColor : "white"
    },
    rightIconStyle : {
        padding : 10
    },
    messageFontColor :{
        color : "white"
    },
    timeTextColor : {
        color : "#33F9B8",
        fontSize : 11,
    },
    dateText : {

    },
    headerImage : {
        width : 50,
        height : 50,
        borderRadius : 15,
        borderWidth : 2,
        borderColor : "white"
    },
    headerView : {
        display : "flex",
        flexDirection : "row",
    },
    headerStyle : {
        backgroundColor : "#d7ddd5"
    },
    headerUsernameText : {
        fontWeight : "bold",
        fontSize : 14
    }
})


export default Messages;