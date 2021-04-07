import React, { useEffect, useState } from 'react'
import {View,Text,TextInput,StyleSheet,Linking} from 'react-native'
import {Button,Icon} from 'react-native-elements'
import * as SecureStore from 'expo-secure-store';
import constatnts from '../constants';
import {CredentialState} from '../interfaces/interfaces'
import LinearGradient from 'react-native-linear-gradient'
interface Props{
    changeCredentialState : (state : CredentialState)=>void,
    setToken : (token:string)=>void
}


const Login : React.FC<Props> = (props)=>{


    let linking = Linking;
    linking.addEventListener('url', (e)=>{
        console.log(e.url);
        let url = "msrm42app://msrm42app.io?id=";
        let token = e.url.substr(url.length);
        let index = -1;
        token = token.slice(0,-1);
        for(let i = 0; i < token.length; ++i){
            if(token[i] == '#'){
                index = i;
            }
        }
        if(index > -1){
            token = token.slice(0,index);
        }
        console.log(token);
        SecureStore.setItemAsync("jwtToken",token)
        .then(()=>{
            props.setToken(token);
            props.changeCredentialState('loggedIn');
        })
        .catch(err=>{
            console.log("Error in setting token,"+ err);
        })
    })

    let googleButtonOnClick = (path:string)=>{
        let onCLick = ()=>{
            linking.openURL(constatnts.url + 'google-react-native/' + path)
            .catch(err=>{
                console.log(err);
            })
        }
        return onCLick;
    }
    let facebookButtonOnClick = (path:string)=>{
        let onCLick = ()=>{
            linking.openURL(constatnts.url + 'facebook-react-native/' + path)
            .catch(err=>{
                console.log(err);
            })
        }
        return onCLick;
    }

    let googleButton: (onCick:()=>void)=>React.ReactElement = (onClick)=>{
        return(
            <View>
                <Icon 
                    name="google-plus"
                    type="font-awesome"
                    color="#008b8b"
                    size={60}
                    onPress={onClick}
                />
            </View>
        )
    }

    let facebookButton:(onClick:()=>void)=>React.ReactElement = (onClick)=>{
        return(
            <View>
                <Icon 
                name="facebook"
                type="font-awesome"
                color = "#008b8b"
                size={60}
                onPress = {onClick}
                />
            </View>
        )
    }


    let loginButtonHeaderText : 
    (text:string,containerStyle:Object,textStyle:Object)=>React.ReactElement =
     (text,containerStyle,textStyle)=>{
        return(
            <View style={containerStyle}>
                <Text style={textStyle} >{text}</Text>
            </View>
        )
    }



    let renderPlace = ()=>{
        return(
            <LinearGradient colors={['#c8efd6','#f5bdd6','#aac8e9']} style={{
                flexGrow : 1,
                display : "flex"
            }}>
                <View style={{
                    display : "flex",
                    flexDirection : "row",
                    flexGrow : 1,
                    alignSelf : "center"
                }}>
                    <View style={{
                        flex : 1,
                        justifyContent : "center",
                        alignItems : "center",
                        borderRightWidth : 1,
                        backgroundColor : "black"
                    }}>

                        {loginButtonHeaderText("Login",{},{
                            color : "white",
                            fontSize : 25,
                            fontWeight : "bold"
                            
                        })}
                        
                        <View style={{
                            padding : 20,
                            margin : 10
                        }}>
                            {googleButton(googleButtonOnClick("login"))}

                        </View>
                        <View style={{
                            padding : 20,
                            margin : 10
                        }}>
                            {facebookButton(facebookButtonOnClick('login'))}

                        </View>
                        

                    </View>
                    <View style={{
                        flex : 1,
                        justifyContent : "center",
                        backgroundColor : "white",
                        alignItems : "center"
                    }}>

                        {loginButtonHeaderText("SignUp",{},{
                            color : "black",
                            fontSize : 25,
                            fontWeight : "bold"
                            
                        })}
                        <View style={{
                            padding : 20,
                            margin : 10
                        }}>
                            {googleButton(googleButtonOnClick("signup"))}

                        </View>
                        <View style={{
                            padding : 20,
                            margin : 10
                        }}>
                            {facebookButton(facebookButtonOnClick('signup'))}

                        </View>

                    </View>
                </View>
            </LinearGradient>
        )
    }

    return renderPlace();
} 

const styles = StyleSheet.create({
    webView : {
        width:400,
        height:40
    }
})

export default Login;