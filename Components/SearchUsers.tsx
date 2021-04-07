import React, { useState } from 'react';
import {Text,View,Image,FlatList,ListRenderItem} from 'react-native'
import {Icon, Input,ListItem,Avatar,Header} from 'react-native-elements'
import LinearGradient from 'react-native-linear-gradient'
import constatnts from '../constants';
import * as SecureStore from 'expo-secure-store';
import {group_item, searchUsersResponse, user,drawerNavigationParamList} from '../interfaces/interfaces'
import { DrawerNavigationProp } from  '@react-navigation/drawer'

interface Props{
    addRequestContact : (contact : group_item)=>void,
    navigation : DrawerNavigationProp<drawerNavigationParamList,'SearchUsers'> 
}
interface State{
    loadStatus : LoadState,
    value : string,
    users : searchUsersResponse[]
}
type LoadState  = "notSearched" | "loading" | "loaded" | "error";


class SearchUser extends React.Component<Props,State>{


    constructor(props){
        super(props);
        this.state= {
            loadStatus : "notSearched",
            value : "",
            users : []
        }
    }

    render(){


        let getUsers = async ()=>{
            if( this.state.value.trim().length === 0){
                return;
            }
            let token = await SecureStore.getItemAsync('jwtToken');
            let header = new Headers({
                'Authorizaton' : `Bearer ${token}`,
                'Content-Type' : 'application/json'
            })  
            this.setState({
                loadStatus : "loading"
            })
            fetch(constatnts.urlWithoutNip + 'users/' + this.state.value, {
                ...constatnts.getOption,
                headers : header
            }).then(resp=>{
                if(resp.status !== 200)
                    throw new Error(resp.statusText);
                return resp.json();
            }).then(data=>{
                console.log(data);
                this.setState({
                    users : data,
                    loadStatus : "loaded"
                })
            }).catch(err=>{
                this.setState({
                    loadStatus : "error"
                })
                console.log(err);
            })
        }

        let changeText = (e) =>{
            this.setState({
                value : e
            })
        }

        let Loading = ()=>{
            return(
                <View>
                    <Text>
                        Fetching users...
                    </Text>
                </View>
            )
        }

        let OnError = () =>{
            return(
                <View>
                    <Text>
                        An error occurred
                    </Text>
                </View>
            )
        }

        let messageIconOnClick = (user:searchUsersResponse)=>{
            let requestContact : group_item = {
                ...constatnts.defaultGroup,
                group_id : (-1) * user.user_id,
                group_user_name : user.username,
                image : user.image,
                last_time : Date().toString()
            }
            this.props.addRequestContact(requestContact);
            this.props.navigation.navigate('Chat');
        }
        

        let renderItem : ListRenderItem<user> = ({item,index})=>{
            return(
                <ListItem containerStyle={{
                    backgroundColor : "transparent",
                    padding : 10,
                }}>
                    <Avatar rounded source={{
                        uri : constatnts.image64Prefix + item.image
                    }} size="medium" />
                    <ListItem.Content style={{
                        flexGrow : 1,
                        display : "flex",
                        flexDirection : "row"
                    }}>
                        <View style={{
                            display : "flex",
                            flexDirection : "row",
                            justifyContent : "space-between",
                            flexGrow : 1,
                        }}>
                            <ListItem.Title>{item.username}</ListItem.Title>
                            <View>
                                <Icon name="facebook-messenger" type="font-awesome-5"
                                onPress = {()=>messageIconOnClick(item)}
                                containerStyle={{
                                    padding : 5,
                                    marginRight : 5
                                }}   />    
                            </View>  
                        </View>
                    </ListItem.Content>
                </ListItem>
            )
        }

        return(
            // <View style={{
            //     height : "100%"
            // }}>
            //     <View  style={{
            //         height : 60,
            //         backgroundColor : "transparent"
            //     }}>
            //     </View>
            //     <View style={{
            //         flexGrow : 1
            //     }}>
                    <LinearGradient colors={['#d7ddd5','#0a8fa3']} style={{
                        flexGrow : 1,
                        display : "flex",
                        // shadowColor: '#000',
                        // shadowOffset: { width: 0, height: 2 },
                        // shadowOpacity: 0.5,
                        // shadowRadius: 2,
                        // elevation: 2,
                        
                    }}  >
                        {/* <Header centerComponent={
                        <Text style={{
                            // color : "white"
                        }}>
                            Search Users
                        </Text>}
                        style={{
                            alignSelf : 'flex-start',
                        }}
                        containerStyle={{
                            backgroundColor : "transparent"
                        }}

                        /> */}
                        <View style={{
                            height : 55,
                            justifyContent : "center"
                            // borderBottomWidth : .2,
                        }}>
                            <Text style={{
                                padding : 20, 
                                alignSelf : "flex-start",
                                fontSize : 20
                            }}>
                                Search Users
                            </Text>
                        </View>
                        <View style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.7,
                            shadowRadius: 2,
                            elevation: 1,
                            flexGrow : 1,
                            borderTopWidth : .2,
                            borderColor : "grey",
                            justifyContent : this.state.loadStatus !== 'loaded' ? "center" : "flex-start",

                            // backgroundColor : "red"
                            
                        }}>
                            <Input placeholder="search users" inputContainerStyle={{
                                borderColor : "white",
                                borderWidth : 1,
                                marginTop : 10,
                                alignSelf : "center",
                                marginStart : 10
                                
                            }} inputStyle={{
                                color : "white"
                            }} placeholderTextColor="white" 
                            rightIcon={
                                <Icon name="search" color = "white" style={{
                                    padding : 5
                                }} size={30} onPress={getUsers} />
                            }
                            value = {this.state.value}
                            onChangeText = {changeText}
                            />
                            {this.state.loadStatus === 'loading' && <Loading/>}
                            {this.state.loadStatus === 'loaded' &&
                                <FlatList renderItem={renderItem} data={this.state.users} keyExtractor={(item)=>item.user_id.toString()} />
                            }
                            {this.state.loadStatus === 'error' && <OnError /> }
                        </View>
                    </LinearGradient>
            //     </View>
            // </View>
        )
    }
}

export default SearchUser;