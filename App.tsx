import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-elements'
import Login from './Components/Login';
import * as SecureStore from 'expo-secure-store';
import Chat from './Components/Chat';
import constants from './constants';
import {CredentialState} from './interfaces/interfaces'


export default class App extends React.Component<{},{
  credentialState : CredentialState,
  token : string
}> {

  constructor(props){
    super(props);
    this.state = {
      credentialState : 'searchingToken',
      token : null
    }
    this.changeCredentialState = this.changeCredentialState.bind(this);
    this.setToekn = this.setToekn.bind(this);
  }

  setToekn(token:string){
    this.setState({
      token : token
    })
  }

  changeCredentialState(state:CredentialState){
    this.setState({
      credentialState : state
    })
  }

  componentDidMount(){
    SecureStore.getItemAsync('jwtToken')
    .then(token => {
      console.log(token);
      if (token) {
        let headers = new Headers({
          'Authorizaton': `Bearer ${token}`,
          'Content-Type': 'application/json'
        })
        this.setState({
          credentialState : 'tokenFound'
        })
        // setCredentialState('tokenFound');
        fetch(constants.urlWithoutNip + 'users', {
          ...constants.getOption,
          headers: headers
        })
          .then(resp => {
            if (resp.status === 200) {
              this.setState({
                token : token,
                credentialState : 'loggedIn'
              })
              // setJwtToken(token);
              // setCredentialState('loggedIn');
            }
            else if (resp.status === 401) {
              console.log("unauthorized token");
              this.setState({
                credentialState : "invalidToken"
              })
              this.setState({
                credentialState : "showLinks"
              })
              // setCredentialState('invalidToken');
            }
            else
              throw new Error(resp.statusText);
          })
          .catch(err => {
            console.log(err);
            this.setState({
              credentialState : 'noTokenFound'
            })
            this.setState({
              credentialState : 'showLinks'
            })
            // setCredentialState('noTokenFound');
            // setCredentialState('showLinks');
          })
      }
      else {
        this.setState({
          credentialState : 'noTokenFound'
        })
        this.setState({
          credentialState : 'showLinks'
        })
        // setCredentialState('noTokenFound');
        // setCredentialState('showLinks');
      }
    })
  }

  


  render(){


    let SearchingToken = () => (
    <View>
      <Text>
        Searching For Credential Token...
              </Text>
    </View>
  )

  let TokenFound = () => (
    <View>
      <Text>
        Token Found. Verifying token...
              </Text>
    </View>
  )

  let NoTokenFound = () => (
    <View>
      <Text>
        No token found. Please Signin/SignUp to continue
      </Text>
    </View>
  )

  let InvalidToken = () => (
    <View>
      <Text>
        Invalid Token. Please Signin/SignUp to continue
              </Text>
    </View>
  )
    return (
      <View style={{
        // backgroundColor : "red", 
        height : "100%"
      }}>
        {this.state.credentialState === 'searchingToken' && <SearchingToken />}
        {this.state.credentialState === 'tokenFound' && <TokenFound />}
        {this.state.credentialState === 'noTokenFound' && <NoTokenFound />}
        {this.state.credentialState === 'invalidToken' && <InvalidToken />}
        {this.state.credentialState === 'showLinks' && <Login setToken={this.setToekn} changeCredentialState={this.changeCredentialState} />}
        {this.state.credentialState === 'loggedIn' && <Chat />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center'
  },
});
