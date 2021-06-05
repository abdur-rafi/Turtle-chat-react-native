
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {FlatList, StyleProp, ViewStyle} from 'react-native';
import {StyleSheet} from 'react-native';

const WrapperList : React.FC<{
    wrapperStyle? : StyleProp<ViewStyle>
}> = (props)=>{
    
    return (
        <LinearGradient colors={['#d7ddd5','#0a8fa3']} style={{
            display : 'flex',
            flexDirection : 'column',
            height : '100%',
            ...StyleSheet.flatten(props.wrapperStyle)
            
        }} >
            <FlatList style={{
                backgroundColor : 'transparent'
            }} listKey={'wrapperList'} data={[]} keyExtractor={()=>'a'} renderItem = {null} ListHeaderComponent = {() => <React.Fragment>{props.children}</React.Fragment>}/>
        </LinearGradient>
    )
}

export default WrapperList;