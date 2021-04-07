import React from 'react';
import { ScrollView, Text, Image, View, StyleSheet, FlatList, ListRenderItem } from 'react-native'
import { Avatar, Badge, Icon, ListItem } from 'react-native-elements'
import { group_item, user, stackNavigationParamList, tabNavigatorProps } from '../interfaces/interfaces'
import { StackNavigationProp } from '@react-navigation/stack'
import LinearGradient from 'react-native-linear-gradient';
import constatnts from '../constants';
import { createBottomTabNavigator, BottomTabBarProps, BottomTabBarOptions } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

interface Props {
    groups: group_item[],
    user: user,
    navigation: StackNavigationProp<stackNavigationParamList, 'contactList'>,
    changeSelected: (group: group_item) => void,
    requests: group_item[]
}

const ContactTab: React.FC<{
    renderItem: ListRenderItem<group_item>,
    groups: group_item[]
}> = (props) => {
    return (
        <FlatList<group_item> data={props.groups} renderItem={props.renderItem} keyExtractor={(group) => group.group_id.toString()}
            style={styles.flatList} />
    )
}

const RequestTab: React.FC<{
    renderItem: ListRenderItem<group_item>,
    requests: group_item[]
}> = (props) => {
    return (
        <FlatList<group_item> data={props.requests} renderItem={props.renderItem} keyExtractor={(group) => group.group_id.toString()}
            style={styles.flatList} />
    )
}

const TabBar:React.FC<{
    navigation : BottomTabBarProps<BottomTabBarOptions>
}> = (props) =>{
    return(
        <View style = {{
            display : "flex",
            flexDirection : "row",
            justifyContent : "space-between"
        }}>
            <Text style={{padding : 10}} onPress={()=>props.navigation.navigation.navigate("Contact")}>Contacts</Text>
            <Text style={{padding : 10}} onPress={()=>props.navigation.navigation.navigate("Requests")}> Requests</Text>
        </View>
    )
}

const TabContainer: React.FC<{
    returnRenderItemFunc : (request : boolean)=>ListRenderItem<group_item>,
    requests: group_item[],
    groups: group_item[]
}> = (props) => {
    const Tab = createBottomTabNavigator<tabNavigatorProps>();
    return (
        <NavigationContainer independent={true}>
            <Tab.Navigator
                tabBar= {props => <TabBar navigation={props}  />}
                sceneContainerStyle={{
                    backgroundColor : "transparent"
                }}
                initialRouteName="Contact" 
            >
                <Tab.Screen name="Contact"  >
                    {propsT => <ContactTab {...propsT} renderItem={props.returnRenderItemFunc(false)} groups={props.groups} />}
                </Tab.Screen>
                <Tab.Screen name="Requests">
                    {propsT => <RequestTab {...propsT} renderItem={props.returnRenderItemFunc(true)} requests={props.requests} />}
                </Tab.Screen>
            </Tab.Navigator>
        </NavigationContainer> 
    )
}

const Contact: React.FC<Props> = (props) => {

    let returnRenderItemFunc : (request : boolean)=>ListRenderItem<group_item> = (request:boolean)=>{

        let onClickItem = (item: group_item) => {
            props.changeSelected(item);
            props.navigation.navigate("Messages", {
                group_id: item.group_id,
                request : request
            })
        }
        // console.log(props);
        let renderItem: ListRenderItem<group_item> = ({ item }) => {

            let lastMessageUserName: String;
            if (item.last_message_user_id === props.user.user_id) {
                lastMessageUserName = props.user.username;
            }
            else if (item.last_message_user_id === item.name_user_id) {
                lastMessageUserName = item.group_user_name;
            }
            else lastMessageUserName = null;


            return (
                <ListItem containerStyle={{
                    backgroundColor: "transparent",
                    padding: 10,
                }} 
                onPress={() => onClickItem(item)} underlayColor="rgba(255,255,255,.5)" 
                >
                    <Avatar rounded source={{
                        uri: constatnts.image64Prefix + item.image
                    }} size="medium" title={item.group_user_name} />

                    <Badge status="success" containerStyle={{
                        marginRight: -30,
                        right: 25,
                        bottom: -12
                    }} badgeStyle={item.active ? {
                        height: 14,
                        width: 14,
                        borderWidth: 2.5,
                        borderRadius: 10
                    } : {
                            height: 14,
                            width: 14,
                            borderWidth: 2.5,
                            borderRadius: 10,
                            backgroundColor: "transparent",
                            borderColor: "transparent"
                        }} />

                    <ListItem.Content >
                        <ListItem.Title>
                            {item.group_user_name}
                        </ListItem.Title>
                        <ListItem.Subtitle style={{ fontWeight: item.bold ? "bold" : "normal" }}>
                            {lastMessageUserName && lastMessageUserName + ": " + item.message}
                        </ListItem.Subtitle>

                    </ListItem.Content>

                </ListItem>
            )
        }
        return renderItem;
    }

    return (
        <LinearGradient colors={['#d7ddd5', '#0a8fa3']} style={{ display: "flex", height: "100%" }} >
            <TabContainer groups={props.groups} requests={props.requests} returnRenderItemFunc={returnRenderItemFunc} />
        </LinearGradient>
    )
}

let styles = StyleSheet.create({
    image: {
        width: 60,
        height: 60,
        borderRadius: 30
    },
    contactListContainer: {
        backgroundColor: "red"
    },
    contactItem: {
        display: "flex",
        flexDirection: "row",
        padding: 4,
        margin: 5,
        // backgroundColor : "rgba(255,255,255,.3)",
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#6fffe9"
    },
    nameMessageContainer: {
        margin: 2,
        flex: 1,
        marginLeft: 4,
        // backgroundColor : "green"
        // backgroundColor : "red"
    },
    flatList: {
        // backgroundColor : "linear-gradient(0deg, hsla(188, 88%, 34%, 1) 0%, hsla(105, 11%, 85%, 1) 100%);",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "transparent"
        // height : "100%"
    },
    nameContainer: {
        margin: 2,
        // backgroundColor : "red"
    },
    nameText: {
        fontSize: 16,
        fontWeight: "bold",
        alignSelf: "flex-start"

    },
    messageContainer: {
        margin: 2,
        flex: 1,
        // backgroundColor : "blue"
    },
    messageText: {

    },
    inActiveBadgeStyle: {
        backgroundColor: "transparent",
        borderWidth: 0,

    }
})

export default Contact;