import React from 'react'
import {View, Text, FlatList, ListRenderItem, Image} from 'react-native'
import {Button, Input, ListItem, Avatar, Badge} from 'react-native-elements'
import LinearGradient from 'react-native-linear-gradient';
import { group_item, group_member} from '../interfaces/interfaces'
import constants from '../constants';
import { ScrollView } from 'react-native-gesture-handler';
import constatnts from '../constants';
import * as SecureStore from 'expo-secure-store';


const SelectedMemberItem:React.FC<{
    member : group_item,
    removeFromSelected : (memberId : number) => void
}> = (props)=>{
    return(
        <View key={props.member.group_id.toString()} style={{
            padding : 2
        }}>
            <Avatar rounded size="medium" source={{
                uri : constants.image64Prefix + props.member.image
            }} containerStyle={{
                borderWidth : 1,
                borderColor : 'white'
            }} onPress = {() => props.removeFromSelected(props.member.group_id)} >
                
            </Avatar>
        </View>
    )
}


const SelectedMembers:React.FC<{
    members : group_item[],
    removeFromSelected : (memberId : number) => void
}> = (props)=>{

    return(
        <View style={{
            display:"flex",
            flexDirection:"row",
            flexWrap : 'wrap', 
            alignItems : 'flex-start',
            justifyContent : 'center' 
        }}>
            {props.members.map(group=><SelectedMemberItem removeFromSelected = {props.removeFromSelected} member={group} key={group.group_id.toString()}/>)}
        </View>
    )
    
}


