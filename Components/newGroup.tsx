import React from 'react'
import {View, Text} from 'react-native'
import {Button} from 'react-native-elements'
import LinearGradient from 'react-native-linear-gradient'
import { launchImageLibrary} from 'react-native-image-picker';

interface Props{

}
interface State{

}
class NewGroup extends React.Component<Props,State>{
    constructor(props){
        super(props);
        this.getPhotoFromGallery = this.getPhotoFromGallery.bind(this);
    }

    getPhotoFromGallery(){
        launchImageLibrary({
            mediaType : 'photo',
            maxWidth : 200,
            maxHeight : 200

        },(e)=>{
            console.log(e);
        })    
    }

    render(){
        return(
            <LinearGradient colors={['#d7ddd5','#0a8fa3']} style={{
                flexGrow : 1,
                display : "flex"
            }}  >
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
                    <Button onPress={()=>{
                        launchImageLibrary({
                            mediaType : 'photo',
                            maxWidth : 200,
                            maxHeight : 200
                
                        },(e)=>{
                            console.log(e);
                        })  
                    }} title="Pick Image" />

                </View>


            </LinearGradient>
        )
    }
}

export default NewGroup;