import React from 'react';
import { Text,View,FlatList,ListRenderItem} from 'react-native'
import {RouteProp} from '@react-navigation/native'
import {StackNavigationProp} from '@react-navigation/stack'
import {group_item, group_member,  stackNavigationParamList} from '../interfaces/interfaces'
import constants from '../constants';
import {Icon, Input,Button, Avatar, ListItem} from 'react-native-elements'
import WrapperList from './WrapperList'

const renderItem : ListRenderItem<group_member> = ({item}) =>{
    return (
        <ListItem containerStyle={{
            backgroundColor: "transparent",
            padding: 3,
        }} 
         underlayColor="rgba(255,255,255,.5)" 
        >
            <Avatar rounded source={{
                uri: constants.image64Prefix + item.image
            }} size="medium" title={item.username} />
            <ListItem.Content >
                <ListItem.Title>
                    {item.username}
                </ListItem.Title>
            </ListItem.Content>
        </ListItem>
    )
} 


const GroupInfo:React.FC<{
    route : RouteProp<stackNavigationParamList,'GroupInfo'>,
    groups : group_item[],
    navigation : StackNavigationProp<stackNavigationParamList,'GroupInfo'>,
}> = (props)=>{
    
    const addUserOnPress:(gr : group_item) =>void = (gr)=>{
        props.navigation.navigate('AddMember',gr);
    }

    return(
        <WrapperList>
            <View style={{
                display : "flex",
                alignItems : "center",
                flexDirection : "column",
                margin : 20
            }}>
                <Avatar rounded size = "large" source={{
                    uri : constants.image64Prefix + props.route.params.image
                }} />
                <Text style={{
                    fontWeight : "bold",
                    fontSize : 20 ,
                    marginTop : 20
                }}>
                    {props.route.params.group_user_name}
                </Text>
            </View>
            <View>
                <View style={{
                    paddingLeft: 20,
                    paddingRight : 20,
                    // backgroundColor : 'red',
                    display : 'flex',
                    flexDirection : 'row',
                    justifyContent : 'space-between',
                    alignItems : 'center',
                    // borderWidth : 1,
                    backgroundColor : '#097A8C',
                    margin : 5,
                    
                }}>
                    <Text style={{
                        fontSize : 20,
                        color : 'white'
                    }}>
                        Members
                    </Text>
                    <Button onPress = {()=>addUserOnPress(props.route.params)} type = {'clear'} icon = {<Icon name='user-plus' type = 'feather' color='white' />} />
                </View>
                <View style={{
                    margin : 15
                }}>
                    <FlatList<group_member> listKey={'groupInfoGroupMembersList'} data={props.route.params.group_members} renderItem = {renderItem} keyExtractor = {(item)=>item.user_id.toString()} />

                </View>
            </View>
            {/* <AddMember groups={props.groups} selected={props.route.params} /> */}
        </WrapperList>
        
    )
}

export default GroupInfo;