const SelectMemberList:React.FC<{
    members : group_item[],
    addToSelected : (memberId:number)=>void
}> = (props)=>{

    const renderContactItem : ListRenderItem<group_item> = ({item}) =>{

        return (
            <ListItem containerStyle={{
                backgroundColor: "transparent",
                padding: 10,
            }} 
             underlayColor="rgba(255,255,255,.5)" 
            onPress = {()=>props.addToSelected(item.group_id)}
            >
                <Avatar rounded source={{
                    uri: constants.image64Prefix + item.image
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
                </ListItem.Content>
    
            </ListItem>
        )
    } 
    
    return(
        <FlatList<group_item> data={props.members} renderItem={renderContactItem} 
        keyExtractor={(group) => group.group_id.toString()}
        />
    )
}

interface Props{
    groups : group_item[],
    addGroup : (group:group_item)=> void,
    addMembersToGroup : (members:group_member[] ,group_id:number) =>void
}
interface State{
    selectedMembers:group_item [],
    groupName : string,
    errorText : string
}



class NewGroup extends React.Component<Props,State>{
    constructor(props:Props){
        super(props);
        this.state = {
            selectedMembers : [],
            groupName : '',
            errorText : ''
        }
        this.addToSelected = this.addToSelected.bind(this);
        this.removeFromSelcted = this.removeFromSelcted.bind(this);
        this.sendCreateGroupRequest = this.sendCreateGroupRequest.bind(this);
        this.setGroupName = this.setGroupName.bind(this);
    }

    async sendCreateGroupRequest(){
        if(this.state.groupName.trim().length === 0){
            this.setState({
                errorText : 'Give a group name'
            })
        }
        


        let token = await SecureStore.getItemAsync('jwtToken');
        let headers = new Headers({
            'Authorizaton' : `Bearer ${token}`,
            'Content-Type' : 'application/json'
        }) 

        let postOption = {
            ...constatnts.postOption,
            headers : headers, 
            body : JSON.stringify({
                group_name : this.state.groupName,
                // group_image : ''
            })
        }

        fetch(constatnts.url + 'groups/newgroup',postOption)
        .then(resp =>{
            if(resp.status === 200){
                return resp.json()
            }
            console.log(resp)
            throw new Error('Failed to create new Group ' + resp.statusText)
        })
        .then(data => {
            this.props.addGroup(data.group);
            let newMembers:number[] = this.state.selectedMembers.map(group => group.name_user_id);
            let groupId: number = data.group.group_id;
            fetch(constants.url + 'groups/' + groupId +  '/' + 'addmembers',{
                ...postOption,
                body : JSON.stringify({
                    new_members : newMembers
                })
            })
            .then(resp=>{
                if(resp.status === 200){
                    return resp.json();
                }
                throw new Error("Failed to add members " + resp.status);
            })
            .then(data=>{
                let groupMembers : group_member[] = data.group_members;
                this.props.addMembersToGroup(groupMembers, groupId);
                this.setState({
                    groupName : '',
                    selectedMembers : []
                })
            })
            .catch(err=>{
                console.log(err);
            })
        })
        .catch(err=>{
            console.log(err);
        })
    }

    setGroupName(name:string){
        this.setState({
            groupName : name,
            errorText : ''
        })
    }


    addToSelected(memberId:number){
        if(!this.state.selectedMembers.some(group => group.group_id === memberId)){
            let selected = this.props.groups.filter(group => group.group_id === memberId)[0]
            this.setState(old =>({
                selectedMembers : [...old.selectedMembers, selected]
            }))
        }
    }

    removeFromSelcted(memberId : number){
        if(this.state.selectedMembers.some(group => group.group_id === memberId)){
            let selected = this.props.groups.filter(group => group.group_id === memberId)[0]
            this.setState(old =>({
                selectedMembers : old.selectedMembers.filter(group => group.group_id != memberId)
            }))
        }
    }

    render(){
        return(
            <LinearGradient colors={['#d7ddd5','#0a8fa3']} style={{
                flexGrow : 1,
                display : "flex"
            }}  >
                <ScrollView style={{
                    height : 80
                }}>
                <View style={{
                    height : 55,
                    justifyContent : "center"
                }}>
                    <Text style={{
                        padding : 20, 
                        alignSelf : "flex-start",
                        fontSize : 20
                    }}>
                        Create New Group
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
                    
                }}>
                    <View style={{
                        display : "flex",
                        alignItems : "center",
                        flexDirection : "column",
                        margin : 20
                    }}>
                        <Avatar rounded size = "large" source={require('../assets/images/default_group.png')} />
                        <Text style={{
                            fontWeight : "bold",
                            fontSize : 20 
                        }}>
                            Create New Group
                        </Text>
                    </View>

                    <View>
                        
                        <Input placeholder = 'group name' containerStyle={{
                            paddingLeft : 20,
                            paddingRight : 20
                        }} onChangeText = {this.setGroupName} value = {this.state.groupName} errorMessage = {this.state.errorText} />
                        <View>

                        </View>
                    </View>

                    {this.state.selectedMembers.length !== 0 &&
                        <View style={{
                            margin : 10
                            
                        }}>
                        <Text style={{
                            fontWeight : "bold",
                            fontSize : 18,
                            textAlign : "center"
                        }}>
                            Selected Members
                        </Text>
                    </View>}

                    { this.state.selectedMembers.length !== 0 &&
                        <View style={{
                        // flexGrow:1,
                        // background Color : 'red', 
                        padding : 5,
                        margin : 5
                    }}>
                        <SelectedMembers removeFromSelected = {this.removeFromSelcted} members={this.state.selectedMembers} />
                    </View>}

                    <View style = {{
                        margin : 10
                    }}>
                        <Text style = {{
                            fontSize : 18,
                            fontWeight : "bold",
                            textAlign : "center"
                        }}>
                            Add Members
                        </Text>
                    </View>

                    <SelectMemberList addToSelected = {this.addToSelected}
                        members={this.props.groups.filter(group => (group.req == 0) && !this.state.selectedMembers.some(gr=>gr.group_id == group.group_id) )} />

                    

                </View>
                </ScrollView>
                <Button title = "Create group" containerStyle={{
                        // marginBottom : 20,
                        padding : 30
                        
                    }} onPress = {this.sendCreateGroupRequest} />
            </LinearGradient>
        )
    }
}

export default NewGroup;