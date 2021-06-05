import React, { useState } from 'react';
import { Text,View,FlatList,ListRenderItem ,StyleSheet,TextInput,Image} from 'react-native'
import {NavigationContainer, RouteProp} from '@react-navigation/native'
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack'
import {group_item, group_member, messageInfoStackNavParamList, stackNavigationParamList, user} from '../interfaces/interfaces'
import {message} from '../interfaces/interfaces'
import constants from '../constants';
import * as SecureStore from 'expo-secure-store';
import LinearGradient from 'react-native-linear-gradient';
import {Icon, Input,Button, Avatar, ListItem} from 'react-native-elements'
import  {SelectMemberList,SelectedMembers,SelectedMemberItem} from './newGroup'
import WrapperList from './WrapperList';

const AddMember:React.FC<{
    groups : group_item[],
    route : RouteProp<stackNavigationParamList,'AddMember'>,
    modifyMembers : (groupId : number, members : group_member[]) => void
}> = (props)=>{

    const [selectedMembers, setSelectedMembers] = useState<group_item[]>([]);
    const [unselectedMembers, setunselectedMembers] = useState<group_item[]>(props.groups.filter(group => group.req == 0 && props.route.params.group_members.every(gr => gr.user_id != group.name_user_id)))

    const selectedOnPress = (id : number)=>{
        let group:group_item[] = props.groups.filter(gr => gr.group_id === id);
        setSelectedMembers(selectedMembers.filter(gr => gr.group_id != id));
        setunselectedMembers([...group,...unselectedMembers]);
    }

    const unselectedOnPress = (id : number)=>{
        let gr = props.groups.filter(gr => gr.group_id === id);
        setSelectedMembers([...selectedMembers, ...gr]);
        setunselectedMembers(unselectedMembers.filter(gr=>gr.group_id != id))
    }

    const sendAddMemberRequest = async ()=>{
        let token = await SecureStore.getItemAsync('jwtToken');
        let headers = new Headers({
            'Authorizaton' : `Bearer ${token}`,
            'Content-Type' : 'application/json'
        }) 

        let postOption = {
            ...constants.postOption,
            headers : headers, 
            body : JSON.stringify({
                new_members : selectedMembers.map(gr => gr.name_user_id)
            })
        }
        fetch(constants.url + 'groups/' +props.route.params.group_id + '/addmembers',postOption)
        .then(resp =>{
            if(resp.status === 200){
                return resp.json();
            }
            throw new Error('falied to add members ' + resp.statusText);
        })
        .then(data=>{
            props.modifyMembers(props.route.params.group_id, data['group_members']);
        })
        .catch(err =>{
            console.log(err);
        })
    }

    return(
        <WrapperList wrapperStyle = {{}}>
            <View>
                {selectedMembers.length !== 0 &&
                    <View>
                        <View  style={{
                            paddingLeft: 20,
                            paddingRight : 20,
                            // borderWidth : 1,
                            backgroundColor : '#097A8C',
                            margin : 5,
                            display : 'flex',
                            flexDirection : 'row',
                            alignItems : 'center',
                            justifyContent : 'space-between'
                            
                        }}>
                            <Text style={{
                                fontSize : 20,
                                color : 'white'
                            }}>
                                Selected Members
                            </Text>
                            <Button onPress = {()=>sendAddMemberRequest()} type = {'clear'} icon = {<Icon name='user-plus' type = 'feather' color='white' />} />
                        </View>
                            
                        
                        <SelectedMembers members={selectedMembers} removeFromSelected={selectedOnPress} />
                        
                        {/* <Button title='Add' containerStyle={{
                            width : 100,
                            alignSelf : 'flex-end'
                        }}/> */}
                    </View>}
                    {
                        unselectedMembers.length !== 0 &&
                        <View>
                            <View  style={{
                                paddingLeft: 20,
                                paddingRight : 20,
                                paddingTop : 6,
                                paddingBottom : 6,
                                // borderWidth : 1,
                                backgroundColor : '#097A8C',
                                margin : 5,
                                
                            }}>
                                <Text style={{
                                    fontSize : 20,
                                    color : 'white'
                                }}>
                                    Select New Members
                                </Text>
                            </View>
                        <SelectMemberList members = {unselectedMembers} addToSelected = {unselectedOnPress} />
                        {/* <SelectMemberList members = {unselectedMembers} addToSelected = {unselectedOnPress} /> */}
                    </View>}
            </View>
        </WrapperList>
    )
}

export default AddMember;